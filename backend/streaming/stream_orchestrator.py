"""Parallel fan-out orchestrator — runs 5 research categories concurrently."""

import json
import asyncio
import logging
import os
import re
from typing import AsyncGenerator, Dict, Any, List, Optional

from .tavily_stream import stream_tavily_research
from .event_handler import process_stream_event
from ..research_tasks import get_research_tasks, get_linkedin_task

logger = logging.getLogger(__name__)

CATEGORIES = [
    "company_info",
    "adverse_news",
    "risk_assessment",
    "products_services",
    "claims_history",
]

HIDDEN_CATEGORIES: list[str] = []

CATEGORY_LABELS = {
    "company_info": "Company Information",
    "adverse_news": "Adverse News",
    "risk_assessment": "Risk Assessment",
    "products_services": "Products & Services",
    "claims_history": "Claims History",
}


async def _research_category(
    category: str,
    query: str,
    output_schema: Dict[str, Any],
    api_key: str,
    event_queue: asyncio.Queue,
):
    """Run a single category research and push events onto the shared queue."""
    accumulated_content: Dict[str, str] = {}
    all_sources: List[Dict[str, Any]] = []

    try:
        async for event_data in stream_tavily_research(
            api_key=api_key,
            query=query,
            output_schema=output_schema,
        ):
            if isinstance(event_data, dict):
                if event_data.get("type") == "error":
                    await event_queue.put(
                        f'data: {json.dumps({"type": "error", "category": category, "message": event_data.get("message", "Unknown error")})}\n\n'
                    )
                    return

                for sse_event in process_stream_event(event_data, category, accumulated_content, all_sources):
                    await event_queue.put(sse_event)

        # De-duplicate sources by URL
        seen_urls = set()
        unique_sources = []
        for s in all_sources:
            url = s.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append({"title": s.get("title", ""), "url": url, "favicon": s.get("favicon")})

        # Parse accumulated content — try to JSON-decode string values
        parsed = {}
        for k, v in accumulated_content.items():
            try:
                parsed[k] = json.loads(v)
            except (json.JSONDecodeError, TypeError):
                parsed[k] = v

        await event_queue.put(
            f'data: {json.dumps({"type": "category_complete", "category": category, "data": parsed, "sources": unique_sources})}\n\n'
        )

    except Exception as e:
        logger.error(f"Error researching {category}: {e}")
        await event_queue.put(
            f'data: {json.dumps({"type": "error", "category": category, "message": str(e)})}\n\n'
        )


def _parse_leader_names(leadership_str: str) -> List[str]:
    """Extract person names from a semicolon-separated leadership string.

    Expected format: "CEO: Jane Doe; CFO: John Smith; SVP Operations: Alice Lee"
    """
    names: List[str] = []
    for entry in re.split(r"[;\n]", leadership_str):
        entry = entry.strip()
        if not entry:
            continue
        if ":" in entry:
            name = entry.split(":", 1)[1].strip()
        else:
            name = entry
        # Skip entries that look like placeholders or are empty
        if name and not name.lower().startswith("n/a"):
            names.append(name)
    return names


async def run_underwrite_research(
    company_name: str,
    location: Optional[str],
    api_key: str,
) -> AsyncGenerator[str, None]:
    """
    Fan-out 5 parallel Tavily Research streams and merge events into a single SSE stream.
    Once company_info completes, launch a follow-up LinkedIn lookup using the
    exact leader names discovered.
    """
    tasks_config = get_research_tasks(company_name, location)

    # Start event
    yield f'data: {json.dumps({"type": "start", "categories": list(CATEGORY_LABELS.values()), "company_name": company_name})}\n\n'

    event_queue: asyncio.Queue = asyncio.Queue()

    # Launch the 5 visible categories in parallel
    async_tasks = []
    for cat in CATEGORIES + HIDDEN_CATEGORIES:
        cfg = tasks_config[cat]
        task = asyncio.create_task(
            _research_category(
                category=cat,
                query=cfg["query"],
                output_schema=cfg["output_schema"],
                api_key=api_key,
                event_queue=event_queue,
            )
        )
        async_tasks.append(task)

    # Merge events from all categories
    active = set(range(len(async_tasks)))
    completed_categories: Dict[str, Dict[str, Any]] = {}
    all_category_sources: Dict[str, List[Dict[str, Any]]] = {}
    linkedin_launched = False

    while active:
        try:
            event = await asyncio.wait_for(event_queue.get(), timeout=0.1)

            # Track category_complete events for the final summary
            if event.startswith("data: "):
                try:
                    ev = json.loads(event[6:].strip())
                    if ev.get("type") == "category_complete":
                        cat = ev["category"]
                        completed_categories[cat] = ev.get("data", {})
                        all_category_sources[cat] = ev.get("sources", [])

                        # When company_info finishes, kick off the LinkedIn lookup
                        if cat == "company_info" and not linkedin_launched:
                            linkedin_launched = True
                            leadership_raw = ev.get("data", {}).get("leadership", "")
                            leader_names = _parse_leader_names(leadership_raw)
                            if leader_names:
                                cfg = get_linkedin_task(company_name, leader_names, location)
                                li_task = asyncio.create_task(
                                    _research_category(
                                        category="leadership_linkedin",
                                        query=cfg["query"],
                                        output_schema=cfg["output_schema"],
                                        api_key=api_key,
                                        event_queue=event_queue,
                                    )
                                )
                                async_tasks.append(li_task)
                                active.add(len(async_tasks) - 1)
                except (json.JSONDecodeError, KeyError):
                    pass

            yield event

        except asyncio.TimeoutError:
            done_indices = [i for i in active if async_tasks[i].done()]
            for i in done_indices:
                active.remove(i)

            if not active:
                # Drain remaining
                while not event_queue.empty():
                    try:
                        event = event_queue.get_nowait()
                        if event.startswith("data: "):
                            try:
                                ev = json.loads(event[6:].strip())
                                if ev.get("type") == "category_complete":
                                    cat = ev["category"]
                                    completed_categories[cat] = ev.get("data", {})
                                    all_category_sources[cat] = ev.get("sources", [])
                            except (json.JSONDecodeError, KeyError):
                                pass
                        yield event
                    except asyncio.QueueEmpty:
                        break
                break

    # Wait for all tasks
    await asyncio.gather(*async_tasks, return_exceptions=True)

    # Final complete event with all data
    yield f'data: {json.dumps({"type": "complete", "data": {"company_name": company_name, "location": location, **completed_categories}, "sources": all_category_sources})}\n\n'
