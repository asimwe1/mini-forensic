from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from core.db import Base

# Log Model
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"))
    event_type = Column(String)
    description = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationship back to the file
    file = relationship("File", back_populates="logs")
