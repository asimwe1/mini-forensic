import os
import logging
from typing import Optional, Any, Dict, List
from pydantic_settings import BaseSettings, PydanticBaseSettingsSource, SettingsConfigDict
from pydantic import Field, field_validator, validator
from dotenv import load_dotenv
import json
import secrets
from enum import Enum

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
        return env_value, field_name, False

    def __call__(self) -> dict[str, Any]:
        d = {}
        for field_name, field in self.cls.__fields__.items():
            value, key, _ = self.get_field_value(field_name, field, field_info=None)
            if value is not None:
                d[field_name] = value
        return d

class EnvironmentType(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"

class Settings(BaseSettings):
    """Application settings with environment-specific configurations."""
    
    # Environment
    ENVIRONMENT: EnvironmentType = Field(
        default=EnvironmentType.DEVELOPMENT,
        env="ENVIRONMENT"
    )
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Logging
    LOG_DIR: str = Field(default="./logs", env="LOG_DIR")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Security
    SECRET_KEY: str = Field(default=None, env="SECRET_KEY")
    ALLOWED_HOSTS: List[str] = [
        "localhost",
        "127.0.0.1",
        "your-production-domain.com"  # Replace with your actual production domain
    ]
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./forensics_lab.db",
        env="DATABASE_URL"
    )
    
    # Elasticsearch
    ELASTICSEARCH_URL: str = Field(
        default="http://localhost:9200",
        env="ELASTICSEARCH_URL"
    )
    
    # File storage
    UPLOAD_DIR: str = Field(default="./uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE: int = Field(default=10_485_760, env="MAX_UPLOAD_SIZE")
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )
    
    # General settings
    PROJECT_NAME: str = Field(default="Mini Forensic", env="PROJECT_NAME")

    # Database settings
    DATABASE_URL: str = Field(default="sqlite:///./forensics_lab.db", env="DATABASE_URL")

    # Authentication settings
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # OAuth settings
    GITHUB_CLIENT_ID: str = Field(default="", env="GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str = Field(default="", env="GITHUB_CLIENT_SECRET")
    GITHUB_REDIRECT_URI: str = Field(default="http://localhost:8000/api/v1/auth/github/callback", env="GITHUB_REDIRECT_URI")
    
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(default="http://localhost:8000/api/v1/auth/google/callback", env="GOOGLE_REDIRECT_URI")
    
    # Frontend URL for redirects after authentication
    FRONTEND_URL: str = Field(default="http://localhost:3000/auth-callback", env="FRONTEND_URL")

    # File upload settings
    MAX_FILE_SIZES: Dict[str, int] = Field(
        default={
            "memory_dump": 4_294_967_296,  # 4GB
            "network_capture": 1_073_741_824,  # 1GB
            "document": 10_485_760,  # 10MB
        },
        description="Maximum file sizes in bytes per type"
    )

    # Restricted file types for security
    ALLOWED_FILE_TYPES: Dict[str, List[str]] = Field(
        default={
            "memory_dump": [
                "application/octet-stream"
            ],
            "network_capture": [
                "application/vnd.tcpdump.pcap",
                "application/x-pcapng"
            ],
            "document": [
                "application/pdf",
                "text/plain"
            ]
        },
        description="Allowed MIME types mapped to analysis types"
    )

    # High-risk file patterns
    MALICIOUS_PATTERNS: List[str] = Field(
        default=[
            r"(?i).*\.php\.jpg$",  # Hidden PHP code
            r"(?i).*\.asp\.png$",   # Hidden ASP code
            r"(?i).*\.jsp\.gif$",   # Hidden JSP code
            r"(?i).*\.exe\.",       # Executable with double extension
            r"(?i).*\.dll\.",       # DLL with double extension
        ],
        description="Regex patterns for potentially malicious files"
    )

    # Blocked file extensions for security
    BLOCKED_EXTENSIONS: list[str] = Field(
        default=[
            ".exe", ".dll", ".bat", ".cmd", ".ps1", ".vbs",
            ".js", ".jse", ".wsf", ".wsh", ".msc", ".hta",
            ".cpl", ".msi", ".msp", ".scr", ".reg", ".inf"
        ],
        description="List of blocked file extensions for security"
    )

    # Celery settings
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")

    # Cloudinary settings
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(default=None, env="CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: Optional[str] = Field(default=None, env="CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: Optional[str] = Field(default=None, env="CLOUDINARY_API_SECRET")
    CLOUDINARY_UPLOAD_PRESET: Optional[str] = Field(default=None, env="CLOUDINARY_UPLOAD_PRESET")
    CLOUDINARY_FOLDER: str = Field(default="forensic-lab", env="CLOUDINARY_FOLDER")

    # Report settings
    REPORT_DIR: str = Field(default="./reports", env="REPORT_DIR")

    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://your-production-domain.com"  # Replace with your actual production domain
    ]
    
    # Security settings
    RATE_LIMIT_PER_MINUTE: int = Field(default=10, env="RATE_LIMIT_PER_MINUTE")
    MAX_CONCURRENT_UPLOADS: int = Field(default=5, env="MAX_CONCURRENT_UPLOADS")

    # Rate limiting settings
    UPLOAD_RATE_LIMIT_TIMES: int = Field(
        default=10,
        description="Number of uploads allowed within the time window"
    )
    UPLOAD_RATE_LIMIT_SECONDS: int = Field(
        default=60,
        description="Time window in seconds for rate limiting"
    )
    API_RATE_LIMIT_TIMES: int = Field(
        default=100,
        description="Number of API calls allowed within the time window"
    )
    API_RATE_LIMIT_SECONDS: int = Field(
        default=60,
        description="Time window in seconds for API rate limiting"
    )

    # Session settings
    SESSION_SECRET_KEY: str = "your-secret-key-here"  # Replace with a secure secret key
    SESSION_COOKIE_NAME: str = "forensic_session"
    SESSION_COOKIE_SECURE: bool = True
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = "lax"

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
                if value.strip().startswith("["):
                    return json.loads(value)
                parsed = [ftype.strip() for ftype in value.split(",") if ftype.strip()]
                logger.debug(f"Parsed ALLOWED_FILE_TYPES as comma-separated: {parsed}")
                return parsed
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse ALLOWED_FILE_TYPES as JSON: {str(e)}. Using default.")
                return cls.__fields__["ALLOWED_FILE_TYPES"].default
        logger.debug(f"ALLOWED_FILE_TYPES passed through unchanged: {value}")
        return value

    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v: Optional[str], values: Dict[str, Any]) -> str:
        """Ensure SECRET_KEY is set in production."""
        env = values.get("ENVIRONMENT")
        if env == EnvironmentType.PRODUCTION:
            if not v:
                raise ValueError(
                    "SECRET_KEY must be set in production environment"
                )
            if len(v) < 32:
                raise ValueError(
                    "SECRET_KEY must be at least 32 characters in production"
                )
        return v or secrets.token_urlsafe(32)

    @field_validator("UPLOAD_DIR")
    def ensure_upload_dir(cls, value):
        """Ensure upload directory exists and has proper permissions."""
        os.makedirs(value, exist_ok=True)
        # Set directory permissions to 750 (rwxr-x---)
        os.chmod(value, 0o750)
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
        extra="ignore",
        settings_customise_sources=lambda self: (
            CustomEnvSettingsSource(self),
        )
    )

    def get_database_settings(self) -> Dict[str, Any]:
        """Get environment-specific database settings."""
        if self.ENVIRONMENT == EnvironmentType.TESTING:
            return {"DATABASE_URL": "sqlite:///./test.db"}
        return {
            "DATABASE_URL": self.DATABASE_URL,
            "POOL_SIZE": 5 if self.ENVIRONMENT == EnvironmentType.PRODUCTION else 1,
            "MAX_OVERFLOW": 10 if self.ENVIRONMENT == EnvironmentType.PRODUCTION else 0
        }

    def get_logging_config(self) -> Dict[str, Any]:
        """Get environment-specific logging configuration."""
        base_config = {
            "LOG_LEVEL": self.LOG_LEVEL,
            "LOG_DIR": self.LOG_DIR
        }
        
        if self.ENVIRONMENT == EnvironmentType.PRODUCTION:
            return {
                **base_config,
                "JSON_LOGGING": True,
                "SENTRY_DSN": os.getenv("SENTRY_DSN"),
                "LOG_ROTATION": True
            }
        return {
            **base_config,
            "JSON_LOGGING": False,
            "LOG_ROTATION": False
        }

# Instantiate settings
settings = Settings()

# Log successful configuration load
logger.info(f"Configuration loaded: PROJECT_NAME={settings.PROJECT_NAME}, ENVIRONMENT={settings.ENVIRONMENT}")