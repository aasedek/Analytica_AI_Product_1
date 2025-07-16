"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { PipelineNode as PipelineNodeData } from "@/lib/types";
import { COMPONENT_DEFINITIONS } from "./component-sidebar";

interface PipelineNodeProps {
  data: PipelineNodeData;
  onNodeDragStart: (event: React.DragEvent, nodeId: string) => void;
  onHandleDragStart: (event: React.DragEvent, nodeId: string, handleId: string, handleType: "input" | "output") => void;
  onHandleDrop: (event: React.DragEvent, nodeId: string, handleId: string, handleType: "input" | "output") => void;
  isSelected: boolean;
  onClick: (nodeId: string) => void;
}

const Handle = ({ id, type, onDragStart, onDrop, style }: { id: string, type: 'input' | 'output', onDragStart: (e: React.DragEvent) => void, onDrop: (e: React.DragEvent) => void, style: React.CSSProperties }) => (
  <div
    draggable
    onDragStart={onDragStart}
    onDrop={onDrop}
    onDragOver={(e) => e.preventDefault()} // Allow drop
    data-handleid={id}
    data-handletype={type}
    className={cn(
      "absolute h-3 w-3 rounded-full border-2 bg-background hover:bg-primary/20 hover:border-primary transition-colors z-10 cursor-crosshair",
      type === "input" ? "-left-[7px]" : "-right-[7px]",
      "transform -translate-y-1/2" // center vertically
    )}
    style={style}
  />
);

export const PipelineNode: React.FC<PipelineNodeProps> = ({
  data,
  onNodeDragStart,
  onHandleDragStart,
  onHandleDrop,
  isSelected,
  onClick,
}) => {
  const componentDef = COMPONENT_DEFINITIONS.find((def) => def.name === data.type);
  if (!componentDef) return null;

  const Icon = Icons[componentDef.icon];

  const getHandleStyle = (count: number, index: number): React.CSSProperties => {
    if (count === 1) return { top: `50%` };
    const percentage = (index + 1) * (100 / (count + 1));
    return { top: `${percentage}%` };
  }

  return (
    <div
      draggable
      onDragStart={(e) => onNodeDragStart(e, data.id)}
      style={{ left: data.position.x, top: data.position.y }}
      className="group absolute cursor-grab active:cursor-grabbing"
      onClick={() => onClick(data.id)}
    >
      <Card
        className={cn(
          "w-56 shadow-md transition-all duration-150",
          isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
        )}
      >
        <CardHeader className="flex flex-row items-center space-x-4 p-3 h-14">
          <Icon className="h-6 w-6 shrink-0" />
          <CardTitle className="text-base truncate" title={data.config.name}>
            {data.config.name}
          </CardTitle>
          <Icons.grip className="ml-auto h-5 w-5 text-muted-foreground cursor-grab" />
        </CardHeader>
      </Card>
      
      {componentDef.inputs.map((input, index) => (
        <Handle
          key={input.id}
          id={input.id}
          type="input"
          onDragStart={(e) => { e.stopPropagation(); onHandleDragStart(e, data.id, input.id, 'input'); }}
          onDrop={(e) => onHandleDrop(e, data.id, input.id, 'input')}
          style={getHandleStyle(componentDef.inputs.length, index)}
        />
      ))}
      
      {componentDef.outputs.map((output, index) => (
         <Handle
          key={output.id}
          id={output.id}
          type="output"
          onDragStart={(e) => { e.stopPropagation(); onHandleDragStart(e, data.id, output.id, 'output'); }}
          onDrop={(e) => onHandleDrop(e, data.id, output.id, 'output')}
          style={getHandleStyle(componentDef.outputs.length, index)}
        />
      ))}
    </div>
  );
};
