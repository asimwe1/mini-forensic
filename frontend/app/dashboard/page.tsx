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

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <LabSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("dashboard")}
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your forensic analysis.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Network Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  Active connections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Database className="w-4 h-4 inline mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 GB</div>
                <p className="text-xs text-muted-foreground">
                  Current memory footprint
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <FileDigit className="w-4 h-4 inline mr-2" />
                  Files Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,567</div>
                <p className="text-xs text-muted-foreground">
                  Total files processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Threat Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">High</div>
                <p className="text-xs text-muted-foreground">
                  3 critical threats detected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <ActivitySquare className="w-4 h-4 inline mr-2" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Active</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Visualization Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Graph */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Network Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <NetworkGraph />
                </div>
              </CardContent>
            </Card>

            {/* Memory Visualizer */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Memory Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <MemoryVisualizer />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File System Explorer */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>File System Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <FileSystemExplorer />
              </div>
            </CardContent>
          </Card>

          {/* Alerts and Activity */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AlertPanel />
            <RecentActivityPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
