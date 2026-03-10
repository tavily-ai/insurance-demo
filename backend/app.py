"""FastAPI server for the underwriter agent."""

import os
import sys
import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

# Ensure backend package is importable
backend_dir = Path(__file__).parent
project_dir = backend_dir.parent
if str(project_dir) not in sys.path:
    sys.path.insert(0, str(project_dir))

from backend.models import UnderwriteRequest
from backend.streaming import run_underwrite_research

load_dotenv(project_dir / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Insurance Underwriter Agent",
    description="AI-powered insurance underwriting research",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/underwrite/stream")
async def underwrite_stream(request: UnderwriteRequest, fastapi_request: Request):
    """Stream underwriting research results as SSE."""
    api_key = fastapi_request.headers.get("Authorization") or os.getenv("TAVILY_API_KEY")

    if not api_key:
        import json

        async def error_stream():
            yield f'data: {json.dumps({"type": "error", "message": "Tavily API key is required. Set TAVILY_API_KEY or pass Authorization header."})}\n\n'

        return StreamingResponse(error_stream(), media_type="text/event-stream")

    logger.info(f"Starting underwrite research for: {request.company_name} (location: {request.location})")

    return StreamingResponse(
        run_underwrite_research(
            company_name=request.company_name,
            location=request.location,
            api_key=api_key,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
