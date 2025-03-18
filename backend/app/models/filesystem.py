from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from core.base import Base
from datetime import datetime

class Directory(Base):
    __tablename__ = "directories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False, unique=True)
    parent_id = Column(Integer, ForeignKey("directories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    files = relationship("File", back_populates="directory")
    parent = relationship("Directory", remote_side=[id], backref="subdirectories")
    
class FileMetadata(Base):
    __tablename__ = "file_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    mime_type = Column(String)
    permissions = Column(String)
    owner = Column(String)
    group = Column(String)
    created_at = Column(DateTime)
    modified_at = Column(DateTime)
    accessed_at = Column(DateTime)
    
    file = relationship("File", back_populates="metadata") 