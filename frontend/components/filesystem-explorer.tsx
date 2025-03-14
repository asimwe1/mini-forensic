"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

// Simple placeholder component that doesn't use complex hooks or state
function SimpleFileSystemExplorer() {
  return (
    <div className="w-full h-full bg-black/20 rounded-md">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh>
          <torusGeometry args={[1, 0.4, 16, 32]} />
          <meshStandardMaterial color="#FF00FF" />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export function FileSystemExplorer() {
  // Return a fallback UI instead of the 3D visualization
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center p-4">
        <h3 className="text-lg font-medium text-accent mb-2">File System Explorer</h3>
        <p className="text-sm text-muted-foreground">3D file system visualization would display here.</p>
      </div>
    </div>
  )
}

