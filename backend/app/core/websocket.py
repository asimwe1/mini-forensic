from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.connection_times: Dict[str, datetime] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = []
        self.active_connections[client_id].append(websocket)
        self.connection_times[client_id] = datetime.now()
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            self.active_connections[client_id].remove(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
                del self.connection_times[client_id]
        logger.info(f"Client {client_id} disconnected. Remaining connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_json(message)
                except WebSocketDisconnect:
                    await self.disconnect(connection, client_id)
                except Exception as e:
                    logger.error(f"Error sending message to client {client_id}: {str(e)}")
                    await self.disconnect(connection, client_id)

    async def broadcast(self, message: dict):
        disconnected_clients = []
        for client_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except WebSocketDisconnect:
                    disconnected_clients.append((connection, client_id))
                except Exception as e:
                    logger.error(f"Error broadcasting to client {client_id}: {str(e)}")
                    disconnected_clients.append((connection, client_id))
        
        # Clean up disconnected clients
        for connection, client_id in disconnected_clients:
            await self.disconnect(connection, client_id)

    def get_connection_count(self) -> int:
        return sum(len(connections) for connections in self.active_connections.values())

    def get_client_connection_time(self, client_id: str) -> datetime:
        return self.connection_times.get(client_id)

websocket_manager = WebSocketManager() 