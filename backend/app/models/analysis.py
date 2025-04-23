from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from app.core.enums import AnalysisStatus

class AnalysisTask(Base):
    __tablename__ = "analysis_tasks"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    task_type = Column(String, nullable=False)
    task_metadata = Column(JSON)
    error_message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime)

    # Relationships
    file = relationship("File", back_populates="analysis_tasks")