from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from core.enums import AnalysisStatus

class NetworkAnalysis(Base):
    __tablename__ = "network_analyses"

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    result_json = Column(JSON)  # Store analysis results
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    packet_count = Column(Integer, default=0)
    duration = Column(Integer)  # Duration in seconds
    error_message = Column(String, nullable=True)

    # Relationships
    file = relationship("File", back_populates="network_analyses")
    nodes = relationship("NetworkNode", back_populates="analysis", cascade="all, delete-orphan")
    connections = relationship("NetworkConnection", back_populates="analysis", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<NetworkAnalysis(id={self.id}, file_id={self.file_id}, status={self.status})>" 