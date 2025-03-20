"use client";

import { useEffect, useState } from "react";
import { LabSidebar } from "@/components/lab-sidebar";
import { AlertPanel } from "@/components/alert-panel";
import { RecentActivityPanel } from "@/components/recent-activity-panel";
import { NetworkGraph } from "@/components/network-graph";
import { MemoryVisualizer } from "@/components/memory-visualizer";
import { FileSystemExplorer } from "@/components/filesystem-explorer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/language-provider";
import {
  ActivitySquare,
  Database,
  FileDigit,
  Globe,
  Shield,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  dashboardService,
  DashboardStats,
  Alert,
  Activity,
  VisualizationData,
} from "@/services/dashboard";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [visualizationData, setVisualizationData] =
    useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, alertsData, activitiesData, vizData] =
          await Promise.all([
            dashboardService.getStats(),
            dashboardService.getAlerts(),
            dashboardService.getRecentActivity(),
            dashboardService.getVisualizationData(),
          ]);

        setStats(statsData);
        setAlerts(alertsData);
        setActivities(activitiesData);
        setVisualizationData(vizData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Subscribe to real-time updates
    const unsubscribe = dashboardService.subscribeToUpdates((data) => {
      if (data.type === "stats") setStats(data.payload);
      if (data.type === "alert") setAlerts((prev) => [data.payload, ...prev]);
      if (data.type === "activity")
        setActivities((prev) => [data.payload, ...prev]);
      if (data.type === "visualization") setVisualizationData(data.payload);
    });

    return () => unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
        </div>

        {/* Grid Layout */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Stats */}
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.network.title")}
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.network.traffic || 0).toFixed(1)} GB/s
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.network.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.memory.title")}
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  ((stats?.memory.usage || 0) / (stats?.memory.total || 1)) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.memory.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.files.title")}
              </CardTitle>
              <FileDigit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.filesystem.total_files || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.files.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.stats.threats.title")}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.threats.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.stats.threats.description")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Visualization Section */}
        <div className="grid gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>{t("dashboard.visualization.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <NetworkGraph data={visualizationData?.network} />
                <MemoryVisualizer data={visualizationData?.memory} />
                <FileSystemExplorer data={visualizationData?.filesystem} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>{t("dashboard.alerts.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertPanel alerts={alerts} />
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>{t("dashboard.activity.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityPanel activities={activities} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
