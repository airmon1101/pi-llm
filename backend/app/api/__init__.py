from fastapi import APIRouter
from app.api.routes import health, chat, system

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(system.router, tags=["system"])
