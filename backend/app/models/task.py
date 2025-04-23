from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from app.core.enums import AnalysisStatus

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    task_type = Column(String, nullable=False)
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    priority = Column(Integer, default=0)
    parameters = Column(JSON, nullable=True)  # Store task parameters
    result = Column(JSON, nullable=True)  # Store task results
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    file = relationship("File", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, file_id={self.file_id}, type={self.task_type}, status={self.status})>" 