"use client";

import { useLanguage } from "@/components/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Activity } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface NetworkNode {
  id: string;
  label: string;
  type: "host" | "service" | "client";
  status: "active" | "inactive" | "warning";
  connections: string[];
}

interface NetworkConnection {
  from: string;
  to: string;
  type: "http" | "https" | "tcp" | "udp";
  status: "active" | "inactive" | "warning";
}

export function NetworkGraph() {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: "host1",
      label: "Web Server",
      type: "host",
      status: "active",
      connections: ["client1", "client2"],
    },
    {
      id: "host2",
      label: "Database",
      type: "service",
      status: "active",
      connections: ["host1"],
    },
    {
      id: "client1",
      label: "Client 1",
      type: "client",
      status: "active",
      connections: ["host1"],
    },
    {
      id: "client2",
      label: "Client 2",
      type: "client",
      status: "warning",
      connections: ["host1"],
    },
  ]);

  const [connections, setConnections] = useState<NetworkConnection[]>([
    {
      from: "host1",
      to: "client1",
      type: "https",
      status: "active",
    },
    {
      from: "host1",
      to: "client2",
      type: "https",
      status: "warning",
    },
    {
      from: "host1",
      to: "host2",
      type: "tcp",
      status: "active",
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  const getNodeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "inactive":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "inactive":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Network Visualization
        </CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("graph")}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === "graph"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded-md text-sm ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            List View
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "graph" ? (
          <div className="relative h-[400px] bg-muted/50 rounded-lg p-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8">
                {nodes.map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`relative p-4 rounded-lg border ${
                      selectedNode?.id === node.id
                        ? "border-primary"
                        : "border-muted"
                    }`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <div
                      className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getNodeColor(
                        node.status
                      )}`}
                    />
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">{node.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {node.type}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Nodes</h3>
              <div className="grid gap-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getNodeColor(
                          node.status
                        )}`}
                      />
                      <span className="font-medium">{node.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {node.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Connections</h3>
              <div className="grid gap-2">
                {connections.map((conn, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${getConnectionColor(
                          conn.status
                        )}`}
                      />
                      <span className="font-medium">
                        {nodes.find((n) => n.id === conn.from)?.label} →{" "}
                        {nodes.find((n) => n.id === conn.to)?.label}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {conn.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
