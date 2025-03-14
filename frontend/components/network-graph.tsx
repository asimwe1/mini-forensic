"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

// Simple placeholder component that doesn't use complex hooks or state
function SimpleNetworkGraph() {
  return (
    <div className="w-full h-full bg-black/20 rounded-md">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#00FFFF" />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export function NetworkGraph() {
  // Return a fallback UI instead of the 3D visualization
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-4">
        <h3 className="text-lg font-medium text-primary mb-2">
          Network Visualization
        </h3>
        <p className="text-sm text-muted-foreground">
          Interactive 3D network graph would display here.
        </p>
      </div>
    </div>
  );
}
