from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class FileAnalysis(Base):
    __tablename__ = "file_analyses"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    metadata_json = Column(JSON)  # Store file metadata analysis results
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    mime_type = Column(String)
    file_size = Column(Integer)
    file_hash = Column(String)  # Store file hash for integrity
    error_message = Column(String, nullable=True)

    # Relationships
    file = relationship("File", back_populates="file_analyses")

    def __repr__(self):
        return f"<FileAnalysis(id={self.id}, file_id={self.file_id}, analyzed_at={self.analyzed_at})>" 