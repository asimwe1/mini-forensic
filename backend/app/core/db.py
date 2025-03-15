import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import os
from dotenv import load_dotenv
from core.base import Base

# Load environment variables from .env file
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./forensics_lab.db")
# For SQLite, enforce single-threaded access unless overridden
SQLITE_CONNECT_ARGS = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

# Create SQLAlchemy engine with connection pooling and retry logic
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(SQLAlchemyError),
    before_sleep=lambda retry_state: logger.warning(
        f"Retrying database connection (attempt {retry_state.attempt_number})..."
    )
)
def create_db_engine():
    """Create and return a SQLAlchemy engine with retry logic."""
    try:
        engine = create_engine(
            DATABASE_URL,
            connect_args=SQLITE_CONNECT_ARGS,
            pool_size=5,          # Max number of connections in the pool
            max_overflow=10,      # Max additional connections beyond pool_size
            pool_timeout=30,      # Timeout for acquiring a connection
            pool_pre_ping=True    # Check connection health before use
        )
        logger.info(f"Database engine created for {DATABASE_URL}")
        return engine
    except SQLAlchemyError as e:
        logger.error(f"Failed to create database engine: {str(e)}")
        raise

# Initialize engine
engine = create_db_engine()

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Generator:
    """
    Dependency function to provide a database session.
    Yields a session and ensures it is closed after use.
    
    Usage:
        @app.get("/example")
        def example(db: Session = Depends(get_db)):
            return db.query(Model).all()
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()
        logger.debug("Database session closed")

def init_db():
    """Initialize the database by creating all tables defined in models."""
    from models import File, Log, MemoryAnalysis, NetworkAnalysis, FileAnalysis, User, Report, Task
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except SQLAlchemyError as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage: Initialize the database when running this file directly
    init_db()