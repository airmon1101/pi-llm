from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import logger
from app.db.database import init_db
from app.api import api_router
from fastapi.responses import JSONResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PiLLM backend...")
    await init_db()
    yield
    logger.info("Shutting down PiLLM backend...")

app = FastAPI(
    title="PiLLM API",
    description="Local AI Chat Server for Raspberry Pi 5",
    version=settings.app_version,
    lifespan=lifespan,
    docs_url='/api/docs',
    openapi_url='/api/openapi.json'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."}
    )
