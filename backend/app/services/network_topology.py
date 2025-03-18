import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import WebSocket
from models.network import NetworkNode, NetworkConnection
from schemas.network import NetworkTopologyResponse, NetworkMetrics
import networkx as nx
import logging
from core.enums import NodeType, NodeStatus
from models import NetworkAnalysis
from core.exceptions import FileAnalysisError

logger = logging.getLogger(__name__)

class NetworkTopologyService:
    def __init__(self):
        self.active_connections = {}
        self.graph = nx.DiGraph()

    async def analyze_pcap(self, file_path: str, db: Session) -> NetworkTopologyResponse:
        """Analyze PCAP file and build network topology."""
        try:
            # Use scapy to analyze PCAP file
            packets = rdpcap(file_path)
            nodes = set()
            connections = []
            
            for packet in packets:
                if IP in packet:
                    src_ip = packet[IP].src
                    dst_ip = packet[IP].dst
                    
                    # Add nodes
                    nodes.add(src_ip)
                    nodes.add(dst_ip)
                    
                    # Add connection
                    protocol = packet.name
                    port = packet[TCP].dport if TCP in packet else packet[UDP].dport if UDP in packet else None
                    
                    connections.append({
                        "source": src_ip,
                        "target": dst_ip,
                        "protocol": protocol,
                        "port": port,
                        "timestamp": datetime.fromtimestamp(packet.time)
                    })
            
            # Create network topology
            topology = self._build_topology(nodes, connections, db)
            return topology
            
        except Exception as e:
            logger.error(f"Failed to analyze PCAP file: {str(e)}")
            raise NetworkAnalysisError(f"PCAP analysis failed: {str(e)}")

    def _build_topology(self, nodes: set, connections: List[Dict], db: Session) -> NetworkTopologyResponse:
        """Build network topology from analyzed data."""
        network_nodes = []
        network_connections = []
        
        # Create nodes
        for ip in nodes:
            node_type = self._determine_node_type(ip, connections)
            node = NetworkNode(
                node_id=ip,
                label=self._get_hostname(ip),
                type=node_type,
                status="active",
                ip_address=ip
            )
            db.add(node)
            network_nodes.append(node)
            
        db.commit()
        
        # Create connections
        for conn in connections:
            source_node = db.query(NetworkNode).filter(NetworkNode.node_id == conn["source"]).first()
            target_node = db.query(NetworkNode).filter(NetworkNode.node_id == conn["target"]).first()
            
            if source_node and target_node:
                connection = NetworkConnection(
                    source_id=source_node.id,
                    target_id=target_node.id,
                    connection_type=self._determine_connection_type(conn),
                    protocol=conn["protocol"],
                    port=conn["port"],
                    status="active"
                )
                db.add(connection)
                network_connections.append(connection)
                
        db.commit()
        
        return NetworkTopologyResponse(
            nodes=network_nodes,
            connections=network_connections
        )

    async def stream_network_data(self, websocket: WebSocket, analysis_id: int):
        """Stream real-time network data updates."""
        await websocket.accept()
        self.active_connections[analysis_id] = websocket
        
        try:
            while True:
                # Get updated metrics
                metrics = await self._get_network_metrics(analysis_id)
                
                # Send updates to client
                await websocket.send_json(metrics.dict())
                
                # Wait before next update
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}")
        finally:
            del self.active_connections[analysis_id] 