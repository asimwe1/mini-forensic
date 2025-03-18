from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class FileSystemNode(BaseModel):
    """Schema for file system node (file or directory)."""
    id: str
    name: str
    type: str  # "file" or "directory"
    path: str
    size: Optional[int] = None
    modified: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    children: Optional[List['FileSystemNode']] = None

class DirectoryResponse(BaseModel):
    """Schema for directory creation response."""
    id: int
    name: str
    path: str
    created_at: datetime

class CreateDirectoryRequest(BaseModel):
    """Schema for directory creation request."""
    name: str = Field(..., min_length=1, max_length=255)
    parent_path: str = Field(default="/")

class FileMetadataResponse(BaseModel):
    """Schema for file metadata response."""
    file_id: int
    filename: str
    mime_type: Optional[str]
    permissions: Optional[str]
    owner: Optional[str]
    group: Optional[str]
    size: int
    created_at: Optional[datetime]
    modified_at: Optional[datetime]
    accessed_at: Optional[datetime] 