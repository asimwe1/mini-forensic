import os
import math
import json
import magic
import logging
import hashlib
import mimetypes
from typing import List
from celery import Celery
from datetime import datetime
from typing import Dict, List
from core.db import SessionLocal
from models import File, FileAnalysis
# from services.file_analysis import analyze_file
from concurrent.futures import ThreadPoolExecutor


# Setup logging
logging.basicConfig(level=logging.INFO)
app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")
logger = logging.getLogger(__name__)

def calculate_entropy(file_path: str, chunk_size: int = 8192) -> float:
    """
    Calculate the Shannon entropy of a file to detect encryption or compression.
    """
    if not os.path.isfile(file_path):
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

def get_file_metadata(file_path: str) -> Dict:
    """
    Extract detailed metadata from a file, including forensic insights.
    """
    if not os.path.isfile(file_path):
        logger.error(f"No such file: '{file_path}'")
        raise FileNotFoundError(f"No such file: '{file_path}'")

    try:
        # Basic metadata
        metadata = {
            "file_name": os.path.basename(file_path),
            "file_path": file_path,
            "file_size": os.path.getsize(file_path),
            "file_type": mimetypes.guess_type(file_path)[0] or "unknown",
            "creation_time": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat(),
            "modification_time": datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
            "access_time": datetime.fromtimestamp(os.path.getatime(file_path)).isoformat(),
            "md5_hash": calculate_md5(file_path),
        }

        # Advanced forensic data
        with open(file_path, "rb") as f:
            file_content = f.read(2048)  # Read first 2KB for signature
        metadata["mime_type"] = magic.from_buffer(file_content, mime=True)
        metadata["entropy"] = calculate_entropy(file_path)

        logger.info(f"Extracted metadata for {file_path}")
        return metadata
    except Exception as e:
        logger.error(f"Error extracting metadata for {file_path}: {str(e)}")
        raise

def calculate_md5(file_path: str, chunk_size: int = 8192) -> str:
    """
    Calculate MD5 hash of a file efficiently.
    """
    hash_md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(chunk_size), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating MD5 for {file_path}: {str(e)}")
        raise

def analyze_file(file_path: str) -> Dict:
    """Wrapper for single file analysis."""
    return get_file_metadata(file_path)

@app_celery.task(bind=True)
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
        futures = {executor.submit(analyze_file, fp): fp for fp in file_paths}
        for future in futures:
            file_path = futures[future]
            try:
                result = future.result()
                analysis_results.append(result)

                # Store in database
                db = SessionLocal()
                analysis = FileAnalysis(file_id=file_id, metadata_json=json.dumps(result))
                db.add(analysis)
                db.commit()
                db.close()

                processed_count += 1
                if processed_count % 10 == 0 or processed_count == total_files:  # Update every 10 files
                    self.update_state(
                        state="PROGRESS",
                        meta={"status": f"Processed {processed_count}/{total_files} files"}
                    )
            except Exception as e:
                logger.warning(f"Error processing file {file_path}: {str(e)}")

    logger.info(f"Completed directory analysis for {directory_path} with {len(analysis_results)} files")
    return analysis_results

    
if __name__ == "__main__":
    directory_path = "/path/to/test/directory"
    results = analyze_directory_task(directory_path)
    for result in results:
        print(result)