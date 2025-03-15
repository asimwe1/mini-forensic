import logging
import json
from fastapi import APIRouter, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from core.config import settings
from models import File, FileAnalysis, MemoryAnalysis, NetworkAnalysis, Report, Task
from services.memory_analysis import analyze_memory_task
from services.network_analysis import analyze_network_task
from services.file_analysis import analyze_file, analyze_directory_task
import cloudinary.uploader
import magic  # Ensure python-magic is installed
from pydantic import BaseModel
from typing import Optional  # No need for List import in Python 3.9+

logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

# Response models
class FileResponse(BaseModel):
    message: str
    file_id: int
    cloudinary_url: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: int
    file_id: int
    result: Optional[dict] = None
    analyzed_at: str

# Upload endpoint
@router.post("/upload", response_model=FileResponse)
async def upload_file(file: UploadFile, db: Session = Depends(get_db)):
    """Upload a file to Cloudinary, store metadata, and trigger analysis."""
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"File exceeds max size of {settings.MAX_UPLOAD_SIZE} bytes")

    # Validate file type
    mime_type = magic.from_buffer(file_content[:2048], mime=True)
    if mime_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {mime_type}")

    # Upload to Cloudinary
    upload_result = cloudinary.uploader.upload(
        file_content,
        folder=settings.CLOUDINARY_FOLDER,
        # resource_type="raw",
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        cloud_name=settings.CLOUDINARY_CLOUD_NAME
    )
    cloudinary_url = upload_result["secure_url"]
    logger.info(f"Uploaded {file.filename} to Cloudinary: {cloudinary_url}")

    # Store in database
    db_file = File(
        filename=file.filename,
        cloudinary_url=cloudinary_url,
        size=file_size,
        file_type=mime_type,
        user_id=1
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Trigger analysis
    task = None
    if mime_type == "application/octet-stream" and file.filename.endswith(".vmem"):
        task = analyze_memory_task.delay(file_path=cloudinary_url, file_id=db_file.id)
        logger.info(f"Triggered memory analysis for file ID {db_file.id}, task ID {task.id}")
    elif mime_type in ["application/vnd.tcpdump.pcap", "application/x-pcapng"]:
        task = analyze_network_task.delay(pcap_file=cloudinary_url, file_id=db_file.id)
        logger.info(f"Triggered network analysis for file ID {db_file.id}, task ID {task.id}")
    else:
        result = await analyze_file(cloudinary_url) 
        db_file_analysis = FileAnalysis(file_id=db_file.id, metadata_json=json.dumps(result))
        db.add(db_file_analysis)
        db.commit()
        logger.info(f"Completed file analysis for file ID {db_file.id}")

    # Store task if applicable
    if task:
        db_task = Task(
            task_id=task.id,
            file_id=db_file.id,
            task_type="memory" if "vmem" in file.filename else "network",
            status="pending"
        )
        db.add(db_task)
        db.commit()

    return {"message": "File uploaded and analysis triggered", "file_id": db_file.id, "cloudinary_url": cloudinary_url}

# Directory analysis endpoint
@router.post("/analyze-directory")
async def analyze_directory(directory_path: str, db: Session = Depends(get_db)):
    """Trigger directory analysis for a given path."""
    task = analyze_directory_task.delay(directory_path, file_id=None)  # Adjust file_id if linked to a File
    db_task = Task(task_id=task.id, file_id=None, task_type="directory", status="pending")
    db.add(db_task)
    db.commit()
    return {"message": "Directory analysis triggered", "task_id": task.id}

# Get memory analysis results
@router.get("/memory-analysis/{file_id}", response_model=list[AnalysisResponse])  # Changed List to list
def get_memory_analysis(file_id: int, db: Session = Depends(get_db)):
    """Retrieve memory analysis results for a file."""
    analyses = db.query(MemoryAnalysis).filter(MemoryAnalysis.file_id == file_id).all()
    if not analyses:
        raise HTTPException(status_code=404, detail="No memory analysis found")
    return [
        {"id": a.id, "file_id": a.file_id, "result": json.loads(a.result_json) if a.result_json else None, "analyzed_at": a.analyzed_at.isoformat()}
        for a in analyses
    ]

# Get network analysis results
@router.get("/network-analysis/{file_id}", response_model=list[AnalysisResponse])  # Changed List to list
def get_network_analysis(file_id: int, db: Session = Depends(get_db)):
    """Retrieve network analysis results for a file."""
    analyses = db.query(NetworkAnalysis).filter(NetworkAnalysis.file_id == file_id).all()
    if not analyses:
        raise HTTPException(status_code=404, detail="No network analysis found")
    return [
        {"id": a.id, "file_id": a.file_id, "result": json.loads(a.result_json) if a.result_json else None, "analyzed_at": a.analyzed_at.isoformat()}
        for a in analyses
    ]

# Get file analysis results
@router.get("/file-analysis/{file_id}", response_model=list[AnalysisResponse])  # Changed List to list
def get_file_analysis(file_id: int, db: Session = Depends(get_db)):
    """Retrieve file analysis results for a file."""
    analyses = db.query(FileAnalysis).filter(FileAnalysis.file_id == file_id).all()
    if not analyses:
        raise HTTPException(status_code=404, detail="No file analysis found")
    return [
        {"id": a.id, "file_id": a.file_id, "result": json.loads(a.metadata_json) if a.metadata_json else None, "analyzed_at": a.analyzed_at.isoformat()}
        for a in analyses
    ]

# Generate report (placeholder)
@router.post("/generate-report/{file_id}")
def generate_report(file_id: int, db: Session = Depends(get_db)):
    """Generate and store a PDF report for a file."""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    # Placeholder: Implement report generation logic here
    report_url = "https://example.com/report.pdf"  # Replace with actual Cloudinary upload
    db_report = Report(file_id=file_id, report_url=report_url)
    db.add(db_report)
    db.commit()
    return {"message": "Report generated", "report_url": report_url}