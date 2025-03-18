from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from core.enums import AnalysisStatus, FileType

class FileResponse(BaseModel):
    """Response model for file operations."""
    status: str = Field(..., description="Operation status (success/error)")
    message: str = Field(..., description="Operation result message")
    file_id: Optional[int] = Field(None, description="ID of the uploaded file")
    cloudinary_url: Optional[str] = Field(None, description="URL of the file in Cloudinary")
    file_type: Optional[str] = Field(None, description="MIME type of the file")
    file_size: Optional[int] = Field(None, description="Size of the file in bytes")
    upload_date: Optional[datetime] = Field(None, description="Date and time of upload")

class AnalysisResponse(BaseModel):
    """Response model for analysis operations."""
    status: str = Field(..., description="Operation status (success/error)")
    message: str = Field(..., description="Operation result message")
    file_id: int = Field(..., description="ID of the analyzed file")
    analysis_status: str = Field(..., description="Current status of the analysis")
    analysis_results: Optional[Dict[str, Any]] = Field(None, description="Results of the analysis")
    analysis_date: Optional[datetime] = Field(None, description="Date and time of analysis")
    error_message: Optional[str] = Field(None, description="Error message if analysis failed")

class ErrorResponse(BaseModel):
    """Response model for error cases."""
    status: str = Field("error", description="Operation status (always 'error')")
    message: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code for client handling")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

class FileListResponse(BaseModel):
    """Response model for file listing operations."""
    status: str = Field(..., description="Operation status (success/error)")
    message: str = Field(..., description="Operation result message")
    files: List[FileResponse] = Field(..., description="List of files")
    total_count: int = Field(..., description="Total number of files")
    page: Optional[int] = Field(None, description="Current page number")
    page_size: Optional[int] = Field(None, description="Number of files per page")

class AnalysisStatusResponse(BaseModel):
    """Response model for analysis status checks."""
    status: str = Field(..., description="Operation status (success/error)")
    message: str = Field(..., description="Operation result message")
    file_id: int = Field(..., description="ID of the analyzed file")
    analysis_status: str = Field(..., description="Current status of the analysis")
    progress: Optional[float] = Field(None, description="Analysis progress (0-100)")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    current_step: Optional[str] = Field(None, description="Current analysis step")
    error_message: Optional[str] = Field(None, description="Error message if analysis failed") 