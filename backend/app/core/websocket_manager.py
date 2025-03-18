from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Any
import asyncio
import json
from datetime import datetime
from core.auth import verify_token
from core.exceptions import WebSocketAuthError

class WebSocketManager:
    def __init__(self):
        self.connections: Dict[str, Dict[str, WebSocket]] = {
            "analysis": {},
            "filesystem": {},
            "network": {}
        }
        self.user_sessions: Dict[int, Set[str]] = {}  # user_id -> set of session_ids

    async def authenticate(self, token: str) -> int:
        """Authenticate WebSocket connection using JWT."""
        try:
            payload = verify_token(token)
            return payload["sub"]
        except Exception as e:
            raise WebSocketAuthError("Invalid authentication token")

    async def connect(self, websocket: WebSocket, channel: str, user_id: int, session_id: str):
        """Establish WebSocket connection with session tracking."""
        await websocket.accept()
        self.connections[channel][session_id] = websocket
        
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = set()
        self.user_sessions[user_id].add(session_id)

    async def disconnect(self, channel: str, session_id: str, user_id: int):
        """Handle WebSocket disconnection."""
        if session_id in self.connections[channel]:
            del self.connections[channel][session_id]
        
        if user_id in self.user_sessions:
            self.user_sessions[user_id].remove(session_id)

    async def broadcast_to_user(self, user_id: int, message: Any):
        """Broadcast message to all user's active sessions."""
        if user_id in self.user_sessions:
            for session_id in self.user_sessions[user_id]:
                for channel in self.connections:
                    if session_id in self.connections[channel]:
                        try:
                            await self.connections[channel][session_id].send_json({
                                "timestamp": datetime.utcnow().isoformat(),
                                "data": message
                            })
                        except Exception as e:
                            await self.disconnect(channel, session_id, user_id)

websocket_manager = WebSocketManager() 