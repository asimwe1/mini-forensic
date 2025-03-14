"use client";

import { FileSystemExplorer } from "@/components/filesystem-explorer";
import { NetworkGraph } from "@/components/network-graph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Analysis
        </h1>
        <p className="text-muted-foreground">
          Monitor and analyze system resources and network activity
        </p>
      </div>

      <Tabs defaultValue="filesystem" className="space-y-4">
        <TabsList>
          <TabsTrigger value="filesystem">File System</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="filesystem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File System Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <FileSystemExplorer />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkGraph />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
