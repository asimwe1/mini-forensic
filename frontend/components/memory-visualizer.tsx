"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/language-provider";

interface MemoryRegion {
  id: string;
  address: string;
  size: number;
  type: string;
  permissions: string;
  process: string;
}

interface Process {
  id: string;
  name: string;
  pid: number;
  memory_usage: number;
  regions: MemoryRegion[];
}

interface MemoryVisualizerProps {
  data?: {
    regions: MemoryRegion[];
    processes: Process[];
  };
}

export function MemoryVisualizer({ data }: MemoryVisualizerProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;

    // Draw memory regions
    const totalMemory = data.regions.reduce(
      (acc, region) => acc + region.size,
      0
    );
    let currentOffset = padding;

    data.regions.forEach((region) => {
      const regionWidth = (region.size / totalMemory) * (width - 2 * padding);

      // Draw region background
      ctx.fillStyle = getRegionColor(region.type);
      ctx.fillRect(currentOffset, padding, regionWidth, height - 2 * padding);

      // Draw region border
      ctx.strokeStyle = "#000";
      ctx.strokeRect(currentOffset, padding, regionWidth, height - 2 * padding);

      // Draw region label
      ctx.fillStyle = "#000";
      ctx.font = "12px monospace";
      ctx.save();
      ctx.translate(currentOffset + regionWidth / 2, height - padding);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${region.process} (${region.type})`, 0, 0);
      ctx.restore();

      currentOffset += regionWidth;
    });

    // Draw process list
    ctx.font = "12px monospace";
    ctx.fillStyle = "#000";
    data.processes.forEach((process, index) => {
      const y = padding + (index + 1) * 20;
      ctx.fillText(`${process.name} (PID: ${process.pid})`, width - 200, y);
    });
  }, [data]);

  if (!data) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">{t("dashboard.no_data")}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] bg-muted rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-full"
      />
    </div>
  );
}

function getRegionColor(type: string): string {
  switch (type.toLowerCase()) {
    case "code":
      return "#4CAF50";
    case "data":
      return "#2196F3";
    case "heap":
      return "#FFC107";
    case "stack":
      return "#F44336";
    case "mapped":
      return "#9C27B0";
    default:
      return "#9E9E9E";
  }
}
