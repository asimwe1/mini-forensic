import logging
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from app.schemas.search import SearchRequest, SearchResponse, SearchResult

logger = logging.getLogger(__name__)

class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.es = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
        
    async def search(self, request: SearchRequest) -> SearchResponse:
        try:
            query = {
                "bool": {
                    "must": [
                        {"multi_match": {
                            "query": request.query,
                            "fields": ["filename^2", "content", "metadata.*"]
                        }}
                    ]
                }
            }
            
            if request.filters:
                for key, value in request.filters.items():
                    query["bool"]["must"].append({"term": {key: value}})
            
            result = await self.es.search(
                index="forensic-data",
                query=query,
                from_=(request.page - 1) * request.page_size,
                size=request.page_size,
                highlight={
                    "fields": {
                        "content": {},
                        "filename": {}
                    }
                }
            )
            
            hits = result["hits"]["hits"]
            total = result["hits"]["total"]["value"]
            
            return SearchResponse(
                results=[
                    SearchResult(
                        id=hit["_id"],
                        type=hit["_source"]["type"],
                        title=hit["_source"]["filename"],
                        description=hit.get("highlight", {}).get("content", [""])[0],
                        relevance_score=hit["_score"],
                        metadata=hit["_source"].get("metadata", {})
                    )
                    for hit in hits
                ],
                total=total,
                page=request.page,
                page_size=request.page_size,
                total_pages=(total + request.page_size - 1) // request.page_size
            )
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise 