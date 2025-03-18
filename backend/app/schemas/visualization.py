from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

class TimelineEvent(BaseModel):
    """Model for a single timeline event."""
    timestamp: datetime
    event: str
    details: Dict

class NetworkNode(BaseModel):
    """Model for a network node in topology."""
    id: str
    label: str
    type: str
    metadata: Optional[Dict] = None

class NetworkConnection(BaseModel):
    """Model for a network connection in topology."""
    source: str
    target: str
    type: str
    metadata: Optional[Dict] = None

class NetworkTopology(BaseModel):
    """Model for network topology visualization data."""
    nodes: List[NetworkNode]
    connections: List[NetworkConnection]
    metadata: Optional[Dict] = None

class MemoryProcess(BaseModel):
    """Model for a process in memory analysis."""
    pid: int
    name: str
    command_line: Optional[str] = None
    start_time: Optional[datetime] = None
    metadata: Optional[Dict] = None

class MemoryAnalysis(BaseModel):
    """Model for memory analysis visualization data."""
    processes: List[MemoryProcess]
    loaded_modules: List[Dict]
    network_connections: List[Dict]
    metadata: Optional[Dict] = None

class FileAnalysisTimeline(BaseModel):
    """Model for file analysis timeline."""
    events: List[TimelineEvent]
    metadata: Optional[Dict] = None

class GraphVisualizationResponse(BaseModel):
    """Response model for graph visualization data."""
    nodes: List[Dict]
    edges: List[Dict]
    metadata: Optional[Dict] = None

class TimeSeriesDataResponse(BaseModel):
    """Response model for time series visualization data."""
    timestamps: List[datetime]
    values: List[float]
    labels: Optional[List[str]] = None
    metadata: Optional[Dict] = None

class SearchResult(BaseModel):
    """Model for search results visualization."""
    id: str
    type: str
    title: str
    description: Optional[str] = None
    relevance_score: float
    metadata: Optional[Dict] = None 