"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

// Simple placeholder component that doesn't use complex hooks or state
function SimpleMemoryVisualizer() {
  return (
    <div className="w-full h-full bg-black/20 rounded-md">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00FF88" />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export function MemoryVisualizer() {
  // Return a fallback UI instead of the 3D visualization
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-4">
        <h3 className="text-lg font-medium text-secondary mb-2">Memory Analysis</h3>
        <p className="text-sm text-muted-foreground">3D memory block visualization would display here.</p>
      </div>
    </div>
  )
}

