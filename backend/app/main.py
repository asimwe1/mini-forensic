import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from core.db import get_db, init_db
from core.config import settings
from api.endpoint import router as api_router
from services.memory_analysis import app_celery  # Celery instance shared across services
from models import File, User, Report, Task  # Assuming updated models
from pydantic import BaseModel
from core.db import get_db, init_db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, debug=settings.DEBUG)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)

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
@app.get("/files", response_model=List[dict])
def list_files(db: Session = Depends(get_db)):
    """List all uploaded files."""
    files = db.query(File).all()
    return [{"id": f.id, "filename": f.filename, "analysis_status": f.analysis_status} for f in files]

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    logger.info("Database initialized on startup")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)