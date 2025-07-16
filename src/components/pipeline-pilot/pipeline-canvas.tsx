"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

if (!crypto.randomUUID) {
  crypto.randomUUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}
import type { PipelineNode as NodeData, PipelineConnection } from "@/lib/types";
import { PipelineNode } from "./pipeline-node";
import { COMPONENT_DEFINITIONS } from "./component-sidebar";

interface PipelineCanvasProps {
  nodes: NodeData[];
  connections: PipelineConnection[];
  onNodesChange: (nodes: NodeData[]) => void;
  onConnectionsChange: (connections: PipelineConnection[]) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onNodeSelect,
  selectedNodeId
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectionCandidate, setConnectionCandidate] = useState<{ nodeId: string; handleId: string; handleType: 'input' | 'output'; x: number; y: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  
  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (connectionCandidate) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if(rect) {
        setCursorPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
      }
    }
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    // This is a drop for a connection
    if (connectionCandidate) {
        setConnectionCandidate(null);
        setCursorPosition(null);
        return;
    }

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const type = event.dataTransfer.getData("application/reactflow");

    // Dropping a new node from the sidebar
    if (type) {
      const position = {
        x: event.clientX - canvasBounds.left,
        y: event.clientY - canvasBounds.top,
      };
      const componentDef = COMPONENT_DEFINITIONS.find(def => def.name === type);
      if (!componentDef) return;

      const newNode: NodeData = {
        id: `node-${crypto.randomUUID()}`,
        type: componentDef.name, // Use name as type now
        position,
        config: { ...componentDef.defaultConfig, name: `${componentDef.name} ${nodes.length + 1}`},
      };
      onNodesChange([...nodes, newNode]);
    } else {
      // Moving an existing node
      const nodeId = event.dataTransfer.getData("nodeId");
      if (nodeId) {
        const updatedNodes = nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              position: {
                x: event.clientX - canvasBounds.left - dragOffset.x,
                y: event.clientY - canvasBounds.top - dragOffset.y,
              },
            };
          }
          return node;
        });
        onNodesChange(updatedNodes);
      }
    }
  };

  const onNodeDragStart = (event: React.DragEvent, nodeId: string) => {
    event.dataTransfer.setData("nodeId", nodeId);
    const nodeElement = event.currentTarget as HTMLDivElement;
    const rect = nodeElement.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
    }
  };

  const onHandleDragStart = (event: React.DragEvent, nodeId: string, handleId: string, handleType: 'input' | 'output') => {
    event.stopPropagation();
    if (!canvasRef.current) return;
    const pos = getHandlePosition(nodeId, handleId, handleType, nodes);
    
    setConnectionCandidate({ nodeId, handleId, handleType, x: pos.x, y: pos.y });

    const rect = canvasRef.current.getBoundingClientRect();
    setCursorPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const onHandleDrop = (event: React.DragEvent, targetNodeId: string, targetHandleId: string, targetHandleType: 'input' | 'output') => {
    event.stopPropagation();
    if (!connectionCandidate) return;

    // From output to input
    if(connectionCandidate.handleType === 'output' && targetHandleType === 'input') {
        // Prevent connecting to self
        if (connectionCandidate.nodeId === targetNodeId) return;

        // Check if target handle is already connected
        const isAlreadyConnected = connections.some(c => c.targetId === targetNodeId && c.targetHandle === targetHandleId);
        if (isAlreadyConnected) return;

        const newConnection: PipelineConnection = {
            id: `conn-${crypto.randomUUID()}`,
            sourceId: connectionCandidate.nodeId,
            sourceHandle: connectionCandidate.handleId,
            targetId: targetNodeId,
            targetHandle: targetHandleId,
        };
        onConnectionsChange([...connections, newConnection]);
    }

    setConnectionCandidate(null);
    setCursorPosition(null);
  };
  
  const getHandlePosition = (nodeId: string, handleId: string, handleType: 'input' | 'output', currentNodes: NodeData[]) => {
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const componentDef = COMPONENT_DEFINITIONS.find(def => def.name === node.type);
    if (!componentDef) return { x: 0, y: 0 };

    const handles = handleType === 'input' ? componentDef.inputs : componentDef.outputs;
    const handleIndex = handles.findIndex(h => h.id === handleId);
    
    if(handleIndex === -1) return { x: node.position.x, y: node.position.y };

    const getHandleY = (count: number, index: number) => {
        const cardHeight = 56;
        if (count === 1) return cardHeight / 2;
        return (cardHeight / (count + 1)) * (index + 1);
    }

    const yOffset = getHandleY(handles.length, handleIndex);

    return {
        x: node.position.x + (handleType === 'input' ? 0 : 224), // 224 is w-56
        y: node.position.y + yOffset,
    };
  }
  
  // This effect forces a re-render of connections when nodes are dragged
  // It's a bit of a hack, but ensures the lines follow the nodes.
  const [renderCount, setRenderCount] = useState(0);
  useEffect(() => {
    setRenderCount(c => c + 1);
  }, [nodes]);


  return (
    <div
      ref={canvasRef}
      className="relative flex-1 bg-background overflow-hidden"
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={onDragOver} // Use onDragOver for mouse move during drag
      onClick={(e) => {
        if (e.target === canvasRef.current) {
          onNodeSelect(null);
          if (connectionCandidate) {
            setConnectionCandidate(null);
            setCursorPosition(null);
          }
        }
      }}
      onMouseUp={() => {
        if(connectionCandidate) {
            setConnectionCandidate(null);
            setCursorPosition(null);
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="relative h-full w-full">
        {nodes.map((node) => (
          <PipelineNode
            key={node.id}
            data={node}
            onNodeDragStart={onNodeDragStart}
            onHandleDragStart={onHandleDragStart}
            onHandleDrop={onHandleDrop}
            isSelected={selectedNodeId === node.id}
            onClick={() => onNodeSelect(node.id)}
          />
        ))}

        <svg className="absolute top-0 left-0 h-full w-full pointer-events-none">
          {connections.map(conn => {
            const sourcePos = getHandlePosition(conn.sourceId, conn.sourceHandle, 'output', nodes);
            const targetPos = getHandlePosition(conn.targetId, conn.targetHandle, 'input', nodes);
            const path = `M${sourcePos.x},${sourcePos.y} C${sourcePos.x + 50},${sourcePos.y} ${targetPos.x - 50},${targetPos.y} ${targetPos.x},${targetPos.y}`;

            return <path key={`${conn.id}-${renderCount}`} d={path} stroke="#9ca3af" strokeWidth="2" fill="none" />;
          })}
          {connectionCandidate && cursorPosition && (
              <path d={`M${connectionCandidate.x},${connectionCandidate.y} L${cursorPosition.x},${cursorPosition.y}`} stroke="#2979FF" strokeWidth="2" fill="none" strokeDasharray="5,5" />
          )}
        </svg>
      </div>
    </div>
  );
};
