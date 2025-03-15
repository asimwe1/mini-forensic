"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Network,
  Search,
  Filter,
  Download,
  Info,
  Activity,
  Globe,
  Wifi,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { LabSidebar } from "@/components/lab-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface NetworkConnection {
  id: string;
  source: string;
  destination: string;
  protocol: string;
  port: number;
  status: "active" | "closed";
  timestamp: string;
  bytes: number;
}

export default function Pages() {
  const { t } = useLanguage();
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] =
    useState<NetworkConnection | null>(null);
  const [filterProtocol, setFilterProtocol] = useState<string>("all");

  // Mock data for demonstration
  const mockConnections: NetworkConnection[] = [
    {
      id: "1",
      source: "192.168.1.100",
      destination: "8.8.8.8",
      protocol: "TCP",
      port: 443,
      status: "active",
      timestamp: "2024-01-20 10:15:23",
      bytes: 1024,
    },
    {
      id: "2",
      source: "192.168.1.100",
      destination: "172.217.3.110",
      protocol: "UDP",
      port: 53,
      status: "closed",
      timestamp: "2024-01-20 10:15:20",
      bytes: 512,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <LabSidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {t("network.title")}
                </h1>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    {t("network.activeConnections")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      mockConnections.filter((c) => c.status === "active")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("network.totalTraffic")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(
                      mockConnections.reduce(
                        (acc, curr) => acc + curr.bytes,
                        0
                      ) / 1024
                    ).toFixed(2)}{" "}
                    KB
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    {t("network.protocols")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(mockConnections.map((c) => c.protocol)).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t("network.connections")}
                </CardTitle>
                <CardDescription>
                  {t("network.connectionsDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-sm">
                      <Input
                        placeholder={t("network.search")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="h-[400px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-medium">
                            {t("network.source")}
                          </TableHead>
                          <TableHead className="font-medium">
                            {t("network.destination")}
                          </TableHead>
                          <TableHead className="font-medium">
                            {t("network.protocol")}
                          </TableHead>
                          <TableHead className="font-medium">
                            {t("network.port")}
                          </TableHead>
                          <TableHead className="font-medium">
                            {t("network.status")}
                          </TableHead>
                          <TableHead className="font-medium">
                            {t("network.timestamp")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockConnections.map((connection) => (
                          <TableRow key={connection.id}>
                            <TableCell>{connection.source}</TableCell>
                            <TableCell>{connection.destination}</TableCell>
                            <TableCell>{connection.protocol}</TableCell>
                            <TableCell>{connection.port}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  connection.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {connection.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{connection.timestamp}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
