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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Search,
  Filter,
  Download,
  Info,
  Hexagon,
  Binary,
  BarChart3,
} from "lucide-react";
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

export default function Pages() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"hex" | "binary" | "ascii">("hex");
  const [searchQuery, setSearchQuery] = useState("");

  const memoryRegions: MemoryRegion[] = [
    {
      address: "0x00400000",
      size: 1024 * 1024,
      type: "Code",
      permissions: "r-x",
      description: "Main executable code",
      content: "48 89 5C 24 08 48...",
    },
    {
      address: "0x00600000",
      size: 2 * 1024 * 1024,
      type: "Data",
      permissions: "rw-",
      description: "Global variables",
      content: "00 00 00...",
    },
    {
      address: "0x00800000",
      size: 4 * 1024 * 1024,
      type: "Heap",
      permissions: "rw-",
      description: "Dynamic memory allocation",
      content: "FF FF FF...",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <LabSidebar />
        <div className="w-64 border-r p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search memory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total Memory: 16 GB
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
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
                </TabsList>
                <TabsContent value="regions">
                  <div className="flex items-center justify-between">
                    <Select
                      value={viewMode}
                      onValueChange={(value) => setViewMode(value as "hex" | "binary" | "ascii")}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="View Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">
                          <Hexagon className="h-4 w-4" /> Hex View
                        </SelectItem>
                        <SelectItem value="binary">
                          <Binary className="h-4 w-4" /> Binary View
                        </SelectItem>
                        <SelectItem value="ascii">
                          <BarChart3 className="h-4 w-4" /> ASCII View
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="h-[600px]">
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
                        {memoryRegions.map((region) => (
                          <TableRow
                            key={region.address}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="font-mono">
                              {region.address}
                            </TableCell>
                            <TableCell>
                              {(region.size / 1024).toFixed(1)} KB
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{region.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {region.permissions}
                              </Badge>
                            </TableCell>
                            <TableCell>{region.description}</TableCell>
                            <TableCell className="font-mono break-all">
                              {region.content || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
