"use client";

import { useLanguage } from "@/components/language-provider";
import { Clock, User, FileText, Search, Shield, Activity } from "lucide-react";

interface Activity {
  id: string;
  type: "user" | "system" | "file" | "search" | "security" | "analysis";
  description: string;
  timestamp: string;
  user?: string;
  details?: string;
}

interface RecentActivityPanelProps {
  activities: Activity[];
}

export function RecentActivityPanel({ activities }: RecentActivityPanelProps) {
  const { t } = useLanguage();

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4 text-blue-500" />;
      case "system":
        return <Activity className="h-4 w-4 text-green-500" />;
      case "file":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "search":
        return <Search className="h-4 w-4 text-orange-500" />;
      case "security":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "analysis":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t("dashboard.no_activity")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{activity.timestamp}</span>
                </div>
              </div>
              {activity.user && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{activity.user}</span>
                </div>
              )}
              {activity.details && (
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
