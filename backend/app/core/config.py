from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    database_url: str

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    ai_ml_matching_url: str = "http://127.0.0.1:8000"
    ai_ml_recommendation_url: str = "http://127.0.0.1:8001"
    ai_ml_test_url: str = "http://127.0.0.1:8002"
    ai_ml_interview_url: str = "http://127.0.0.1:8003"
    ai_ml_monitoring_url: str = "http://127.0.0.1:8004"

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        extra="ignore"
    )


settings = Settings()

