import logging
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict
from pythonjsonlogger import jsonlogger
from core.config import settings

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter for structured logging."""
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        
        # Add custom fields
        log_record.update({
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "environment": settings.ENVIRONMENT,
            "service": settings.PROJECT_NAME,
            "logger": record.name,
            "path": record.pathname,
            "line_number": record.lineno,
            "function": record.funcName
        })
        
        # Add request_id if available
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id

def setup_logging():
    """Configure application-wide logging."""
    # Create logs directory if it doesn't exist
    log_dir = Path(settings.LOG_DIR)
    log_dir.mkdir(exist_ok=True)

    # Base configuration
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": CustomJsonFormatter,
                "format": "%(timestamp)s %(level)s %(name)s %(message)s"
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "standard" if settings.DEBUG else "json",
                "stream": sys.stdout
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": log_dir / "app.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": log_dir / "error.log",
                "maxBytes": 10485760,
                "backupCount": 5,
                "level": "ERROR"
            }
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console", "file", "error_file"],
                "level": "DEBUG" if settings.DEBUG else "INFO"
            },
            "uvicorn": {
                "handlers": ["console", "file"],
                "level": "INFO",
                "propagate": False
            },
            "sqlalchemy": {
                "handlers": ["console", "file"],
                "level": "WARNING",
                "propagate": False
            }
        }
    }

    # Apply configuration
    logging.config.dictConfig(logging_config) 