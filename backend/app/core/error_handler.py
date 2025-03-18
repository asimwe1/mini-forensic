from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
import traceback
from core.exceptions import BaseAPIException

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for all endpoints."""
    error_response: Dict[str, Any] = {
        "success": False,
        "timestamp": datetime.utcnow().isoformat(),
        "path": request.url.path
    }

    if isinstance(exc, BaseAPIException):
        error_response.update({
            "error_code": exc.error_code,
            "detail": exc.detail,
            "status_code": exc.status_code
        })
        status_code = exc.status_code
    else:
        # Handle unexpected errors
        error_response.update({
            "error_code": "INTERNAL_ERROR",
            "detail": "An unexpected error occurred" if not settings.DEBUG else str(exc),
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        })
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        # Log the full error in development
        if settings.DEBUG:
            error_response["traceback"] = traceback.format_exc()

    # Log error
    logger.error(
        f"Error handling request: {request.url.path}",
        extra={
            "error_code": error_response["error_code"],
            "detail": error_response["detail"],
            "status_code": status_code,
            "method": request.method,
            "path": request.url.path,
            "client_host": request.client.host if request.client else None
        }
    )

    return JSONResponse(
        status_code=status_code,
        content=error_response
    ) 