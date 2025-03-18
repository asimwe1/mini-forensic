from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum

class NodeType(str, Enum):
    HOST = "host"
    SERVICE = "service"
    CLIENT = "client"
    ROUTER = "router"

class NetworkNodeResponse(BaseModel):
    id: str
    label: str
    type: NodeType
    status: str
    ip_address: Optional[str] = None
    metadata: Optional[Dict] = None
    
    class Config:
        orm_mode = True

class NetworkConnectionResponse(BaseModel):
    source: str
    target: str
    type: str
    status: str
    protocol: Optional[str] = None
    port: Optional[int] = None
    
    class Config:
        orm_mode = True

class NetworkTopologyResponse(BaseModel):
    nodes: List[NetworkNodeResponse]
    connections: List[NetworkConnectionResponse]

class NetworkMetrics(BaseModel):
    total_bytes: int
    packets_per_second: float
    active_connections: int
    unique_ips: int
    protocols: Dict[str, int]
    top_talkers: List[Dict[str, any]]
    timestamp: datetime 