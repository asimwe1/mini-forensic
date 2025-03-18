from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table, Enum, Text
from sqlalchemy.orm import relationship
from core.base import Base
from datetime import datetime
import enum

class CaseStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    CLOSED = "closed"
    ARCHIVED = "archived"

class CasePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Case-Investigator association table
case_investigators = Table(
    'case_investigators',
    Base.metadata,
    Column('case_id', Integer, ForeignKey('cases.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True)
    case_number = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(CaseStatus), default=CaseStatus.OPEN)
    priority = Column(Enum(CasePriority), default=CasePriority.MEDIUM)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="cases")
    investigators = relationship("User", secondary=case_investigators)
    evidence_items = relationship("Evidence", back_populates="case")
    notes = relationship("CaseNote", back_populates="case")
    tags = relationship("CaseTag", back_populates="case")

class Evidence(Base):
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    evidence_number = Column(String, unique=True)
    description = Column(Text)
    collection_date = Column(DateTime)
    chain_of_custody = Column(JSON)
    
    case = relationship("Case", back_populates="evidence_items")
    file = relationship("File")

class CaseNote(Base):
    __tablename__ = "case_notes"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    case = relationship("Case", back_populates="notes")
    user = relationship("User")

class CaseTag(Base):
    __tablename__ = "case_tags"

    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    name = Column(String, nullable=False)
    color = Column(String)
    
    case = relationship("Case", back_populates="tags") 