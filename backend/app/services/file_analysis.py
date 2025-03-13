import os
import hashlib
import mimetypes
from datetime import datetime

def get_file_metadata(file_path):
    """
    Extract metadata from a file.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"No such file: '{file_path}'")

    metadata = {}
    metadata['file_name'] = os.path.basename(file_path)
    metadata['file_size'] = os.path.getsize(file_path)
    metadata['file_type'] = mimetypes.guess_type(file_path)[0]
    metadata['creation_time'] = datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
    metadata['modification_time'] = datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat()
    metadata['access_time'] = datetime.fromtimestamp(os.path.getatime(file_path)).isoformat()
    metadata['md5_hash'] = calculate_md5(file_path)

    return metadata

def calculate_md5(file_path, chunk_size=8192):
    """
    Calculate MD5 hash of a file.
    """
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def analyze_directory(directory_path):
    """
    Analyze all files in a directory and extract their metadata.
    """
    if not os.path.isdir(directory_path):
        raise NotADirectoryError(f"No such directory: '{directory_path}'")

    analysis_results = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                metadata = get_file_metadata(file_path)
                analysis_results.append(metadata)
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")

    return analysis_results