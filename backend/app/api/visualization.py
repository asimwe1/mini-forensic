from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from core.db import get_db
from core.auth import get_current_user, TokenData
from services.visualization import VisualizationService
from schemas.visualization import (
    GraphVisualizationResponse,
    TimeSeriesDataResponse,
    SearchResult
)

router = APIRouter(prefix="/api/v1/visualization", tags=["visualization"])

@router.get("/graph/{analysis_id}", response_model=GraphVisualizationResponse)
async def get_graph_data(
    analysis_id: int,
    graph_type: str = Query(..., enum=["network", "filesystem", "memory"]),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get graph visualization data for an analysis."""
    service = VisualizationService(db)
    return service.get_graph_data(analysis_id, graph_type)

@router.get("/timeseries/{analysis_id}", response_model=TimeSeriesDataResponse)
async def get_timeseries_data(
    analysis_id: int,
    metric: str = Query(..., description="Metric to visualize"),
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get time series data for visualizations."""
    try:
        data = await visualization_service.generate_timeseries_data(
            analysis_id,
            metric,
            start_time,
            end_time,
            db
        )
        return data
    except Exception as e:
        logger.error(f"Failed to generate time series data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate time series data"
        ) 