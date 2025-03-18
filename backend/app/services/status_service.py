from typing import Dict, Any, Optional
import asyncio
from datetime import datetime
from core.websocket_manager import websocket_manager

class StatusService:
    def __init__(self):
        self.status_updates: Dict[int, Dict[str, Any]] = {}

    async def update_status(
        self,
        user_id: int,
        resource_type: str,
        resource_id: str,
        status: str,
        progress: Optional[float] = None,
        metadata: Optional[Dict] = None
    ):
        """Update status and notify connected clients."""
        update = {
            "type": "status_update",
            "resource_type": resource_type,
            "resource_id": resource_id,
            "status": status,
            "progress": progress,
            "metadata": metadata,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Store status update
        self.status_updates[user_id] = update
        
        # Broadcast to user's connected clients
        await websocket_manager.broadcast_to_user(user_id, update)

status_service = StatusService() 