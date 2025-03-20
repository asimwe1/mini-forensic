import { apiService } from './api';

export interface DashboardStats {
  network: {
    traffic: number;
    connections: number;
    protocols: number;
  };
  memory: {
    usage: number;
    total: number;
    processes: number;
  };
  filesystem: {
    total_files: number;
    total_size: number;
    suspicious_files: number;
  };
  threats: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface Alert {
  id: string;
  type: "security" | "system" | "network" | "file";
  message: string;
  timestamp: string;
  source: string;
  status: "new" | "acknowledged" | "resolved";
}

export interface Activity {
  id: string;
  type: "user" | "system" | "file" | "search" | "security" | "analysis";
  description: string;
  timestamp: string;
  user?: string;
  details?: string;
}

export interface VisualizationData {
  network: {
    nodes: Array<{
      id: string;
      name: string;
      type: string;
      group: number;
      size: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      value: number;
      type: string;
    }>;
  };
  memory: {
    regions: Array<{
      id: string;
      address: string;
      size: number;
      type: string;
      permissions: string;
      process: string;
    }>;
    processes: Array<{
      id: string;
      name: string;
      pid: number;
      memory_usage: number;
      regions: string[];
    }>;
  };
  filesystem: {
    root: {
      id: string;
      name: string;
      type: "file" | "directory";
      size?: number;
      modified?: string;
      permissions?: string;
      children?: any[];
      suspicious?: boolean;
    };
  };
}

type UpdateCallback = (data: {
  type: "stats" | "alert" | "activity" | "visualization";
  payload: any;
}) => void;

class DashboardService {
  private ws: WebSocket | null = null;
  private updateCallbacks: Set<UpdateCallback> = new Set();

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.updateCallbacks.forEach((callback) => callback(data));
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      // Attempt to reconnect after a delay
      setTimeout(() => this.connectWebSocket(), 5000);
    };
  }

  subscribeToUpdates(callback: UpdateCallback) {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  async getStats(): Promise<DashboardStats> {
    const response = await apiService.get<DashboardStats>("/api/dashboard/stats");
    return response;
  }

  async getAlerts(): Promise<Alert[]> {
    const response = await apiService.get<Alert[]>("/api/dashboard/alerts");
    return response;
  }

  async getRecentActivity(): Promise<Activity[]> {
    const response = await apiService.get<Activity[]>("/api/dashboard/activity");
    return response;
  }

  async getVisualizationData(): Promise<VisualizationData> {
    const response = await apiService.get<VisualizationData>("/api/dashboard/visualization");
    return response;
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    await apiService.post(`/api/dashboard/alerts/${alertId}/acknowledge`);
  }

  async resolveAlert(alertId: string): Promise<void> {
    await apiService.post(`/api/dashboard/alerts/${alertId}/resolve`);
  }
}

export const dashboardService = new DashboardService(); 