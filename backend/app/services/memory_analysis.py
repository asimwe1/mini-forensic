import logging
import os
from concurrent.futures import ThreadPoolExecutor
from volatility3.framework import contexts, exceptions
from volatility3.framework.automagic import stacker
import volatility3.framework.interfaces.plugins as plugins
from app.core.db import SessionLocal
from app.models import MemoryAnalysis, File
from app.core.enums import AnalysisStatus
import json
from celery import Celery
from typing import Dict, List, Optional
from fastapi import WebSocket
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.websocket import websocket_manager
from app.services.status_service import status_service
from app.core.exceptions import AnalysisError
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")

def load_memory_dump(file_path):
    """Load a memory dump file with validation."""
    if not os.path.exists(file_path):
        logger.error(f"Memory dump file not found: {file_path}")
        raise FileNotFoundError(f"Memory dump file not found: {file_path}")
    try:
        context = contexts.Context()
        context.config['automagic.LayerStacker.single_location'] = f"file:{file_path}"
        stacker.run(context)
        logger.info(f"Loaded memory dump: {file_path}")
        return context
    except exceptions.VolatilityException as e:
        logger.error(f"Failed to load memory dump: {str(e)}")
        raise

def list_processes(context):
    """List processes as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.pslist.PsList')
    plugin.set_config_path('plugins.PsList')
    plugin.validate()
    grid = plugin.run()
    return [{"PID": row[0], "ProcessName": row[1], "PPID": row[2], "ImageFileName": row[3]} for row in grid]

def list_network_connections(context):
    """List network connections as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.netscan.NetScan')
    plugin.set_config_path('plugins.NetScan')
    plugin.validate()
    grid = plugin.run()
    return [{"LocalAddr": row[2], "RemoteAddr": row[3], "Protocol": row[1]} for row in grid]

def list_loaded_modules(context):
    """List loaded modules as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.modules.Modules')
    plugin.set_config_path('plugins.Modules')
    plugin.validate()
    grid = plugin.run()
    return [{"BaseAddress": row[0], "ModuleName": row[1]} for row in grid]

@app_celery.task
def analyze_memory_task(self, file_path: str, file_id: int):
    context = load_memory_dump(file_path)
    processes = list_processes(context)
    network_connections = list_network_connections(context)
    loaded_modules = list_loaded_modules(context)

    result = {
        "processes": processes,
        "network_connections": network_connections,
        "loaded_modules": loaded_modules
    }

    db = SessionLocal()
    analysis = MemoryAnalysis(
        file_id=file_id,
        status=AnalysisStatus.IN_PROGRESS,
        started_at=datetime.utcnow()
    )
    db.add(analysis)
    db.commit()

    # TODO: Implement actual memory analysis logic here
    # For now, we'll return mock data
    analysis_result = {
        "processes": [
            {
                "pid": 1234,
                "name": "explorer.exe",
                "memory_usage": 1024000,
                "threads": 8,
                "status": "running"
            }
        ],
        "memory_regions": [
            {
                "address": "0x00400000",
                "size": 4096,
                "type": "code",
                "permissions": "r-x",
                "description": "Main executable code"
            }
        ],
        "statistics": {
            "total_memory": 8589934592,  # 8GB
            "used_memory": 4294967296,  # 4GB
            "process_count": 50
        }
    }

    # Update analysis record
    analysis.status = AnalysisStatus.COMPLETED
    analysis.result_json = json.dumps(analysis_result)
    analysis.completed_at = datetime.utcnow()
    db.commit()

    db.close()

    return analysis_result

class MemoryAnalysisService:
    def __init__(self):
        self.status_service = status_service

    async def analyze_memory_task(self, file_id: int, db: Session) -> Dict:
        """Analyze memory dump file."""
        try:
            # Create analysis record
            analysis = MemoryAnalysis(
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
                "processes": [
                    {
                        "pid": 1234,
                        "name": "explorer.exe",
                        "memoryUsage": 1024 * 1024 * 50,  # 50MB
                        "threads": 5,
                        "status": "running"
                    },
                    {
                        "pid": 5678,
                        "name": "chrome.exe",
                        "memoryUsage": 1024 * 1024 * 200,  # 200MB
                        "threads": 8,
                        "status": "running"
                    }
                ],
                "memory_regions": [
                    {
                        "address": "0x00400000",
                        "size": 1024 * 1024,
                        "type": "Code",
                        "permissions": "r-x",
                        "description": "Main executable code"
                    },
                    {
                        "address": "0x00600000",
                        "size": 2 * 1024 * 1024,
                        "type": "Data",
                        "permissions": "rw-",
                        "description": "Global variables"
                    }
                ],
                "statistics": {
                    "total_memory": 16 * 1024 * 1024 * 1024,  # 16GB
                    "used_memory": 8 * 1024 * 1024 * 1024,   # 8GB
                    "process_count": 2
                }
            }

            # Update analysis with results
            analysis.result = result
            analysis.status = AnalysisStatus.COMPLETED
            analysis.completed_at = datetime.utcnow()
            db.commit()

            return result

        except Exception as e:
            logger.error(f"Memory analysis failed: {str(e)}")
            if analysis:
                analysis.status = AnalysisStatus.FAILED
                analysis.error_message = str(e)
                db.commit()
            raise AnalysisError(f"Memory analysis failed: {str(e)}")

    async def stream_memory_data(self, analysis_id: int, websocket: WebSocket):
        """Stream real-time memory analysis data."""
        try:
            await websocket.accept()
            
            # Send initial data
            await websocket.send_json({
                "type": "initial_data",
                "data": {
                    "processes": [
                        {
                            "pid": 1234,
                            "name": "explorer.exe",
                            "memoryUsage": 1024 * 1024 * 50,
                            "threads": 5,
                            "status": "running"
                        }
                    ],
                    "memory_regions": [
                        {
                            "address": "0x00400000",
                            "size": 1024 * 1024,
                            "type": "Code",
                            "permissions": "r-x",
                            "description": "Main executable code"
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
                        "process_updates": [
                            {
                                "pid": 1234,
                                "memoryUsage": 1024 * 1024 * 55  # Updated memory usage
                            }
                        ]
                    }
                })

        except Exception as e:
            logger.error(f"Error streaming memory data: {str(e)}")
            await websocket.close()

    async def get_memory_analysis(self, file_id: int, db: Session) -> Optional[Dict]:
        """Get the latest memory analysis for a file."""
        analysis = db.query(MemoryAnalysis).filter(
            MemoryAnalysis.file_id == file_id
        ).order_by(MemoryAnalysis.created_at.desc()).first()
        
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

    async def get_memory_statistics(self, file_id: int, db: Session) -> Dict:
        """Get memory analysis statistics."""
        analysis = await self.get_memory_analysis(file_id, db)
        if not analysis or not analysis["result"]:
            return {
                "total_memory": 0,
                "used_memory": 0,
                "process_count": 0
            }
            
        return analysis["result"]["statistics"]

if __name__ == "__main__":
    file_path = "../../../uploads/memory-dumps/win7_trial_1.vmem"
    result = analyze_memory_task(file_path)
    print("Processes:", result["processes"])
    print("Network Connections:", result["network_connections"])
    print("Loaded Modules:", result["loaded_modules"])