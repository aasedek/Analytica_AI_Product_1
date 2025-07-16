
"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { type PipelineNode } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPONENT_DEFINITIONS } from "./component-sidebar";

interface DataVis3DProps {
  nodes: PipelineNode[];
}

export function DataVis3D({ nodes }: DataVis3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const sourceNodes = nodes.filter(node => {
    const def = COMPONENT_DEFINITIONS.find(d => d.name === node.type);
    return def?.category === 'Source';
  });

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5);

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x2979ff });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="h-full w-full p-4 flex flex-col">
       <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium">Select Data Source:</label>
        <Select onValueChange={setSelectedNodeId} value={selectedNodeId || ""}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a source node..." />
          </SelectTrigger>
          <SelectContent>
            {sourceNodes.length > 0 ? (
              sourceNodes.map((node) => (
                <SelectItem key={node.id} value={node.id}>
                  {node.config.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-source" disabled>
                No source nodes in pipeline
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 relative">
        <div
          ref={mountRef}
          className="absolute inset-0 rounded-lg border bg-white shadow-inner"
          data-ai-hint="3d render"
        ></div>
        {selectedNode && (
            <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-md">
                Visualizing: {selectedNode.config.name}
            </div>
        )}
      </div>
    </div>
  );
}
