from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base
from core.enums import EventType

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True)
    event_type = Column(SQLEnum(EventType), nullable=False)
    message = Column(String, nullable=False)
    details = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="logs")
    file = relationship("File", back_populates="logs") 