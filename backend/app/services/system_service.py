import psutil
import socket
import platform
from app.core.config import settings

def get_system_info() -> dict:
    uname = platform.uname()
    svmem = psutil.virtual_memory()
    storage = get_storage_info()
    return {
        "hostname": uname.node,
        "os": uname.system,
        "architecture": uname.machine,
        "cpu_model": platform.processor(),
        "cpu_cores": psutil.cpu_count(logical=False) or psutil.cpu_count(logical=True) or 0,
        "ram_total_gb": round(svmem.total / (1024**3), 2),
        "ram_available_gb": round(svmem.available / (1024**3), 2),
        "storage": storage,
        "lan_ip": get_lan_ip(),
        "version": settings.app_version
    }

def get_storage_info() -> dict:
    usage = psutil.disk_usage('/')
    return {
        "total_gb": round(usage.total / (1024**3), 2),
        "used_gb": round(usage.used / (1024**3), 2),
        "free_gb": round(usage.free / (1024**3), 2),
        "usage_percent": usage.percent,
        "warning": check_storage_warning(settings.storage_warning_threshold)
    }

def get_lan_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def check_storage_warning(threshold: int) -> bool:
    usage = psutil.disk_usage('/')
    return usage.percent >= threshold
