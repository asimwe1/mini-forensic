from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from core.base import Base
from datetime import datetime
from enum import Enum as PyEnum

class NodeType(str, PyEnum):
    HOST = "host"
    SERVICE = "service"
    CLIENT = "client"
    ROUTER = "router"

class NodeStatus(str, PyEnum):
    ACTIVE = "active"
    WARNING = "warning"
    INACTIVE = "inactive"

class ConnectionType(str, PyEnum):
    HTTP = "http"
    HTTPS = "https"
    TCP = "tcp"
    UDP = "udp"

class NetworkNode(Base):
    __tablename__ = "network_nodes"
    
    id = Column(Integer, primary_key=True)
    node_id = Column(String, unique=True, index=True)
    label = Column(String, nullable=False)
    type = Column(Enum(NodeType))
    status = Column(Enum(NodeStatus))
    ip_address = Column(String)
    last_seen = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)
    analysis_id = Column(Integer, ForeignKey("network_analyses.id"))

    connections = relationship("NetworkConnection", back_populates="source_node")

class NetworkConnection(Base):
    __tablename__ = "network_connections"
    
    id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey("network_nodes.id"))
    target_id = Column(Integer, ForeignKey("network_nodes.id"))
    connection_type = Column(Enum(ConnectionType))
    status = Column(Enum(NodeStatus))
    protocol = Column(String)
    port = Column(Integer)
    bytes_transferred = Column(Integer, default=0)
    packets_transferred = Column(Integer, default=0)
    last_activity = Column(DateTime, default=datetime.utcnow)
    
    source_node = relationship("NetworkNode", back_populates="connections") 