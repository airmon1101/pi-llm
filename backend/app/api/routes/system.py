from fastapi import APIRouter
from app.schemas.system import SystemInfoResponse, StorageResponse, ModelListResponse, ModelInfo, StorageInfo
from app.services import system_service
from app.services.ollama_service import ollama_service

router = APIRouter()

@router.get("/api/models", response_model=ModelListResponse)
async def get_models():
    models_data = await ollama_service.list_models()
    models = [
        ModelInfo(
            name=m.get("name", "unknown"),
            size=str(m.get("size", "0")),
            modified_at=m.get("modified_at", "")
        ) for m in models_data
    ]
    return ModelListResponse(models=models)

@router.get("/api/system/info", response_model=SystemInfoResponse)
async def get_system_info_api():
    info = system_service.get_system_info()
    return SystemInfoResponse(**info)

@router.get("/api/system/storage", response_model=StorageResponse)
async def get_storage_api():
    info = system_service.get_storage_info()
    return StorageResponse(storage=StorageInfo(**info))
