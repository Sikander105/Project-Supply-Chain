import os


class Settings:
    APP_NAME     = os.getenv("APP_NAME", "Supply Chain API")
    APP_VERSION  = os.getenv("APP_VERSION", "1.0.0")

    ENV          = os.getenv("ENV", "development")
    DEBUG        = os.getenv("DEBUG", "true").lower() == "true"

    API_PREFIX   = os.getenv("API_PREFIX", "/api")
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    # TODO: remember to add DATABASE_URL for real DB

    @property
    def cors_origins_list(self) -> list[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]


settings = Settings()