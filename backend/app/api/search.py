from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.core.auth import get_current_user, TokenData
from app.core.db import get_db
from app.services.search import SearchService

router = APIRouter(prefix="/api/v1/search", tags=["search"])

es = AsyncElasticsearch([settings.ELASTICSEARCH_URL])

@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1),
    type: Optional[str] = Query(None, enum=["file", "network", "memory"]),
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: TokenData = Depends(get_current_user)
):
    """Search across all indexed data."""
    try:
        # Build search query
        query = {
            "bool": {
                "must": [
                    {"multi_match": {
                        "query": q,
                        "fields": ["filename^2", "content", "metadata.*"]
                    }},
                    {"term": {"user_id": current_user.id}}
                ]
            }
        }
        
        # Add type filter if specified
        if type:
            query["bool"]["must"].append({"term": {"type": type}})
            
        # Add date range if specified
        if from_date or to_date:
            date_range = {}
            if from_date:
                date_range["gte"] = from_date
            if to_date:
                date_range["lte"] = to_date
            query["bool"]["must"].append({"range": {"created_at": date_range}})
        
        # Execute search
        result = await es.search(
            index="forensic-data",
            query=query,
            from_=(page - 1) * size,
            size=size,
            highlight={
                "fields": {
                    "content": {},
                    "filename": {}
                }
            }
        )
        
        # Format results
        hits = result["hits"]["hits"]
        total = result["hits"]["total"]["value"]
        
        return SearchResponse(
            results=[
                SearchResult(
                    id=hit["_id"],
                    type=hit["_source"]["type"],
                    title=hit["_source"]["filename"],
                    snippet=hit.get("highlight", {}).get("content", [""])[0],
                    score=hit["_score"],
                    metadata=hit["_source"].get("metadata", {})
                )
                for hit in hits
            ],
            total=total,
            page=page,
            pages=math.ceil(total / size)
        )
        
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Search operation failed"
        )

@router.post("/", response_model=SearchResponse)
async def search_post(
    request: SearchRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform a search across all indexed data."""
    service = SearchService(db)
    return await service.search(request) 