from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum, Float
from sqlalchemy.orm import relationship
from core.base import Base
from datetime import datetime
import enum

class NodeType(str, enum.Enum):
    HOST = "host"
    ROUTER = "router"
    SWITCH = "switch"
    ENDPOINT = "endpoint"
    SERVER = "server"
    UNKNOWN = "unknown"

class TopologyNode(Base):
    __tablename__ = "topology_nodes"

    id = Column(Integer, primary_key=True)
    analysis_id = Column(Integer, ForeignKey("network_analyses.id"), nullable=False)
    node_type = Column(Enum(NodeType), default=NodeType.UNKNOWN)
    ip_address = Column(String)
    hostname = Column(String)
    mac_address = Column(String)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)
    coordinates = Column(JSON)  # For visualization positioning
    
    connections = relationship("TopologyConnection", back_populates="source_node")
    metrics = relationship("NodeMetrics", back_populates="node")

class TopologyConnection(Base):
    __tablename__ = "topology_connections"

    id = Column(Integer, primary_key=True)
    analysis_id = Column(Integer, ForeignKey("network_analyses.id"), nullable=False)
    source_id = Column(Integer, ForeignKey("topology_nodes.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("topology_nodes.id"), nullable=False)
    protocol = Column(String)
    port = Column(Integer)
    bytes_transferred = Column(Integer, default=0)
    packet_count = Column(Integer, default=0)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON)
    
    source_node = relationship("TopologyNode", back_populates="connections")
    metrics = relationship("ConnectionMetrics", back_populates="connection")

class NodeMetrics(Base):
    __tablename__ = "node_metrics"

    id = Column(Integer, primary_key=True)
    node_id = Column(Integer, ForeignKey("topology_nodes.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    bytes_in = Column(Integer, default=0)
    bytes_out = Column(Integer, default=0)
    packets_in = Column(Integer, default=0)
    packets_out = Column(Integer, default=0)
    connections_count = Column(Integer, default=0)
    average_response_time = Column(Float)
    
    node = relationship("TopologyNode", back_populates="metrics")

class ConnectionMetrics(Base):
    __tablename__ = "connection_metrics"

    id = Column(Integer, primary_key=True)
    connection_id = Column(Integer, ForeignKey("topology_connections.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    throughput = Column(Float)
    latency = Column(Float)
    packet_loss = Column(Float)
    error_rate = Column(Float)
    
    connection = relationship("TopologyConnection", back_populates="metrics") 