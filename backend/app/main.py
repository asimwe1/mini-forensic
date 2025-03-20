import logging
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import AsyncGenerator, List, Optional
from core.db import get_db, init_db
from core.config import settings, EnvironmentType
from api.endpoint import router as api_router
from services.memory_analysis import app_celery  # Celery instance shared across services
from models import File, User, Report, Task  # Assuming updated models
from pydantic import BaseModel
from contextlib import asynccontextmanager
from core.db import get_db, init_db
from fastapi.responses import JSONResponse
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.sessions import SessionMiddleware
import time
from core.auth import get_current_user, TokenData, create_access_token
from core.exceptions import FileAnalysisError, ReportGenerationError
from jose import JWTError, jwt
from datetime import datetime, timedelta
from core.logging_config import setup_logging
from api.filesystem import router as filesystem_router
from api import visualization, search
from core.websocket import websocket_manager
from core.error_handler import global_exception_handler
from api import realtime
from services.status_service import status_service
import redis.asyncio as redis
from redis.exceptions import ConnectionError
from api.auth_routes import router as auth_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize database on startup
@asynccontextmanager
async def lifespan(api: FastAPI):
    init_db()
    logger.info("Database initialized")
    await startup()
    yield
    logger.info("Shutdown complete")
    await shutdown_event()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Forensic Analysis API",
    version="1.0.0",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize rate limiter
@app.on_event("startup")
async def startup():
    try:
        redis_client = redis.from_url(settings.CELERY_BROKER_URL)
        await FastAPILimiter.init(
            redis=redis_client,
            prefix="fastapi-limiter"
        )
        logger.info("Rate limiter initialized successfully")
    except ConnectionError as e:
        logger.warning(f"Redis connection failed: {e}. Rate limiting will be disabled.")
        # Disable rate limiting by setting a very high limit
        app.dependency_overrides[RateLimiter] = lambda: None

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {str(exc)}", exc_info=True)
    
    if isinstance(exc, FileAnalysisError):
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, ReportGenerationError):
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )
    elif isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
    
    # For unexpected errors, return 500 in production, details in development
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc)}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

# Protected health check endpoint
@app.get("/api/health")
async def protected_health_check(current_user: TokenData = Depends(get_current_user)):
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "user": current_user.username
    }

app.include_router(api_router, prefix="/api")

# Add the filesystem router to the application
app.include_router(filesystem_router)

# Add new routers
app.include_router(visualization.router)
app.include_router(search.router)

# WebSocket connection manager
app.websocket_manager = websocket_manager

# Add status service
app.status_service = status_service

# Include realtime router
app.include_router(realtime.router)

# Add auth routes
app.include_router(auth_router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Mini Forensic API"}

# Task status endpoint
@app.get("/task-status/{task_id}")
def read_task_status(task_id: str):
    """Check the status of a Celery task."""
    task_result = app_celery.AsyncResult(task_id)
    if task_result.status == "FAILURE":
        raise HTTPException(status_code=500, detail="Task failed")
    return {"status": task_result.status, "result": task_result.result if task_result.ready() else None}

# File retrieval endpoint
@app.get("/files/{file_id}", response_model=dict)
def get_file(file_id: int, db: Session = Depends(get_db)):
    """Retrieve metadata for a specific file."""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "id": file.id,
        "filename": file.filename,
        "cloudinary_url": file.cloudinary_url,
        "file_type": file.file_type,
        "size": file.size,
        "analysis_status": file.analysis_status,
        "uploaded_at": file.uploaded_at
    }

# List all files endpoint
@app.get("/files", response_model=List[dict], dependencies=[Depends(RateLimiter(times=100, seconds=60))])
def list_files(db: Session = Depends(get_db)):
    """List all uploaded files."""
    files = db.query(File).all()
    return [{"id": f.id, "filename": f.filename, "analysis_status": f.analysis_status} for f in files]

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode")
    if settings.DEBUG:
        logger.warning("Running in DEBUG mode - this should not be used in production!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down application")
    await FastAPILimiter.close()

# Add session middleware
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY,
    session_cookie=settings.SESSION_COOKIE_NAME,
    max_age=3600,  # 1 hour
    same_site=settings.SESSION_COOKIE_SAMESITE,
    https_only=settings.SESSION_COOKIE_SECURE,
    http_only=settings.SESSION_COOKIE_HTTPONLY
)

# Add error handling middleware
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        logger.error(f"Unhandled error in middleware: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# Add request logging middleware
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} completed in {process_time:.2f}s")
    return response

# Force HTTPS in production
if not settings.DEBUG:
    app.add_middleware(HTTPSRedirectMiddleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)