from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class SearchRequest(BaseModel):
    """Request model for search operations."""
    query: str
    filters: Optional[Dict] = None
    page: int = 1
    page_size: int = 10
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"

class SearchResult(BaseModel):
    """Model for individual search results."""
    id: str
    type: str
    title: str
    description: Optional[str] = None
    relevance_score: float
    metadata: Optional[Dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SearchResponse(BaseModel):
    """Response model for search operations."""
    results: List[SearchResult]
    total: int
    page: int
    page_size: int
    total_pages: int
    metadata: Optional[Dict] = None 