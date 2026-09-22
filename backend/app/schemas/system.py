from pydantic import BaseModel
from typing import List, Optional

class ServiceStatus(BaseModel):
    name: str
    status: str
    details: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    services: List[ServiceStatus]

class StorageInfo(BaseModel):
    total_gb: float
    used_gb: float
    free_gb: float
    usage_percent: float
    warning: bool

class StorageResponse(BaseModel):
    storage: StorageInfo

class SystemInfoResponse(BaseModel):
    hostname: str
    os: str
    architecture: str
    cpu_model: str
    cpu_cores: int
    ram_total_gb: float
    ram_available_gb: float
    storage: StorageInfo
    lan_ip: str
    version: str

class ModelInfo(BaseModel):
    name: str
    size: str
    modified_at: str

class ModelListResponse(BaseModel):
    models: List[ModelInfo]
