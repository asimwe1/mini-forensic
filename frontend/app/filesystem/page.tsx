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
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  Download,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { LabSidebar } from "@/components/lab-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardLayout } from "@/components/dashboard-layout";

interface FileSystemNode {
  id: string;
  name: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
  path: string;
  children?: FileSystemNode[];
  metadata?: {
    mimeType?: string;
    hash?: string;
    permissions?: string;
    owner?: string;
    group?: string;
  };
}

export default function FileSystemExplorer() {
  const { t } = useLanguage();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<FileSystemNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  const fileSystem: FileSystemNode = {
    id: "root",
    name: "root",
    type: "directory",
    path: "/",
    children: [
      {
        id: "documents",
        name: "Documents",
        type: "directory",
        path: "/Documents",
        children: [
          {
            id: "report",
            name: "report.pdf",
            type: "file",
            size: 1024 * 1024 * 2.5,
            modified: "2024-03-20 14:30",
            path: "/Documents/report.pdf",
            metadata: {
              mimeType: "application/pdf",
              permissions: "rw-r--r--",
              owner: "user",
              group: "users",
            },
          },
          {
            id: "data",
            name: "data.xlsx",
            type: "file",
            size: 1024 * 512,
            modified: "2024-03-19 09:15",
            path: "/Documents/data.xlsx",
            metadata: {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              permissions: "rw-rw-r--",
              owner: "user",
              group: "users",
            },
          },
        ],
      },
      {
        id: "images",
        name: "Images",
        type: "directory",
        path: "/Images",
        children: [
          {
            id: "screenshot",
            name: "screenshot.png",
            type: "file",
            size: 1024 * 1024 * 1.2,
            modified: "2024-03-18 16:45",
            path: "/Images/screenshot.png",
            metadata: {
              mimeType: "image/png",
              permissions: "rw-r--r--",
              owner: "user",
              group: "users",
            },
          },
        ],
      },
    ],
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getFileIcon = (node: FileSystemNode) => {
    if (node.type === "directory")
      return <Folder className="h-4 w-4 text-yellow-500" />;

    const extension = node.name.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "png":
      case "jpg":
      case "jpeg":
        return <FileImage className="h-4 w-4 text-blue-500" />;
      case "mp4":
      case "avi":
        return <FileVideo className="h-4 w-4 text-purple-500" />;
      case "mp3":
      case "wav":
        return <FileAudio className="h-4 w-4 text-green-500" />;
      case "zip":
      case "rar":
        return <FileArchive className="h-4 w-4 text-orange-500" />;
      case "json":
      case "js":
      case "ts":
      case "py":
        return <FileCode className="h-4 w-4 text-indigo-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const renderTreeNode = (node: FileSystemNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent ${
            isSelected ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {getFileIcon(node)}
          <span className="ml-2">{node.name}</span>
        </div>
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children?.map((child) => renderTreeNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderListView = () => {
    const flattenNodes = (node: FileSystemNode): FileSystemNode[] => {
      const nodes = [node];
      if (node.children) {
        node.children.forEach((child) => nodes.push(...flattenNodes(child)));
      }
      return nodes;
    };

    const allNodes = flattenNodes(fileSystem);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allNodes.map((node) => (
            <TableRow
              key={node.id}
              className={selectedNode?.id === node.id ? "bg-accent" : ""}
              onClick={() => setSelectedNode(node)}
            >
              <TableCell className="flex items-center">
                {getFileIcon(node)}
                <span className="ml-2">{node.name}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={node.type === "directory" ? "secondary" : "outline"}
                >
                  {node.type}
                </Badge>
              </TableCell>
              <TableCell>{formatFileSize(node.size)}</TableCell>
              <TableCell>{node.modified || "N/A"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row h-full gap-4">
        {/* File System Tree */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-xl md:text-2xl">
              File System
            </CardTitle>
            <CardDescription>Browse and analyze files</CardDescription>
            <div className="flex items-center gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                title="Filter"
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-200px)]">
              {viewMode === "tree"
                ? renderTreeNode(fileSystem)
                : renderListView()}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* File Details */}
        <div className="flex-1 min-w-0">
          {selectedNode ? (
            <Card className="h-full">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  {getFileIcon(selectedNode)}
                  {selectedNode.name}
                </CardTitle>
                <CardDescription className="break-all">
                  {selectedNode.path}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">
                      File Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">
                          {selectedNode.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Size:</span>
                        <span className="font-medium">
                          {formatFileSize(selectedNode.size)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Modified:
                        </span>
                        <span className="font-medium">
                          {selectedNode.modified || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedNode.metadata && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Metadata</h3>
                      <div className="space-y-3">
                        {selectedNode.metadata.mimeType && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              MIME Type:
                            </span>
                            <span className="font-medium">
                              {selectedNode.metadata.mimeType}
                            </span>
                          </div>
                        )}
                        {selectedNode.metadata.permissions && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Permissions:
                            </span>
                            <span className="font-medium">
                              {selectedNode.metadata.permissions}
                            </span>
                          </div>
                        )}
                        {selectedNode.metadata.owner && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Owner:
                            </span>
                            <span className="font-medium">
                              {selectedNode.metadata.owner}
                            </span>
                          </div>
                        )}
                        {selectedNode.metadata.group && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              Group:
                            </span>
                            <span className="font-medium">
                              {selectedNode.metadata.group}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
              Select a file or directory to view details
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}