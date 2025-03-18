from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData

# Create base class for SQLAlchemy models
Base = declarative_base(metadata=MetaData()) 