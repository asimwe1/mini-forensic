"use client";

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
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function DashboardPage() {
  const { t } = useLanguage();

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
              <div className="text-2xl font-bold">2.4 GB/s</div>
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
              <div className="text-2xl font-bold">64%</div>
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
              <div className="text-2xl font-bold">1,234</div>
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
              <div className="text-2xl font-bold">3</div>
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
                <NetworkGraph />
                <MemoryVisualizer />
                <FileSystemExplorer />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>{t("dashboard.alerts.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertPanel />
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle>{t("dashboard.activity.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
