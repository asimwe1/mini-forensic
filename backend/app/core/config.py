import os
import logging
from typing import Optional, Any
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict
from pydantic import Field, field_validator
from dotenv import load_dotenv
import json

# Load environment variables from a .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomEnvSettingsSource(PydanticBaseSettingsSource):
    """Custom source to handle env vars without forcing JSON parsing for lists."""
    def get_field_value(self, field_name: str, field: Field, field_info: Any) -> tuple[Any, str, bool]:
        env_value = os.getenv(field_name)
        logger.debug(f"Raw env value for {field_name}: {repr(env_value)}")
        return env_value, field_name, False  # False means don’t decode as JSON

    def __call__(self) -> dict[str, Any]:
        d = {}
        for field_name, field in self.cls.__fields__.items():
            value, key, _ = self.get_field_value(field_name, field, field_info=None)
            if value is not None:
                d[field_name] = value
        return d

class Settings(BaseSettings):
    """Application configuration settings with validation and defaults."""
    
    # General settings
    PROJECT_NAME: str = Field(default="Mini Forensic", env="PROJECT_NAME")
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")

    # Database settings
    DATABASE_URL: str = Field(default="sqlite:///./forensics_lab.db", env="DATABASE_URL")

    # Authentication settings
    SECRET_KEY: str = Field(default="your-secret-key", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # File upload settings
    UPLOAD_DIR: str = Field(default="./uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE: int = Field(default=10_485_760, env="MAX_UPLOAD_SIZE")  # 10 MB in bytes
    ALLOWED_FILE_TYPES: list[str] = Field(
        default=["text/plain", "application/pdf", "image/png", "image/jpeg"],
        # env="ALLOWED_FILE_TYPES"
    )

    # Celery settings
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")

    # Cloudinary settings
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(default=None, env="CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: Optional[str] = Field(default=None, env="CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: Optional[str] = Field(default=None, env="CLOUDINARY_API_SECRET")
    CLOUDINARY_UPLOAD_PRESET: Optional[str] = Field(default=None, env="CLOUDINARY_UPLOAD_PRESET")
    CLOUDINARY_FOLDER: str = Field(default="mini_forensic_uploads", env="CLOUDINARY_FOLDER")

    # Validators
    @field_validator("DEBUG", mode="before")
    def parse_debug(cls, value):
        """Convert string debug value to boolean."""
        if isinstance(value, str):
            return value.lower() in ("true", "1", "t")
        return value

    @field_validator("ALLOWED_FILE_TYPES", mode="before")
    def parse_allowed_file_types(cls, value):
        """Parse comma-separated file types or JSON from env var, with fallback."""
        logger.debug(f"Validator received ALLOWED_FILE_TYPES: {repr(value)}")
        if value is None or value == "":
            logger.debug("ALLOWED_FILE_TYPES is None or empty, using default")
            return cls.__fields__["ALLOWED_FILE_TYPES"].default
        if isinstance(value, str):
            try:
                # Try parsing as JSON if it looks like JSON
                if value.strip().startswith("["):
                    return json.loads(value)
                # Otherwise, treat as comma-separated
                parsed = [ftype.strip() for ftype in value.split(",") if ftype.strip()]
                logger.debug(f"Parsed ALLOWED_FILE_TYPES as comma-separated: {parsed}")
                return parsed
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse ALLOWED_FILE_TYPES as JSON: {str(e)}. Using default.")
                return cls.__fields__["ALLOWED_FILE_TYPES"].default
        logger.debug(f"ALLOWED_FILE_TYPES passed through unchanged: {value}")
        return value

    @field_validator("SECRET_KEY")
    def validate_secret_key(cls, value, info):
        """Warn if default secret key is used in production."""
        environment = info.data.get("ENVIRONMENT")
        if environment != "development" and value == "your-secret-key":
            logger.warning(
                "Using default SECRET_KEY in non-development environment! "
                "Please set a unique SECRET_KEY in production."
            )
        if len(value) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long for security")
        return value

    @field_validator("UPLOAD_DIR")
    def ensure_upload_dir(cls, value):
        """Ensure upload directory exists or create it."""
        os.makedirs(value, exist_ok=True)
        return value

    @field_validator("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")
    def validate_cloudinary(cls, value, info):
        """Ensure Cloudinary credentials are provided in production."""
        field_name = info.field_name
        environment = info.data.get("ENVIRONMENT")
        if environment != "development" and value is None:
            logger.warning(
                f"{field_name} is not set in non-development environment! "
                "Cloudinary functionality may fail without this."
            )
        return value

    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore extra env vars not in the model
        settings_customise_sources=lambda self: (
            CustomEnvSettingsSource(self),
        )
    )

# Instantiate settings
settings = Settings()

# Log successful configuration load
logger.info(f"Configuration loaded: PROJECT_NAME={settings.PROJECT_NAME}, ENVIRONMENT={settings.ENVIRONMENT}")