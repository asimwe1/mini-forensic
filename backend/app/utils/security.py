import re
import unicodedata
from pathlib import Path
from typing import Optional
from core.config import settings

class FileSecurityValidator:
    def __init__(self):
        self.malicious_patterns = [re.compile(pattern) for pattern in settings.MALICIOUS_PATTERNS]
        
    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename to prevent path traversal and other security issues.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
            
        Raises:
            ValueError: If filename is invalid or potentially malicious
        """
        # Normalize unicode characters
        filename = unicodedata.normalize('NFKD', filename)
        
        # Remove non-ASCII characters
        filename = filename.encode('ASCII', 'ignore').decode()
        
        # Get stem and suffix
        path = Path(filename)
        stem = path.stem
        suffix = path.suffix.lower()
        
        # Check for malicious patterns
        for pattern in self.malicious_patterns:
            if pattern.match(filename):
                raise ValueError(f"Filename matches malicious pattern: {filename}")
        
        # Remove or replace potentially dangerous characters
        stem = re.sub(r'[^a-zA-Z0-9\-_]', '_', stem)
        
        # Ensure filename isn't too long
        if len(stem) > 200:
            stem = stem[:200]
        
        # Validate extension
        if suffix in settings.BLOCKED_EXTENSIONS:
            raise ValueError(f"File extension not allowed: {suffix}")
            
        return f"{stem}{suffix}"

    def validate_file_type(self, mime_type: str, file_size: int, analysis_type: str) -> None:
        """Validate file type and size based on analysis type."""
        if analysis_type not in settings.ALLOWED_FILE_TYPES:
            raise ValueError(f"Invalid analysis type: {analysis_type}")
            
        if mime_type not in settings.ALLOWED_FILE_TYPES[analysis_type]:
            raise ValueError(f"File type {mime_type} not allowed for {analysis_type} analysis")
            
        max_size = settings.MAX_FILE_SIZES[analysis_type]
        if file_size > max_size:
            raise ValueError(
                f"File size ({file_size} bytes) exceeds maximum allowed "
                f"({max_size} bytes) for {analysis_type} analysis"
            ) 