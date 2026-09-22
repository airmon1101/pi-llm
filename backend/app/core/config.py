from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "gemma4:e2b"
    database_path: str = "../data/pillm.db"
    storage_warning_threshold: int = 85
    app_version: str = "1.0.0"
    default_system_prompt: str = "You are PiLLM, a helpful AI assistant running locally on a Raspberry Pi. Provide accurate, practical, and easy-to-understand answers. When answering technical questions, provide useful examples."
    default_temperature: float = 0.7
    default_max_tokens: int = 2048
    log_level: str = "INFO"

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

settings = Settings()
