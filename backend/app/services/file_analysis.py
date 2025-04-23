import os
import math
import json
import magic
import logging
import hashlib
import mimetypes
import asyncio
import aiohttp
import tempfile
import shutil
from typing import Dict, Any, List, Optional
from celery import Celery, Task, shared_task
from datetime import datetime
from app.core.db import SessionLocal
from app.models import File, FileAnalysis, AnalysisTask
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException, WebSocket
from app.core.enums import AnalysisStatus, FileType
from app.core.exceptions import FileAnalysisError
from sqlalchemy.orm import Session
from app.models import FileAnalysis
from app.core.websocket import websocket_manager
from app.services.status_service import status_service
from app.core.exceptions import AnalysisError
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")
logger = logging.getLogger(__name__)

class FileAnalysisError(Exception):
    """Custom exception for file analysis errors."""
    def __init__(self, message: str, error_code: str = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

def cleanup_temp_files(temp_files: List[str]) -> None:
    """Clean up temporary files and handle errors."""
    for temp_file in temp_files:
        try:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
                logger.debug(f"Deleted temporary file: {temp_file}")
        except Exception as e:
            logger.warning(f"Failed to delete temporary file {temp_file}: {e}")

def calculate_entropy(file_path: str, chunk_size: int = 8192) -> float:
    """
    Calculate the Shannon entropy of a file to detect encryption or compression.
    """
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"No such file: '{file_path}'")

        byte_counts = [0] * 256
        total_bytes = 0

        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(chunk_size), b""):
                for byte in chunk:
                    byte_counts[byte] += 1
                total_bytes += len(chunk)

        if total_bytes == 0:
            return 0.0

        entropy = 0
        for count in byte_counts:
            if count > 0:
                prob = count / total_bytes
                entropy -= prob * math.log2(prob)

        return entropy
    except Exception as e:
        logger.error(f"Error calculating entropy for {file_path}: {str(e)}")
        raise FileAnalysisError(f"Failed to calculate entropy: {str(e)}")

async def download_file(url: str, temp_file_path: str) -> None:
    """Download a file from a URL to a local temporary path."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Failed to download file from {url}: {response.status}"
                    )
                with open(temp_file_path, "wb") as f:
                    f.write(await response.read())
        logger.debug(f"Downloaded file from {url} to {temp_file_path}")
    except Exception as e:
        logger.error(f"Error downloading file from {url}: {str(e)}")
        raise FileAnalysisError(f"Failed to download file: {str(e)}")

def get_file_metadata(file_path: str) -> Dict[str, Any]:
    """Extract metadata from a file (local path or URL)."""
    temp_files = []
    try:
        temp_file_path = file_path  # Default to the input path
        is_temp_file = False

        # If file_path is a URL, download it to a temporary file
        if file_path.startswith("http"):
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_files.append(temp_file_path)
                is_temp_file = True
                # Run the async download in the current event loop
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(download_file(file_path, temp_file_path))

        if not os.path.exists(temp_file_path):
            raise FileNotFoundError(f"No such file: '{temp_file_path}'")

        metadata = {
            "size": os.path.getsize(temp_file_path),
            "mime_type": magic.from_file(temp_file_path, mime=True),
            "last_modified": os.path.getmtime(temp_file_path),
            "entropy": calculate_entropy(temp_file_path),
        }

        # Calculate MD5 hash
        md5_hash = hashlib.md5()
        with open(temp_file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                md5_hash.update(chunk)
        metadata["md5"] = md5_hash.hexdigest()

        # If it's a text file, include a preview
        if metadata["mime_type"].startswith("text/"):
            with open(temp_file_path, "r", encoding="utf-8", errors="ignore") as f:
                metadata["preview"] = f.read(100)  # First 100 chars

        logger.info(f"Extracted metadata for {file_path}: {metadata}")
        return metadata

    except Exception as e:
        logger.error(f"Error extracting metadata from {file_path}: {str(e)}")
        raise FileAnalysisError(f"Failed to extract metadata: {str(e)}")
    finally:
        # Clean up all temporary files
        cleanup_temp_files(temp_files)

class TempFileManager:
    """Context manager for handling temporary files."""
    def __init__(self, prefix="analysis_"):
        self.temp_files = []
        self.prefix = prefix

    def create_temp_file(self, suffix="") -> str:
        """Create a new temporary file and track it."""
        temp_file = tempfile.NamedTemporaryFile(
            prefix=self.prefix,
            suffix=suffix,
            delete=False
        )
        self.temp_files.append(temp_file.name)
        return temp_file.name

    def cleanup(self):
        """Clean up all temporary files."""
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    logger.debug(f"Cleaned up temporary file: {temp_file}")
            except Exception as e:
                logger.warning(f"Failed to clean up {temp_file}: {str(e)}")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cleanup()

async def analyze_file(file_path: str) -> Dict[str, Any]:
    """
    Analyze a file and return its metadata.
    
    Args:
        file_path: Path to the file to analyze
        
    Returns:
        Dict containing file metadata and analysis results
        
    Raises:
        FileAnalysisError: If analysis fails
        FileNotFoundError: If file doesn't exist
        PermissionError: If file can't be accessed
    """
    with TempFileManager() as temp_mgr:
        try:
            temp_path = temp_mgr.create_temp_file()
            # ... analysis code ...
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise
        # No need to cleanup - context manager handles it

class CustomTask(Task):
    """Custom Celery task to handle progress updates."""
    def on_success(self, retval, task_id, args, kwargs):
        logger.info(f"Task {task_id} completed successfully with result: {retval}")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed with error: {str(exc)}")

@shared_task(base=CustomTask)
def analyze_directory_task(self, directory_path: str, file_id: int) -> List[dict]:
    """
    Analyze all files in a directory asynchronously with progress updates and store results.
    Args:
        directory_path: Path to the directory to analyze.
        file_id: ID of the parent File record (e.g., a zip or directory archive).
    Returns:
        List of file metadata dictionaries.
    """
    if not os.path.isdir(directory_path):
        logger.error(f"No such directory: '{directory_path}'")
        raise NotADirectoryError(f"No such directory: '{directory_path}'")

    self.update_state(state="PROGRESS", meta={"status": "Scanning directory"})
    file_paths = [os.path.join(root, file) for root, _, files in os.walk(directory_path) for file in files]
    total_files = len(file_paths)

    if total_files == 0:
        logger.info(f"No files found in directory: {directory_path}")
        return []

    analysis_results = []
    processed_count = 0

    self.update_state(state="PROGRESS", meta={"status": f"Analyzing {total_files} files"})
    with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        futures = {executor.submit(get_file_metadata, fp): fp for fp in file_paths}
        for future in futures:
            file_path = futures[future]
            try:
                result = future.result()
                analysis_results.append(result)

                # Store in database
                with SessionLocal() as db:
                    analysis = FileAnalysis(file_id=file_id, metadata_json=json.dumps(result))
                    db.add(analysis)
                    db.commit()

                processed_count += 1
                if processed_count % 10 == 0 or processed_count == total_files:
                    self.update_state(
                        state="PROGRESS",
                        meta={"status": f"Processed {processed_count}/{total_files} files"}
                    )
            except Exception as e:
                logger.warning(f"Error processing file {file_path}: {str(e)}")

    logger.info(f"Completed directory analysis for {directory_path} with {len(analysis_results)} files")
    return analysis_results

async def update_analysis_status(
    file_id: int,
    status: AnalysisStatus,
    metadata: Dict[str, Any] = None,
    error: str = None
) -> None:
    """Update analysis status and metadata in database."""
    try:
        with SessionLocal() as db:
            task = db.query(AnalysisTask).filter(
                AnalysisTask.file_id == file_id
            ).first()
            
            if task:
                task.status = status
                task.task_metadata = metadata
                task.error_message = error
                task.updated_at = datetime.utcnow()
                
                if status == AnalysisStatus.COMPLETED:
                    task.completed_at = datetime.utcnow()
                
                db.commit()
                logger.info(f"Updated analysis status for file {file_id}: {status}")
            else:
                logger.error(f"No analysis task found for file {file_id}")
    except Exception as e:
        logger.error(f"Failed to update analysis status: {str(e)}")

class FileAnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.mime = magic.Magic(mime=True)
        self.status_service = status_service

    async def analyze_file_task(self, file_id: int) -> Dict:
        """Analyze a file for forensic information."""
        try:
            # Create analysis record
            analysis = FileAnalysis(
                file_id=file_id,
                status=AnalysisStatus.PENDING,
                started_at=datetime.utcnow()
            )
            self.db.add(analysis)
            self.db.commit()
            self.db.refresh(analysis)

            # Simulate analysis process
            await self.status_service.update_status(analysis.id, AnalysisStatus.RUNNING)
            
            # Mock data for demonstration
            result = {
                "file_info": {
                    "name": "example.exe",
                    "size": 1024 * 1024,  # 1MB
                    "type": "executable",
                    "created_at": datetime.utcnow().isoformat(),
                    "modified_at": datetime.utcnow().isoformat(),
                    "accessed_at": datetime.utcnow().isoformat()
                },
                "metadata": {
                    "md5": "d41d8cd98f00b204e9800998ecf8427e",
                    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "entropy": 7.5
                },
                "content_analysis": {
                    "strings": [
                        "Hello World",
                        "Welcome to the program",
                        "Version 1.0.0"
                    ],
                    "file_type": "PE32 executable",
                    "sections": [
                        {
                            "name": ".text",
                            "size": 1024 * 100,
                            "entropy": 6.8
                        },
                        {
                            "name": ".data",
                            "size": 1024 * 50,
                            "entropy": 4.2
                        }
                    ]
                }
            }

            # Update analysis with results
            analysis.result = result
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.utcnow()
            self.db.commit()

            return result

        except Exception as e:
            logger.error(f"File analysis failed: {str(e)}")
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                self.db.commit()
            raise AnalysisError(f"File analysis failed: {str(e)}")

    async def analyze_directory_task(self, directory_path: str, file_id: Optional[int] = None) -> Dict:
        """Analyze a directory for forensic information."""
        try:
            # Create analysis record
            analysis = FileAnalysis(
                file_id=file_id,
                status=AnalysisStatus.PENDING,
                started_at=datetime.utcnow()
            )
            self.db.add(analysis)
            self.db.commit()
            self.db.refresh(analysis)

            # Simulate analysis process
            await self.status_service.update_status(analysis.id, AnalysisStatus.RUNNING)
            
            # Mock data for demonstration
            result = {
                "directory_info": {
                    "name": "Documents",
                    "path": directory_path,
                    "total_size": 1024 * 1024 * 100,  # 100MB
                    "file_count": 50,
                    "directory_count": 5
                },
                "files": [
                    {
                        "name": "document1.pdf",
                        "size": 1024 * 100,
                        "type": "PDF",
                        "created_at": datetime.utcnow().isoformat(),
                        "modified_at": datetime.utcnow().isoformat()
                    },
                    {
                        "name": "image1.jpg",
                        "size": 1024 * 500,
                        "type": "JPEG",
                        "created_at": datetime.utcnow().isoformat(),
                        "modified_at": datetime.utcnow().isoformat()
                    }
                ]
            }

            # Update analysis with results
            analysis.result = result
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.utcnow()
            self.db.commit()

            return result

        except Exception as e:
            logger.error(f"Directory analysis failed: {str(e)}")
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                self.db.commit()
            raise AnalysisError(f"Directory analysis failed: {str(e)}")

    async def stream_file_data(self, analysis_id: int, websocket: WebSocket):
        """Stream real-time file analysis data."""
        try:
            await websocket.accept()
            
            # Send initial data
            await websocket.send_json({
                "type": "initial_data",
                "data": {
                    "file_info": {
                        "name": "example.exe",
                        "size": 1024 * 1024,
                        "type": "executable"
                    },
                    "metadata": {
                        "md5": "d41d8cd98f00b204e9800998ecf8427e",
                        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    }
                }
            })

            # Simulate real-time updates
            while True:
                await asyncio.sleep(5)
                await websocket.send_json({
                    "type": "update",
                    "data": {
                        "analysis_progress": {
                            "strings_analyzed": 100,
                            "sections_analyzed": 2,
                            "entropy_calculated": True
                        }
                    }
                })

        except Exception as e:
            logger.error(f"Error streaming file data: {str(e)}")
            await websocket.close()

    async def get_file_analysis(self, file_id: int) -> Optional[Dict]:
        """Get the latest file analysis for a file."""
        analysis = self.db.query(FileAnalysis).filter(
            FileAnalysis.file_id == file_id
        ).order_by(FileAnalysis.created_at.desc()).first()
        
        if not analysis:
            return None
            
        return {
            "id": analysis.id,
            "file_id": analysis.file_id,
            "status": analysis.status,
            "result": analysis.result,
            "error_message": analysis.error_message,
            "started_at": analysis.started_at,
            "completed_at": analysis.completed_at
        }

    async def get_file_statistics(self, file_id: int) -> Dict:
        """Get file analysis statistics."""
        analysis = await self.get_file_analysis(file_id)
        if not analysis or not analysis["result"]:
            return {
                "total_files": 0,
                "total_size": 0,
                "file_types": {}
            }
            
        if "directory_info" in analysis["result"]:
            return {
                "total_files": analysis["result"]["directory_info"]["file_count"],
                "total_size": analysis["result"]["directory_info"]["total_size"],
                "file_types": {}
            }
        else:
            return {
                "total_files": 1,
                "total_size": analysis["result"]["file_info"]["size"],
                "file_types": {
                    analysis["result"]["file_info"]["type"]: 1
                }
            }

# Remove or adjust the main block for testing
if __name__ == "__main__":
    # This block is for testing; adjust for async if needed
    import asyncio
    async def test_analyze():
        result = await analyze_file("https://res.cloudinary.com/dhrhfjgqa/image/upload/v1742033456/forensic-lab/w4gh134uzzkrmyoe1c4k.png")
        print(result)
    asyncio.run(test_analyze())