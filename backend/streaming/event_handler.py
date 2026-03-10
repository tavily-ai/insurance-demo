"""Event handler for underwriting research streams — adds category tagging."""

import json
import logging
from typing import Dict, List, Any, Generator

logger = logging.getLogger(__name__)


def process_stream_event(
    event_data: Dict[str, Any],
    category: str,
    accumulated_content: Dict[str, str],
    all_sources: List[Dict[str, Any]],
) -> Generator[str, None, None]:
    """
    Process a single Tavily stream event, tag it with category, and yield SSE strings.
    """
    if event_data.get("object") == "error":
        error_msg = event_data.get("error", "Unknown error")
        yield f'data: {json.dumps({"type": "error", "category": category, "message": error_msg})}\n\n'
        return

    if "choices" not in event_data or len(event_data["choices"]) == 0:
        return

    delta = event_data["choices"][0].get("delta", {})

    # --- tool calls (Planning / WebSearch / Generating) ---
    if "tool_calls" in delta:
        tool_calls = delta["tool_calls"]
        if tool_calls.get("type") == "tool_call":
            for tc in tool_calls.get("tool_call", []):
                tool_name = tc.get("name", "Unknown")
                queries = tc.get("queries", [])

                if tool_name == "Planning":
                    yield f'data: {json.dumps({"type": "progress", "category": category, "message": "Planning research strategy..."})}\n\n'
                elif tool_name == "WebSearch":
                    n = len(queries) if queries else 0
                    yield f'data: {json.dumps({"type": "progress", "category": category, "message": f"Searching the web ({n} queries)..."})}\n\n'
                elif tool_name == "Generating":
                    yield f'data: {json.dumps({"type": "progress", "category": category, "message": "Generating research report..."})}\n\n'

        elif tool_calls.get("type") == "tool_response":
            for tr in tool_calls.get("tool_response", []):
                sources = tr.get("sources", [])
                if sources:
                    sources_data = [
                        {"title": s.get("title", ""), "url": s.get("url", ""), "favicon": s.get("favicon")}
                        for s in sources
                    ]
                    all_sources.extend(sources)
                    yield f'data: {json.dumps({"type": "sources_found", "category": category, "sources": sources_data})}\n\n'

    # --- content (structured output from output_schema) ---
    if "content" in delta:
        content = delta["content"]
        if isinstance(content, dict):
            for key, value in content.items():
                if key not in accumulated_content:
                    accumulated_content[key] = ""
                if isinstance(value, str):
                    accumulated_content[key] += value
                else:
                    accumulated_content[key] = str(value)

    # --- final sources list ---
    if "sources" in delta:
        final_sources = delta["sources"]
        all_sources.extend(final_sources)
