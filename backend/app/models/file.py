from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from core.enums import AnalysisStatus

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, index=True)
    filepath = Column(String, nullable=True)
    cloudinary_url = Column(String, nullable=True)
    file_type = Column(String, nullable=True)
    size = Column(Integer, nullable=False)
    md5_hash = Column(String(32), nullable=True, index=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_analyzed = Column(DateTime, nullable=True)
    analysis_status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    analysis_results = Column(String, nullable=True)  # JSON string for analysis results

    # Relationships
    user = relationship("User", back_populates="files")
    analysis_tasks = relationship("AnalysisTask", back_populates="file", cascade="all, delete-orphan")
    memory_analyses = relationship("MemoryAnalysis", back_populates="file", cascade="all, delete-orphan")
    network_analyses = relationship("NetworkAnalysis", back_populates="file", cascade="all, delete-orphan")
    file_analyses = relationship("FileAnalysis", back_populates="file", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="file", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="file", cascade="all, delete-orphan") 