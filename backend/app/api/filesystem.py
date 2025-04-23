from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.core.auth import get_current_user, TokenData
from app.models.filesystem import Directory, FileMetadata
from app.schemas.filesystem import (
    DirectoryResponse,
    FileSystemNode,
    FileMetadataResponse,
    CreateDirectoryRequest
)
from app.core.websocket import websocket_manager
import math

router = APIRouter(prefix="/api/v1/filesystem", tags=["filesystem"])

@router.get("/browse", response_model=List[FileSystemNode])
async def browse_filesystem(
    path: str = Query("/", description="Directory path to browse"),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Browse the file system starting from the specified path.
    Returns directory structure and file metadata.
    """
    try:
        # Get directory contents
        directory = db.query(Directory).filter(
            Directory.path == path,
            Directory.user_id == current_user.id
        ).first()
        
        if not directory and path != "/":
            raise HTTPException(status_code=404, detail="Directory not found")
            
        # Get subdirectories
        subdirs = db.query(Directory).filter(
            Directory.parent_id == directory.id if directory else None,
            Directory.user_id == current_user.id
        ).all()
        
        # Get files in current directory
        files = db.query(File).filter(
            File.directory_id == directory.id if directory else None,
            File.user_id == current_user.id
        ).all()
        
        # Build response
        nodes = []
        
        # Add directories
        for subdir in subdirs:
            nodes.append(FileSystemNode(
                id=str(subdir.id),
                name=subdir.name,
                type="directory",
                path=subdir.path,
                children=[]  # Will be populated on subsequent requests
            ))
            
        # Add files with metadata
        for file in files:
            metadata = db.query(FileMetadata).filter(
                FileMetadata.file_id == file.id
            ).first()
            
            nodes.append(FileSystemNode(
                id=str(file.id),
                name=file.filename,
                type="file",
                path=f"{path}/{file.filename}",
                size=file.size,
                modified=file.modified_at.isoformat() if file.modified_at else None,
                metadata={
                    "mimeType": metadata.mime_type if metadata else None,
                    "permissions": metadata.permissions if metadata else None,
                    "owner": metadata.owner if metadata else None,
                    "group": metadata.group if metadata else None
                } if metadata else None
            ))
            
        return nodes
        
    except Exception as e:
        logger.error(f"Failed to browse filesystem: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to browse filesystem"
        )

@router.post("/directories", response_model=DirectoryResponse)
async def create_directory(
    request: CreateDirectoryRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new directory."""
    try:
        # Validate parent directory exists if specified
        if request.parent_path != "/":
            parent = db.query(Directory).filter(
                Directory.path == request.parent_path,
                Directory.user_id == current_user.id
            ).first()
            if not parent:
                raise HTTPException(
                    status_code=404,
                    detail="Parent directory not found"
                )
                
        new_path = f"{request.parent_path.rstrip('/')}/{request.name}"
        
        # Check if directory already exists
        existing = db.query(Directory).filter(
            Directory.path == new_path,
            Directory.user_id == current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Directory already exists"
            )
            
        # Create new directory
        new_dir = Directory(
            name=request.name,
            path=new_path,
            parent_id=parent.id if request.parent_path != "/" else None,
            user_id=current_user.id
        )
        
        db.add(new_dir)
        db.commit()
        db.refresh(new_dir)
        
        return DirectoryResponse(
            id=new_dir.id,
            name=new_dir.name,
            path=new_dir.path,
            created_at=new_dir.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create directory: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create directory"
        )

@router.get("/files/{file_id}/metadata", response_model=FileMetadataResponse)
async def get_file_metadata(
    file_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed metadata for a specific file."""
    try:
        # Get file and verify ownership
        file = db.query(File).filter(
            File.id == file_id,
            File.user_id == current_user.id
        ).first()
        
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
            
        # Get metadata
        metadata = db.query(FileMetadata).filter(
            FileMetadata.file_id == file_id
        ).first()
        
        if not metadata:
            raise HTTPException(status_code=404, detail="Metadata not found")
            
        return FileMetadataResponse(
            file_id=file.id,
            filename=file.filename,
            mime=metadata.mime_type
        )
        
    except Exception as e:
        logger.error(f"Failed to get file metadata: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get file metadata"
        )

@router.get("/browse/{path:path}", response_model=List[FileSystemNode])
async def browse_directory(
    path: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    sort_by: str = Query("name", enum=["name", "size", "modified"]),
    order: str = Query("asc", enum=["asc", "desc"]),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Browse directory contents with pagination and sorting."""
    try:
        offset = (page - 1) * limit
        
        # Get directory contents
        query = db.query(FileSystemNode).filter(
            FileSystemNode.parent_path == path,
            FileSystemNode.user_id == current_user.id
        )
        
        # Apply sorting
        if sort_by == "name":
            query = query.order_by(
                FileSystemNode.name.desc() if order == "desc" else FileSystemNode.name
            )
        elif sort_by == "size":
            query = query.order_by(
                FileSystemNode.size.desc() if order == "desc" else FileSystemNode.size
            )
        elif sort_by == "modified":
            query = query.order_by(
                FileSystemNode.modified_at.desc() if order == "desc" else FileSystemNode.modified_at
            )
        
        # Get paginated results
        total = query.count()
        items = query.offset(offset).limit(limit).all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "pages": math.ceil(total / limit)
        }
        
    except Exception as e:
        logger.error(f"Failed to browse directory: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to browse directory"
        )

@router.websocket("/ws/filesystem/{client_id}")
async def filesystem_websocket(
    websocket: WebSocket,
    client_id: str,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time file system updates."""
    try:
        user = await get_current_user(token)
        await websocket_manager.connect(websocket, client_id, "file_system")
        
        while True:
            data = await websocket.receive_json()
            # Handle different file system events
            if data["type"] == "watch_directory":
                # Start monitoring directory for changes
                pass
            elif data["type"] == "stop_watching":
                # Stop monitoring directory
                pass
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id, "file_system")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close(code=1008) 