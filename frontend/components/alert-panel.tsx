"use client";

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, ShieldAlert, ShieldCheck, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Alert {
  id: number;
  level: "high" | "medium" | "low";
  message: string;
  timestamp: string;
  category: "security" | "system" | "network" | "application";
  status: "new" | "acknowledged" | "resolved";
}

const mockAlerts: Alert[] = [
  {
    id: 1,
    level: "high",
    message: "Suspicious memory access at 0x7FFF1234",
    timestamp: "2 min ago",
    category: "security",
    status: "new",
  },
  {
    id: 2,
    level: "medium",
    message: "Unusual network traffic to 192.168.1.45",
    timestamp: "15 min ago",
    category: "network",
    status: "acknowledged",
  },
  {
    id: 3,
    level: "low",
    message: "Multiple failed login attempts",
    timestamp: "1 hour ago",
    category: "security",
    status: "resolved",
  },
  {
    id: 4,
    level: "high",
    message: "Critical system file modification detected",
    timestamp: "3 hours ago",
    category: "system",
    status: "new",
  },
  {
    id: 5,
    level: "medium",
    message: "Application crash detected in process explorer.exe",
    timestamp: "5 hours ago",
    category: "application",
    status: "acknowledged",
  },
];

export function AlertPanel() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filterLevel, setFilterLevel] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [filterCategory, setFilterCategory] = useState<
    "all" | Alert["category"]
  >("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Alert["status"]>(
    "all"
  );

  const filteredAlerts = alerts.filter((alert) => {
    const matchesLevel = filterLevel === "all" || alert.level === filterLevel;
    const matchesCategory =
      filterCategory === "all" || alert.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || alert.status === filterStatus;
    return matchesLevel && matchesCategory && matchesStatus;
  });

  const getAlertColor = (level: Alert["level"]) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-orange-400/20 text-orange-400";
      case "low":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: Alert["status"]) => {
    switch (status) {
      case "new":
        return "bg-primary/20 text-primary";
      case "acknowledged":
        return "bg-yellow-400/20 text-yellow-400";
      case "resolved":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const acknowledgeAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "acknowledged" } : alert
      )
    );
  };

  const resolveAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "resolved" } : alert
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Alerts
        </CardTitle>
        <Badge variant="outline" className="bg-destructive/20">
          {alerts.filter((a) => a.status === "new").length} new
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={filterLevel}
              onValueChange={(value: any) => setFilterLevel(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCategory}
              onValueChange={(value: any) => setFilterCategory(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="application">Application</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(value: any) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start space-x-3"
                >
                  <div className="mt-0.5">
                    {alert.level === "high" ? (
                      <ShieldAlert className="h-5 w-5 text-destructive pulse" />
                    ) : alert.level === "medium" ? (
                      <ShieldAlert className="h-5 w-5 text-orange-400" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {alert.message}
                      </p>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </p>
                      <Badge
                        variant="outline"
                        className={getAlertColor(alert.level)}
                      >
                        {alert.level}
                      </Badge>
                      <Badge variant="outline">{alert.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.status === "new" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {alert.status !== "resolved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
