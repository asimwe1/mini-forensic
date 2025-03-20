"use client";

import { useLanguage } from "@/components/language-provider";
import { AlertCircle, Shield, Activity, FileWarning } from "lucide-react";

interface Alert {
  id: string;
  type: "security" | "system" | "network" | "file";
  message: string;
  timestamp: string;
  source: string;
  status: "new" | "acknowledged" | "resolved";
}

interface AlertPanelProps {
  alerts: Alert[];
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const { t } = useLanguage();

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "system":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      case "network":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "file":
        return <FileWarning className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "new":
        return "bg-red-500";
      case "acknowledged":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("dashboard.no_alerts")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {alert.message}
                </p>
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(
                    alert.status
                  )}`}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{alert.source}</span>
                <span>•</span>
                <span>{alert.timestamp}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
