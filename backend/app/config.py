from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/startup_analyzer"
    
    # Google Gemini
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"
    
    # Storage
    UPLOAD_DIR: str = "/tmp/uploads"
    VECTOR_STORE_DIR: str = "/tmp/vector_store"
    
    # Application
    APP_NAME: str = "Startup Analyzer AI"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()