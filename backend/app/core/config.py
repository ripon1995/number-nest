from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", 'backend/.env'),
        env_file_encoding="utf-8",
    )

    database_url: str
    environment: str = "development"
    ALLOW_ORIGINS: list[str] = ["http://localhost:5173"]
    # jwt token settings
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 5
    jwt_refresh_token_expire_days: int = 1


settings = Settings()
