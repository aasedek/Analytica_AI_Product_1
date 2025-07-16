"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { PipelineNode } from "@/lib/types";
import { Icons } from "../icons";

interface ConfigSidebarProps {
  selectedNode: PipelineNode | null;
  onClose: () => void;
  onUpdateNodeConfig: (nodeId: string, newConfig: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function ConfigSidebar({
  selectedNode,
  onClose,
  onUpdateNodeConfig,
  onDeleteNode,
}: ConfigSidebarProps) {
  if (!selectedNode) {
    return null;
  }

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onUpdateNodeConfig(selectedNode.id, {
      ...selectedNode.config,
      [e.target.name]: e.target.value,
    });
  };

  const renderConfigFields = () => {
    switch (selectedNode.type) {
      case "Filter":
        return (
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="condition">Filter Condition</Label>
            <Textarea
              id="condition"
              name="condition"
              placeholder="e.g., age > 30 AND city = 'New York'"
              value={selectedNode.config.condition || ""}
              onChange={handleConfigChange}
            />
          </div>
        );
      case "Join":
        return (
           <div className="grid w-full items-center gap-2">
            <Label htmlFor="on">Join Key</Label>
            <Input
              id="on"
              name="on"
              placeholder="e.g., user_id"
              value={selectedNode.config.on || ""}
              onChange={handleConfigChange}
            />
          </div>
        );
      case "Calculator":
      case "Transform":
        return (
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="expression">Transformation</Label>
            <Textarea
              id="expression"
              name="expression"
              placeholder="e.g., SELECT id, name, age * 2 as double_age"
              value={selectedNode.config.expression || ""}
              onChange={handleConfigChange}
            />
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">No specific configuration for this component.</p>
    }
  }

  return (
    <aside className="w-80 shrink-0 border-l bg-card">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold tracking-tight">Configuration</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icons.x className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-4 space-y-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="nodeName">Component Name</Label>
            <Input
              id="nodeName"
              name="name"
              value={selectedNode.config.name}
              onChange={handleConfigChange}
            />
          </div>
          {renderConfigFields()}
        </div>
      </ScrollArea>
       <div className="absolute bottom-0 w-80 border-t bg-card p-4">
        <Button variant="destructive" className="w-full" onClick={() => onDeleteNode(selectedNode.id)}>
          <Icons.trash className="mr-2 h-4 w-4" />
          Delete Component
        </Button>
      </div>
    </aside>
  );
}
