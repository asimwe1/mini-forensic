from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class MemoryAnalysis(Base):
    __tablename__ = "memory_analyses"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    result_json = Column(JSON)  # Store analysis results
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    processes = Column(JSON)  # Store process list
    network_connections = Column(JSON)  # Store network connections
    loaded_modules = Column(JSON)  # Store loaded modules
    error_message = Column(String, nullable=True)

    # Relationships
    file = relationship("File", back_populates="memory_analyses")

    def __repr__(self):
        return f"<MemoryAnalysis(id={self.id}, file_id={self.file_id}, analyzed_at={self.analyzed_at})>" 