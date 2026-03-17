"""
Macroweaver — FastAPI Application Entry Point
==============================================

Start with:
    uvicorn backend.main:app --reload
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router

# Load environment variables from .env file
_env_file = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_file)

# ── App creation ──────────────────────────────────────────────────────────

app = FastAPI(
    title="Macroweaver",
    description=(
        "AI Economic Policy Advisor — simulate government policies "
        "and observe their macroeconomic effects."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────
# Allow the frontend (running on a different port/domain) to call the API.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────

app.include_router(router)


# ── Root redirect ─────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Welcome to Macroweaver — AI Economic Policy Advisor",
        "docs": "/docs",
    }
