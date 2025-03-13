from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from core.db import Base

# File Model
class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String, nullable=False)
    file_type = Column(String)
    size = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to link logs to files
    logs = relationship("Log", back_populates="file")