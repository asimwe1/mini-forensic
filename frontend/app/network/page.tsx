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
  const [selectedConnection, setSelectedConnection] = useState<NetworkConnection | null>(null);
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
      bytes: 1024
    },
    {
      id: "2", 
      source: "192.168.1.100",
      destination: "172.217.3.110",
      protocol: "UDP",
      port: 53,
      status: "closed",
      timestamp: "2024-01-20 10:15:20",
      bytes: 512
    }
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("network.title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t("network.activeConnections")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockConnections.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("network.totalTraffic")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockConnections.reduce((acc, curr) => acc + curr.bytes, 0) / 1024).toFixed(2)} KB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              {t("network.protocols")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(mockConnections.map(c => c.protocol)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("network.connections")}</CardTitle>
          <CardDescription>
            {t("network.connectionsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("network.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("network.source")}</TableHead>
                    <TableHead>{t("network.destination")}</TableHead>
                    <TableHead>{t("network.protocol")}</TableHead>
                    <TableHead>{t("network.port")}</TableHead>
                    <TableHead>{t("network.status")}</TableHead>
                    <TableHead>{t("network.timestamp")}</TableHead>
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
                        <Badge variant={connection.status === "active" ? "default" : "secondary"}>
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
  );
}
