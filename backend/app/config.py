from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://clinic_admin:secure_password_dev@localhost:5432/clinic_charges_db"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    environment: str = "local"
    debug: bool = False
    allowed_origins: str = "http://localhost:3000,http://localhost:4200"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
