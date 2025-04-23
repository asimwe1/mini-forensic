import os
import json
import logging
import subprocess
from celery import Celery
from typing import Dict, List, Optional
from app.core.db import SessionLocal
from app.models import NetworkAnalysis, File
from scapy.all import rdpcap  # Kept for potential custom use cases
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.core.enums import AnalysisStatus
import asyncio
from datetime import datetime
from app.core.websocket import websocket_manager
from app.services.status_service import status_service
from app.core.exceptions import AnalysisError
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Celery setup
app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")

def validate_pcap_file(pcap_file: str) -> None:
    """Validate the existence and readability of the PCAP file."""
    if not os.path.exists(pcap_file):
        logger.error(f"PCAP file not found: {pcap_file}")
        raise FileNotFoundError(f"PCAP file not found: {pcap_file}")
    if not os.access(pcap_file, os.R_OK):
        logger.error(f"PCAP file not readable: {pcap_file}")
        raise PermissionError(f"PCAP file not readable: {pcap_file}")

def analyze_with_tshark(pcap_file: str) -> Dict:
    """
    Analyze a PCAP file using TShark with detailed forensic insights.
    Returns structured JSON data including summary stats and packet details.
    """
    validate_pcap_file(pcap_file)

    # Define TShark fields for comprehensive analysis
    fields = [
        "-e frame.time",          # Timestamp
        "-e ip.src",              # Source IP
        "-e ip.dst",              # Destination IP
        "-e tcp.srcport",         # Source port
        "-e tcp.dstport",         # Destination port
        "-e udp.srcport",         # UDP source port
        "-e udp.dstport",         # UDP destination port
        "-e ip.proto",            # Protocol number
        "-e http.request.method", # HTTP method (if applicable)
        "-e dns.qry.name",        # DNS query name (if applicable)
        "-e frame.len"            # Packet length
    ]
    tshark_command = ["tshark", "-r", pcap_file, "-T", "json"] + fields

    try:
        logger.info(f"Running TShark analysis on {pcap_file}")
        process = subprocess.run(
            tshark_command,
            capture_output=True,
            text=True,
            check=True
        )
        raw_results = json.loads(process.stdout)
    except subprocess.CalledProcessError as e:
        logger.error(f"TShark failed: {e.stderr}")
        raise RuntimeError(f"TShark analysis failed: {e.stderr}")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse TShark output: {str(e)}")
        raise ValueError(f"Invalid TShark JSON output: {str(e)}")

    # Process results into a structured format
    packets = []
    protocols = {}
    top_talkers = {}
    total_bytes = 0

    for packet in raw_results:
        try:
            source = packet["_source"]["layers"]
            pkt_data = {
                "timestamp": source.get("frame.time", ["N/A"])[0],
                "src_ip": source.get("ip.src", ["N/A"])[0],
                "dst_ip": source.get("ip.dst", ["N/A"])[0],
                "src_port": source.get("tcp.srcport", source.get("udp.srcport", ["N/A"]))[0],
                "dst_port": source.get("tcp.dstport", source.get("udp.dstport", ["N/A"]))[0],
                "protocol": source.get("ip.proto", ["N/A"])[0],
                "http_method": source.get("http.request.method", ["N/A"])[0],
                "dns_query": source.get("dns.qry.name", ["N/A"])[0],
                "length": int(source.get("frame.len", ["0"])[0])
            }
            packets.append(pkt_data)

            # Aggregate stats
            proto = pkt_data["protocol"]
            protocols[proto] = protocols.get(proto, 0) + 1
            src_ip = pkt_data["src_ip"]
            top_talkers[src_ip] = top_talkers.get(src_ip, 0) + pkt_data["length"]
            total_bytes += pkt_data["length"]
        except (KeyError, IndexError) as e:
            logger.warning(f"Skipping malformed packet: {str(e)}")

    # Summarize results
    summary = {
        "packet_count": len(packets),
        "total_bytes": total_bytes,
        "protocol_distribution": protocols,
        "top_talkers": dict(sorted(top_talkers.items(), key=lambda x: x[1], reverse=True)[:5])
    }

    return {"summary": summary, "packets": packets}

@app_celery.task(bind=True)
def analyze_network_task(self, pcap_file: str, file_id: int) -> Dict:
    tshark_results = analyze_with_tshark(pcap_file)

    db.session = SessionLocal()
    analysis = NetworkAnalysis(
        file_id=file_id,
        result_json=json.dumps(tshark_results)
    )
    db.session.add(analysis)
    db.session.commit()
    db.session.close()

    return tshark_results

def analyze_with_scapy(pcap_file: str) -> List[str]:
    """
    Analyze a PCAP file with Scapy (optional, kept for custom use cases).
    """
    validate_pcap_file(pcap_file)
    try:
        packets = rdpcap(pcap_file)
        return [packet.summary() for packet in packets]
    except Exception as e:
        logger.error(f"Scapy analysis failed: {str(e)}")
        raise

class NetworkAnalysisService:
    def __init__(self):
        self.status_service = status_service

    async def analyze_network_task(self, file_id: int, db: Session) -> Dict:
        """Analyze network traffic from PCAP file."""
        try:
            # Create analysis record
            analysis = NetworkAnalysis(
                file_id=file_id,
                status=AnalysisStatus.PENDING,
                started_at=datetime.utcnow()
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)

            # Simulate analysis process
            await self.status_service.update_status(analysis.id, AnalysisStatus.RUNNING)
            
            # Mock data for demonstration
            result = {
                "connections": [
                    {
                        "id": 1,
                        "source_ip": "192.168.1.100",
                        "dest_ip": "8.8.8.8",
                        "protocol": "TCP",
                        "source_port": 54321,
                        "dest_port": 443,
                        "status": "established",
                        "bytes_sent": 1024 * 100,
                        "bytes_received": 1024 * 200
                    },
                    {
                        "id": 2,
                        "source_ip": "192.168.1.100",
                        "dest_ip": "1.1.1.1",
                        "protocol": "UDP",
                        "source_port": 123,
                        "dest_port": 53,
                        "status": "completed",
                        "bytes_sent": 512,
                        "bytes_received": 1024
                    }
                ],
                "statistics": {
                    "total_packets": 1000,
                    "total_bytes": 1024 * 1024 * 10,  # 10MB
                    "protocols": {
                        "TCP": 800,
                        "UDP": 200
                    }
                }
            }

            # Update analysis with results
            analysis.result = result
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.utcnow()
            db.commit()

            return result

        except Exception as e:
            logger.error(f"Network analysis failed: {str(e)}")
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                db.commit()
            raise AnalysisError(f"Network analysis failed: {str(e)}")

    async def stream_network_data(self, analysis_id: int, websocket: WebSocket):
        """Stream real-time network analysis data."""
        try:
            await websocket.accept()
            
            # Send initial data
            await websocket.send_json({
                "type": "initial_data",
                "data": {
                    "connections": [
                        {
                            "id": 1,
                            "source_ip": "192.168.1.100",
                            "dest_ip": "8.8.8.8",
                            "protocol": "TCP",
                            "source_port": 54321,
                            "dest_port": 443,
                            "status": "established",
                            "bytes_sent": 1024 * 100,
                            "bytes_received": 1024 * 200
                        }
                    ]
                }
            })

            # Simulate real-time updates
            while True:
                await asyncio.sleep(5)
                await websocket.send_json({
                    "type": "update",
                    "data": {
                        "connection_updates": [
                            {
                                "id": 1,
                                "bytes_sent": 1024 * 150,  # Updated bytes sent
                                "bytes_received": 1024 * 250  # Updated bytes received
                            }
                        ]
                    }
                })

        except Exception as e:
            logger.error(f"Error streaming network data: {str(e)}")
            await websocket.close()

    async def get_network_analysis(self, file_id: int, db: Session) -> Optional[Dict]:
        """Get the latest network analysis for a file."""
        analysis = db.query(NetworkAnalysis).filter(
            NetworkAnalysis.file_id == file_id
        ).order_by(NetworkAnalysis.created_at.desc()).first()
        
        if not analysis:
            return None
            
        return {
            "id": analysis.id,
            "file_id": analysis.file_id,
            "status": analysis.status,
            "result": analysis.result,
            "error_message": analysis.error_message,
            "started_at": analysis.started_at,
            "completed_at": analysis.completed_at
        }

    async def get_network_statistics(self, file_id: int, db: Session) -> Dict:
        """Get network analysis statistics."""
        analysis = await self.get_network_analysis(file_id, db)
        if not analysis or not analysis["result"]:
            return {
                "total_packets": 0,
                "total_bytes": 0,
                "protocols": {}
            }
            
        return analysis["result"]["statistics"]

if __name__ == "__main__":
    pcap_file = "upload.pcap"
    results = analyze_network_task(pcap_file)
    print(json.dumps(results, indent=4))