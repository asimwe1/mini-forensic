from fastapi import HTTPException, status
from typing import Any, Dict, Optional, Union
from enum import Enum
from app.core.enums import ErrorCode

class ErrorCode(str, Enum):
    """Standardized error codes for the application."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTH_ERROR"
    AUTHORIZATION_ERROR = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    FILE_ERROR = "FILE_ERROR"
    ANALYSIS_ERROR = "ANALYSIS_ERROR"
    DATABASE_ERROR = "DB_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class BaseAPIException(Exception):
    """Base exception for all API errors."""
    def __init__(
        self,
        error_code: ErrorCode,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        internal_error: Optional[Exception] = None
    ):
        self.error_code = error_code
        self.detail = detail
        self.status_code = status_code
        self.internal_error = internal_error

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary format."""
        return {
            "error_code": self.error_code,
            "detail": self.detail,
            "status_code": self.status_code
        }

# Specific exception classes
class FileAnalysisError(BaseAPIException):
    def __init__(self, detail: str, internal_error: Optional[Exception] = None):
        super().__init__(
            error_code=ErrorCode.ANALYSIS_ERROR,
            detail=detail,
            status_code=status.HTTP_400_BAD_REQUEST,
            internal_error=internal_error
        )

class ReportGenerationError(HTTPException):
    """Raised when there's an error during report generation."""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class AuthenticationError(HTTPException):
    """Raised when there's an authentication error."""
    def __init__(
        self,
        detail: str = "Could not validate credentials",
        status_code: int = status.HTTP_401_UNAUTHORIZED,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class FileValidationError(HTTPException):
    """Raised when a file fails validation."""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class RateLimitExceeded(HTTPException):
    """Raised when rate limit is exceeded."""
    def __init__(
        self,
        detail: str = "Rate limit exceeded",
        status_code: int = status.HTTP_429_TOO_MANY_REQUESTS,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class CloudinaryError(HTTPException):
    """Raised when there's an error with Cloudinary operations."""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class DatabaseError(HTTPException):
    """Raised when there's a database operation error."""
    def __init__(
        self,
        detail: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class WebSocketAuthError(Exception):
    """Raised when WebSocket authentication fails."""
    def __init__(self, message: str = "WebSocket authentication failed"):
        self.message = message
        super().__init__(self.message)

class AnalysisError(Exception):
    """Custom exception for analysis errors."""
    def __init__(self, message: str):
        super().__init__(message) 