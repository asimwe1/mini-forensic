from enum import Enum, auto

class AnalysisStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class FileType(str, Enum):
    MEMORY_DUMP = "memory_dump"
    NETWORK_CAPTURE = "network_capture"
    DOCUMENT = "document"
    OTHER = "other"

class NodeType(str, Enum):
    HOST = "host"
    ROUTER = "router"
    SWITCH = "switch"
    ENDPOINT = "endpoint"

class NodeStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPICIOUS = "suspicious"

class ErrorCode(str, Enum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTH_ERROR"
    AUTHORIZATION_ERROR = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    FILE_ERROR = "FILE_ERROR"
    ANALYSIS_ERROR = "ANALYSIS_ERROR"
    DATABASE_ERROR = "DB_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_ERROR"
    RATE_LIMIT_ERROR = "RATE_LIMIT"
    INTERNAL_ERROR = "INTERNAL_ERROR"

class EventType(str, Enum):
    # File Events
    FILE_UPLOAD = "file_upload"
    FILE_DELETE = "file_delete"
    FILE_UPDATE = "file_update"
    
    # Analysis Events
    ANALYSIS_START = "analysis_start"
    ANALYSIS_COMPLETE = "analysis_complete"
    ANALYSIS_FAILED = "analysis_failed"
    
    # User Events
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    
    # System Events
    SYSTEM_ERROR = "system_error"
    SYSTEM_WARNING = "system_warning"
    SYSTEM_INFO = "system_info"
    
    # Security Events
    SECURITY_ALERT = "security_alert"
    PERMISSION_CHANGE = "permission_change"
    ACCESS_DENIED = "access_denied" 