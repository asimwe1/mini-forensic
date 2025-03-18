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
from typing import Dict, Any, List
from celery import Celery, Task, shared_task
from datetime import datetime
from core.db import SessionLocal
from models import File, FileAnalysis, AnalysisTask
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException
from core.enums import AnalysisStatus, FileType
from core.exceptions import FileAnalysisError

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

# Remove or adjust the main block for testing
if __name__ == "__main__":
    # This block is for testing; adjust for async if needed
    import asyncio
    async def test_analyze():
        result = await analyze_file("https://res.cloudinary.com/dhrhfjgqa/image/upload/v1742033456/forensic-lab/w4gh134uzzkrmyoe1c4k.png")
        print(result)
    asyncio.run(test_analyze())