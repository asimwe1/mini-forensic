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
from typing import Dict, Any, List
from celery import Celery, Task, shared_task
from datetime import datetime
from core.db import SessionLocal
from models import File, FileAnalysis
from concurrent.futures import ThreadPoolExecutor

# Setup logging
logging.basicConfig(level=logging.INFO)
app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")
logger = logging.getLogger(__name__)

def calculate_entropy(file_path: str, chunk_size: int = 8192) -> float:
    """
    Calculate the Shannon entropy of a file to detect encryption or compression.
    """
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

async def download_file(url: str, temp_file_path: str) -> None:
    """Download a file from a URL to a local temporary path."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise ValueError(f"Failed to download file from {url}: {response.status}")
            with open(temp_file_path, "wb") as f:
                f.write(await response.read())
    logger.debug(f"Downloaded file from {url} to {temp_file_path}")

def get_file_metadata(file_path: str) -> Dict[str, Any]:
    """Extract metadata from a file (local path or URL)."""
    temp_file_path = file_path  # Default to the input path
    is_temp_file = False

    # If file_path is a URL, download it to a temporary file
    if file_path.startswith("http"):
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file_path = temp_file.name
            is_temp_file = True
            # Run the async download in the current event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(download_file(file_path, temp_file_path))

    try:
        if not os.path.exists(temp_file_path):
            logger.error(f"No such file: '{temp_file_path}'")
            raise FileNotFoundError(f"No such file: '{temp_file_path}'")

        metadata = {
            "size": os.path.getsize(temp_file_path),
            "mime_type": magic.from_file(temp_file_path, mime=True),
            "last_modified": os.path.getmtime(temp_file_path),
            "entropy": calculate_entropy(temp_file_path),  # Add entropy calculation
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

    finally:
        # Clean up the temporary file if it was downloaded
        if is_temp_file:
            try:
                os.unlink(temp_file_path)
                logger.debug(f"Deleted temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete temporary file {temp_file_path}: {e}")

async def analyze_file(file_path: str) -> Dict[str, Any]:
    """Analyze a file and return its metadata."""
    try:
        loop = asyncio.get_event_loop()
        metadata = await loop.run_in_executor(None, get_file_metadata, file_path)
        return metadata
    except Exception as e:
        logger.error(f"Error analyzing file {file_path}: {str(e)}")
        raise

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

# Remove or adjust the main block for testing
if __name__ == "__main__":
    # This block is for testing; adjust for async if needed
    import asyncio
    async def test_analyze():
        result = await analyze_file("https://res.cloudinary.com/dhrhfjgqa/image/upload/v1742033456/forensic-lab/w4gh134uzzkrmyoe1c4k.png")
        print(result)
    asyncio.run(test_analyze())