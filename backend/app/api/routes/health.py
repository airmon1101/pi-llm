from fastapi import APIRouter
from app.schemas.system import HealthResponse, ServiceStatus
from app.services.ollama_service import ollama_service
from app.services.system_service import get_storage_info, check_storage_warning
from app.db.database import get_db
from app.core.config import settings
from app.core.logging import logger

router = APIRouter()

@router.get("/api/health", response_model=HealthResponse)
async def get_health():
    services = []

    # Check Ollama
    ollama_ok = False
    try:
        ollama_ok = await ollama_service.check_health()
    except Exception as e:
        logger.error(f"Ollama health check failed: {e}")
    services.append(ServiceStatus(
        name="ollama",
        status="online" if ollama_ok else "offline",
        details=None
    ))

    # Check model availability
    model_ok = False
    if ollama_ok:
        try:
            model_ok = await ollama_service.check_model(settings.ollama_model)
        except Exception:
            pass
    services.append(ServiceStatus(
        name="model",
        status="available" if model_ok else "unavailable",
        details=settings.ollama_model
    ))

    # Check database
    db_ok = False
    try:
        async with await get_db() as db:
            await db.execute("SELECT 1")
            db_ok = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
    services.append(ServiceStatus(
        name="database",
        status="connected" if db_ok else "disconnected",
        details=None
    ))

    # Check storage
    storage_warning = False
    try:
        storage_warning = check_storage_warning(settings.storage_warning_threshold)
    except Exception:
        pass
    services.append(ServiceStatus(
        name="storage",
        status="warning" if storage_warning else "healthy",
        details=None
    ))

    # Overall status
    all_ok = ollama_ok and model_ok and db_ok and not storage_warning
    degraded = ollama_ok and db_ok  # Core services work but model or storage issue

    if all_ok:
        overall = "ok"
    elif degraded:
        overall = "degraded"
    else:
        overall = "error"

    return HealthResponse(
        status=overall,
        version=settings.app_version,
        services=services
    )
