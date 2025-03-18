from fastapi import APIRouter, Depends, WebSocket, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.db import get_db
from core.auth import get_current_user
from services.network_topology import NetworkTopologyService
from schemas.network import (
    NetworkTopologyResponse,
    NetworkMetrics,
    NetworkNodeResponse,
    NetworkConnectionResponse
)

router = APIRouter(prefix="/api/v1/network", tags=["network"])

network_service = NetworkTopologyService()

@router.get("/topology/{analysis_id}", response_model=NetworkTopologyResponse)
async def get_network_topology(
    analysis_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get network topology for a specific analysis."""
    try:
        # Verify user has access to this analysis
        analysis = db.query(NetworkAnalysis).filter(
            NetworkAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
            
        # Get topology
        nodes = db.query(NetworkNode).filter(
            NetworkNode.analysis_id == analysis_id
        ).all()
        
        connections = db.query(NetworkConnection).filter(
            NetworkConnection.source_node.has(analysis_id=analysis_id)
        ).all()
        
        return NetworkTopologyResponse(
            nodes=[NetworkNodeResponse.from_orm(node) for node in nodes],
            connections=[NetworkConnectionResponse.from_orm(conn) for conn in connections]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get network topology: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve network topology"
        )

@router.websocket("/ws/{analysis_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    analysis_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket endpoint for real-time network data."""
    try:
        # Verify token
        user = await get_current_user(token)
        
        # Start streaming
        await network_service.stream_network_data(websocket, analysis_id)
        
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close(code=1008)

@router.get("/metrics/{analysis_id}", response_model=NetworkMetrics)
async def get_network_metrics(
    analysis_id: int,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get aggregated network metrics."""
    try:
        metrics = await network_service._get_network_metrics(analysis_id)
        return metrics
    except Exception as e:
        logger.error(f"Failed to get network metrics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve network metrics"
        ) 