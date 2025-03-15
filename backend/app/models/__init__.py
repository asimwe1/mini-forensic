from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from core.base import Base  # Updated import

# Enums
class EventType(str, enum.Enum):
    UPLOAD = "upload"
    ANALYSIS_START = "analysis_start"
    ANALYSIS_COMPLETE = "analysis_complete"
    ERROR = "error"
    WARNING = "warning"

class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    files = relationship("File", back_populates="user")

# File Model
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
    analysis_status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    user = relationship("User", back_populates="files")
    logs = relationship("Log", back_populates="file", cascade="all, delete-orphan")
    memory_analyses = relationship("MemoryAnalysis", back_populates="file", cascade="all, delete-orphan")
    network_analyses = relationship("NetworkAnalysis", back_populates="file", cascade="all, delete-orphan")
    file_analyses = relationship("FileAnalysis", back_populates="file", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="file", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="file", cascade="all, delete-orphan")

# Log Model
class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    event_type = Column(Enum(EventType), nullable=False, index=True)
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    severity = Column(String, default="info", nullable=False)

    file = relationship("File", back_populates="logs")

# Memory Analysis Model
class MemoryAnalysis(Base):
    __tablename__ = "memory_analyses"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    result_json = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    task_id = Column(String, ForeignKey("tasks.task_id"), nullable=True, index=True)

    file = relationship("File", back_populates="memory_analyses")
    task = relationship("Task")

# Network Analysis Model
class NetworkAnalysis(Base):
    __tablename__ = "network_analyses"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    result_json = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    task_id = Column(String, ForeignKey("tasks.task_id"), nullable=True, index=True)

    file = relationship("File", back_populates="network_analyses")
    task = relationship("Task")

# File Analysis Model
class FileAnalysis(Base):
    __tablename__ = "file_analyses"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    metadata_json = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    task_id = Column(String, ForeignKey("tasks.task_id"), nullable=True, index=True)

    file = relationship("File", back_populates="file_analyses")
    task = relationship("Task")

# Report Model
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    report_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    file = relationship("File", back_populates="reports")

# Task Model
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, nullable=False, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False, index=True)
    task_type = Column(String, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    file = relationship("File", back_populates="tasks")