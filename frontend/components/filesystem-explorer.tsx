"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  AlertCircle,
} from "lucide-react";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "directory";
  size?: number;
  modified?: string;
  permissions?: string;
  children?: FileNode[];
  suspicious?: boolean;
}

interface FileSystemExplorerProps {
  data?: {
    root: FileNode;
  };
}

export function FileSystemExplorer({ data }: FileSystemExplorerProps) {
  const { t } = useLanguage();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

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

  const formatSize = (size?: number): string => {
    if (!size) return "-";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = size;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isDirectory = node.type === "directory";

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1 px-2 rounded-md hover:bg-muted cursor-pointer ${
            selectedNode?.id === node.id ? "bg-muted" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {isDirectory && (
            <button
              className="p-1 hover:bg-muted/50 rounded"
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
          {isDirectory ? (
            <Folder className="h-4 w-4 text-yellow-500" />
          ) : (
            <File className="h-4 w-4 text-blue-500" />
          )}
          <span className="flex-1 truncate">{node.name}</span>
          {node.suspicious && <AlertCircle className="h-4 w-4 text-red-500" />}
          {!isDirectory && (
            <span className="text-sm text-muted-foreground">
              {formatSize(node.size)}
            </span>
          )}
        </div>
        {isDirectory && isExpanded && hasChildren && (
          <div className="space-y-1">
            {node.children?.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!data) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">{t("dashboard.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] bg-muted rounded-lg overflow-hidden flex">
      <div className="flex-1 overflow-y-auto p-2">{renderNode(data.root)}</div>
      {selectedNode && (
        <div className="w-64 border-l p-4 overflow-y-auto">
          <h3 className="font-medium mb-2">File Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2">{selectedNode.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 capitalize">{selectedNode.type}</span>
            </div>
            {selectedNode.type === "file" && (
              <>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2">{formatSize(selectedNode.size)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Modified:</span>
                  <span className="ml-2">{selectedNode.modified}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Permissions:</span>
                  <span className="ml-2">{selectedNode.permissions}</span>
                </div>
              </>
            )}
            {selectedNode.suspicious && (
              <div className="text-red-500">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Suspicious file detected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
