from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from app.core.enums import AnalysisStatus

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    content = Column(JSON)  # Store report content in JSON format
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    error_message = Column(String, nullable=True)

    # Relationships
    file = relationship("File", back_populates="reports")
    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report(id={self.id}, file_id={self.file_id}, title={self.title})>" 