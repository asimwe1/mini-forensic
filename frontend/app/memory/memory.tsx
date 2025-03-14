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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cpu,
  Search,
  Filter,
  Download,
  Info,
  Hexagon,
  Binary,
  BarChart3,
  Network,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabSidebar } from "@/components/lab-sidebar";

interface MemoryRegion {
  address: string;
  size: number;
  type: string;
  permissions: string;
  description: string;
  content?: string;
}

interface ProcessInfo {
  pid: number;
  name: string;
  memoryUsage: number;
  threads: number;
  status: string;
}

export default function MemoryVisualizer() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"hex" | "binary" | "ascii">("hex");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<MemoryRegion | null>(
    null
  );
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(
    null
  );

  // Mock data for demonstration
  const memoryRegions: MemoryRegion[] = [
    {
      address: "0x00400000",
      size: 1024 * 1024,
      type: "Code",
      permissions: "r-x",
      description: "Main executable code",
      content: "48 89 5C 24 08 48 89 74 24 10 57 48 83 EC 20",
    },
    {
      address: "0x00600000",
      size: 2 * 1024 * 1024,
      type: "Data",
      permissions: "rw-",
      description: "Global variables",
      content: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00",
    },
    {
      address: "0x00800000",
      size: 4 * 1024 * 1024,
      type: "Heap",
      permissions: "rw-",
      description: "Dynamic memory allocation",
      content: "FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF",
    },
  ];

  const processes: ProcessInfo[] = [
    {
      pid: 1234,
      name: "explorer.exe",
      memoryUsage: 1024 * 1024 * 256,
      threads: 12,
      status: "Running",
    },
    {
      pid: 5678,
      name: "chrome.exe",
      memoryUsage: 1024 * 1024 * 512,
      threads: 24,
      status: "Running",
    },
  ];

  const formatAddress = (address: string) => {
    return address.padStart(10, "0");
  };

  const formatSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderMemoryContent = (content: string) => {
    if (!content) return "-";

    switch (viewMode) {
      case "hex":
        return content;
      case "binary":
        return content
          .split(" ")
          .map((byte) => parseInt(byte, 16).toString(2).padStart(8, "0"))
          .join(" ");
      case "ascii":
        return content
          .split(" ")
          .map((byte) => String.fromCharCode(parseInt(byte, 16)))
          .join("");
      default:
        return content;
    }
  };

  return (
    <div className="flex h-screen">
      <LabSidebar />
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filter by type..." className="h-8" />
              </div>
              <div className="text-sm text-muted-foreground">
                Total Memory: 16 GB
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Analysis</CardTitle>
                  <CardDescription>
                    Analyze memory dumps and visualize memory regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="regions" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="regions">Memory Regions</TabsTrigger>
                      <TabsTrigger value="processes">Processes</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="regions" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Select
                            value={viewMode}
                            onValueChange={(value: any) => setViewMode(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="View Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hex">
                                <div className="flex items-center gap-2">
                                  <Hexagon className="h-4 w-4" />
                                  Hex View
                                </div>
                              </SelectItem>
                              <SelectItem value="binary">
                                <div className="flex items-center gap-2">
                                  <Binary className="h-4 w-4" />
                                  Binary View
                                </div>
                              </SelectItem>
                              <SelectItem value="ascii">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  ASCII View
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Address</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Content</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <ScrollArea className="h-[600px]">
                            {memoryRegions.map((region) => (
                              <TableRow
                                key={region.address}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => setSelectedRegion(region)}
                              >
                                <TableCell className="font-mono">
                                  {formatAddress(region.address)}
                                </TableCell>
                                <TableCell>{formatSize(region.size)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{region.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {region.permissions}
                                  </Badge>
                                </TableCell>
                                <TableCell>{region.description}</TableCell>
                                <TableCell className="font-mono">
                                  {renderMemoryContent(region.content || "")}
                                </TableCell>
                              </TableRow>
                            ))}
                          </ScrollArea>
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="processes">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Memory Usage</TableHead>
                            <TableHead>Threads</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processes.map((process) => (
                            <TableRow
                              key={process.pid}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => setSelectedProcess(process)}
                            >
                              <TableCell>{process.pid}</TableCell>
                              <TableCell>{process.name}</TableCell>
                              <TableCell>
                                {formatSize(process.memoryUsage)}
                              </TableCell>
                              <TableCell>{process.threads}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {process.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon">
                                    <Cpu className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Network className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="analysis">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Memory Statistics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span>Total Memory</span>
                                <span>16 GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Used Memory</span>
                                <span>8.5 GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Free Memory</span>
                                <span>7.5 GB</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Process Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex justify-between">
                                <span>Total Processes</span>
                                <span>45</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Running Processes</span>
                                <span>32</span>
                              </div>
                              <div className="flex justify-between">
                                <span>System Processes</span>
                                <span>13</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
