from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum as SQLEnum
from sqlalchemy.orm import relationship
from core.base import Base
from datetime import datetime
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    INVESTIGATOR = "investigator"
    ANALYST = "analyst"
    VIEWER = "viewer"

class PermissionType(str, enum.Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ANALYZE = "analyze"
    EXPORT = "export"

# User-Role association table
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('role_id', Integer, ForeignKey('roles.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    cases = relationship("Case", back_populates="owner")
    audit_logs = relationship("AuditLog", back_populates="user")
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    resource_type = Column(String, nullable=False)  # e.g., "case", "file", "analysis"
    permission_type = Column(SQLEnum(PermissionType), nullable=False)
    
    role = relationship("Role", back_populates="permissions") 