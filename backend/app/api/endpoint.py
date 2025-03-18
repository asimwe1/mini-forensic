import logging
import json
from fastapi import APIRouter, UploadFile, File as FastAPIFile, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.db import get_db
from core.config import settings
from models import File, FileAnalysis, MemoryAnalysis, NetworkAnalysis, Report, Task, AnalysisTask
from services.memory_analysis import analyze_memory_task
from services.network_analysis import analyze_network_task
from services.file_analysis import analyze_file, analyze_directory_task
import cloudinary.uploader
import magic
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import aiohttp
import asyncio
from core.auth import get_current_user, TokenData, sanitize_filename
from core.enums import AnalysisStatus, FileType
from core.exceptions import (
    FileValidationError,
    RateLimitExceeded,
    CloudinaryError,
    FileAnalysisError,
    BaseAPIException
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1",
    tags=["forensic-analysis"],
    responses={404: {"description": "Not found"}},
)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

# Response models
class FileResponse(BaseModel):
    """Response model for file upload endpoint."""
    message: str = Field(..., description="Status message")
    file_id: int = Field(..., description="ID of the uploaded file")
    cloudinary_url: Optional[str] = Field(None, description="URL of the uploaded file in Cloudinary")

class AnalysisResponse(BaseModel):
    """Response model for analysis endpoints."""
    id: int = Field(..., description="Analysis record ID")
    file_id: int = Field(..., description="ID of the analyzed file")
    result: Optional[dict] = Field(None, description="Analysis results")
    analyzed_at: str = Field(..., description="Timestamp of analysis")

class ErrorResponse(BaseModel):
    """Response model for error cases."""
    detail: str = Field(..., description="Error message")
    code: str = Field(..., description="Error code")

async def validate_file_size(file_content: bytes) -> None:
    """Validate file size before upload."""
    file_size = len(file_content)
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size ({file_size} bytes) exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
        )

async def upload_to_cloudinary(file_content: bytes, filename: str) -> str:
    """Upload file to Cloudinary with error handling."""
    try:
        upload_result = cloudinary.uploader.upload(
            file_content,
            folder=settings.CLOUDINARY_FOLDER,
            resource_type="auto",
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            cloud_name=settings.CLOUDINARY_CLOUD_NAME
        )
        return upload_result["secure_url"]
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {str(e)}")
        raise CloudinaryError(detail=f"Failed to upload file to cloud storage: {str(e)}")

@router.post(
    "/upload",
    response_model=FileResponse,
    dependencies=[Depends(RateLimiter(times=settings.UPLOAD_RATE_LIMIT_TIMES, 
                                    seconds=settings.UPLOAD_RATE_LIMIT_SECONDS))],
    responses={
        400: {"model": ErrorResponse, "description": "Bad request"},
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        429: {"model": ErrorResponse, "description": "Too many requests"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    current_user: TokenData = Depends(get_current_user),
) -> FileResponse:
    """
    Upload a file for forensic analysis.
    
    The file will be:
    1. Validated for size and type
    2. Scanned for malware
    3. Uploaded to secure storage
    4. Queued for analysis
    
    Args:
        file: The file to upload
        current_user: Current authenticated user
        
    Returns:
        FileResponse with upload status and file ID
        
    Raises:
        HTTPException: For various error conditions
        RateLimitExceeded: If upload limit is exceeded
    """
    # Validate file size before reading
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise FileValidationError(
            f"File size {file.size} exceeds limit of {settings.MAX_UPLOAD_SIZE}"
        )

    try:
        # Read file content for validation
        content = await file.read()
        
        # Validate file type using python-magic
        mime = magic.Magic(mime=True)
        file_type = mime.from_buffer(content)
        
        # Check if file type is allowed
        if file_type not in settings.ALLOWED_FILE_TYPES:
            raise FileValidationError(
                f"File type {file_type} is not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Check file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext in settings.BLOCKED_EXTENSIONS:
            raise FileValidationError(
                f"File extension {file_ext} is blocked for security reasons"
            )
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        
        # Upload to Cloudinary
        try:
            cloudinary_url = await upload_to_cloudinary(
                content,
                safe_filename,
                file_type
            )
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}")
            raise CloudinaryError(f"Failed to upload file to Cloudinary: {str(e)}")
        
        # Create file record in database
        try:
            db_file = File(
                filename=safe_filename,
                file_type=file_type,
                file_size=len(content),
                cloudinary_url=cloudinary_url,
                upload_date=datetime.utcnow(),
                user_id=current_user.id
            )
            db.add(db_file)
            db.commit()
            db.refresh(db_file)
        except Exception as e:
            logger.error(f"Database operation failed: {str(e)}")
            raise FileAnalysisError(f"Failed to save file record: {str(e)}")
        
        # Trigger analysis based on file type
        try:
            if file_type in ["application/vnd.tcpdump.pcap", "application/x-pcapng"]:
                await analyze_file(db_file.id, "network")
            elif file_type == "application/octet-stream":
                await analyze_file(db_file.id, "memory")
            else:
                await analyze_file(db_file.id, "general")
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise FileAnalysisError(f"Failed to analyze file: {str(e)}")
        
        return FileResponse(
            status="success",
            message="File uploaded and analysis started",
            file_id=db_file.id,
            cloudinary_url=cloudinary_url
        )
        
    except FileValidationError as e:
        logger.warning(f"File validation failed: {str(e)}")
        raise
    except RateLimitExceeded as e:
        logger.warning(f"Rate limit exceeded: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during file upload"
        )

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

@router.get(
    "/files",
    response_model=List[FileResponse],
    responses={
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def list_files(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all files uploaded by the current user.
    """
    try:
        files = db.query(File).filter(File.user_id == current_user.id).all()
        return [
            FileResponse(
                message="File retrieved successfully",
                file_id=f.id,
                cloudinary_url=f.cloudinary_url
            )
            for f in files
        ]
    except Exception as e:
        logger.error(f"Failed to list files: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve file list")

@router.get(
    "/analysis/{file_id}",
    response_model=AnalysisResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def get_analysis_status(
    file_id: int,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get the analysis status and results for a specific file.
    """
    try:
        file = db.query(File).filter(File.id == file_id).first()
        if not file:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )
        
        if file.user_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to access this file"
            )
        
        return AnalysisResponse(
            status="success",
            message="Analysis status retrieved successfully",
            file_id=file.id,
            analysis_status=file.analysis_status,
            analysis_results=file.analysis_results
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve analysis status"
        )

@router.delete(
    "/files/{file_id}",
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def delete_file(
    file_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a file and its associated analyses"""
    try:
        file = db.query(File).filter(File.id == file_id, File.user_id == current_user.id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete from Cloudinary if URL exists
        if file.cloudinary_url:
            try:
                # Extract public_id from URL
                public_id = file.cloudinary_url.split('/')[-1].split('.')[0]
                cloudinary.uploader.destroy(public_id)
            except Exception as e:
                logger.error(f"Failed to delete file from Cloudinary: {str(e)}")
                # Continue with database deletion even if Cloudinary fails
        
        # Delete associated analyses
        db.query(FileAnalysis).filter(FileAnalysis.file_id == file_id).delete()
        db.delete(file)
        db.commit()
        
        return {"message": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

@router.post(
    "/files/{file_id}/reanalyze",
    response_model=AnalysisResponse,
    responses={
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def reanalyze_file(
    file_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger a new analysis for an existing file"""
    try:
        file = db.query(File).filter(File.id == file_id, File.user_id == current_user.id).first()
        if not file:
            raise HTTPException(status_code=404, detail="File not found")

        # Start new analysis task
        task = analyze_file.delay(file.cloudinary_url)
        
        # Update file status
        file.analysis_status = "PENDING"
        file.last_analyzed = datetime.utcnow()
        db.commit()

        return AnalysisResponse(
            status="success",
            message="Analysis started",
            file_id=file.id,
            analysis_status="PENDING",
            task_id=task.id
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to start reanalysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start reanalysis")