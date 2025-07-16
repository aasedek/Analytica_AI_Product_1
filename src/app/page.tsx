
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/pipeline-pilot/header";
import { ComponentSidebar } from "@/components/pipeline-pilot/component-sidebar";
import { PipelineCanvas } from "@/components/pipeline-pilot/pipeline-canvas";
import { ConfigSidebar } from "@/components/pipeline-pilot/config-sidebar";
import type { PipelineNode, PipelineConnection } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataVis3D } from "@/components/pipeline-pilot/data-vis-3d";
import { useToast } from "@/hooks/use-toast";
import { ClientOnly } from "@/components/client-only";

export default function Home() {
  const [nodes, setNodes] = useState<PipelineNode[]>([]);
  const [connections, setConnections] = useState<PipelineConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleNodesChange = useCallback((newNodes: PipelineNode[]) => {
    setNodes(newNodes);
  }, []);

  const handleConnectionsChange = useCallback(
    (newConnections: PipelineConnection[]) => {
      setConnections(newConnections);
    },
    []
  );

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleUpdateNodeConfig = useCallback((nodeId: string, newConfig: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, config: newConfig } : node
      )
    );
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.sourceId !== nodeId && c.targetId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const handleExport = () => {
    const pipelineData = JSON.stringify({ nodes, connections }, null, 2);
    const blob = new Blob([pipelineData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pipeline.json";
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Export Successful", description: "Your pipeline has been downloaded." });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.nodes && data.connections) {
            setNodes(data.nodes);
            setConnections(data.connections);
            setSelectedNodeId(null);
            toast({ title: "Import Successful", description: "Pipeline loaded from file." });
          } else {
            throw new Error("Invalid file format");
          }
        } catch (error) {
           toast({ title: "Import Failed", description: "The selected file is not a valid pipeline configuration.", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow re-importing the same file
    if(event.target) event.target.value = "";
  };
  
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;

  return (
    <div className="flex h-screen w-full flex-col bg-background font-sans text-foreground">
      <ClientOnly>
        <Header onImport={handleImport} onExport={handleExport} pipeline={{ nodes, connections }} />
        <main className="flex flex-1 overflow-hidden">
          <Tabs defaultValue="pipeline" className="flex h-full w-full flex-col">
            <div className="flex shrink-0 justify-center border-b bg-card">
              <TabsList className="bg-transparent p-0">
                <TabsTrigger value="pipeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Pipeline Design</TabsTrigger>
                <TabsTrigger value="3d-vis" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">3D Visualization</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="pipeline" className="m-0 flex-1 overflow-hidden">
              <div className="flex h-full w-full">
                <ComponentSidebar />
                <PipelineCanvas
                  nodes={nodes}
                  connections={connections}
                  onNodesChange={handleNodesChange}
                  onConnectionsChange={handleConnectionsChange}
                  onNodeSelect={handleNodeSelect}
                  selectedNodeId={selectedNodeId}
                />
                {selectedNode && (
                  <ConfigSidebar
                    selectedNode={selectedNode}
                    onClose={() => setSelectedNodeId(null)}
                    onUpdateNodeConfig={handleUpdateNodeConfig}
                    onDeleteNode={handleDeleteNode}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="3d-vis" className="m-0 flex-1 overflow-hidden">
              <DataVis3D nodes={nodes} />
            </TabsContent>
          </Tabs>
        </main>
      </ClientOnly>
    </div>
  );
}
