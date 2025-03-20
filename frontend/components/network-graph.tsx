"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useLanguage } from "@/components/language-provider";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface NetworkNode {
  id: string;
  name: string;
  type: string;
  group: number;
  size: number;
}

interface NetworkEdge {
  source: string;
  target: string;
  value: number;
  type: string;
}

interface NetworkGraphProps {
  data?: {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  };
}

export function NetworkGraph({ data }: NetworkGraphProps) {
  const { t } = useLanguage();
  const graphRef = useRef<any>(null);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force("charge").strength(-100);
      graphRef.current.d3Force("link").distance(100);
      graphRef.current.d3Force("center").strength(0.5);
    }
  }, []);

  if (!data) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">{t("dashboard.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] bg-muted rounded-lg overflow-hidden">
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel="name"
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkWidth={1}
        linkColor={() => "#666"}
        nodeColor={(node: NetworkNode) => {
          switch (node.type) {
            case "host":
              return "#4CAF50";
            case "service":
              return "#2196F3";
            case "client":
              return "#FFC107";
            default:
              return "#9E9E9E";
          }
        }}
        onNodeClick={(node: NetworkNode) => {
          // Handle node click
          console.log("Clicked node:", node);
        }}
        onLinkClick={(link: NetworkEdge) => {
          // Handle link click
          console.log("Clicked link:", link);
        }}
      />
    </div>
  );
}
