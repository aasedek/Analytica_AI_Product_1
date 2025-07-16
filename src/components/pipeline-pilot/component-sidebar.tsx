
"use client";

import React, { useState } from "react";
import { Icons } from "@/components/icons";
import type { ComponentDefinition } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: "Source",
    name: "Database",
    description: "Connect to database sources",
    icon: "source",
    category: "Source",
    inputs: [],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Data Source" },
  },
  {
    type: "Source",
    name: "File Upload",
    description: "Upload CSV, JSON, or Excel files",
    icon: "upload",
    category: "Source",
    inputs: [],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New File Upload" },
  },
  {
    type: "Source",
    name: "API Source",
    description: "Fetch data from REST APIs",
    icon: "download",
    category: "Source",
    inputs: [],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New API Source" },
  },
  {
    type: "Filter",
    name: "Filter",
    description: "Filter rows based on conditions",
    icon: "filter",
    category: "Transform",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Filter", condition: "" },
  },
  {
    type: "Transform",
    name: "Calculator",
    description: "Perform calculations and transformations",
    icon: "calculator",
    category: "Transform",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Calculation", expression: "" },
  },
  {
    type: "Join",
    name: "Join",
    description: "Join multiple data sources",
    icon: "join",
    category: "Transform",
    inputs: [
      { id: "in1", label: "Input 1" },
      { id: "in2", label: "Input 2" },
    ],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Join", joinType: "INNER", on: "" },
  },
  {
    type: "Aggregate",
    name: "Aggregate",
    description: "Group and summarize data",
    icon: "aggregate",
    category: "Transform",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Aggregation", operation: "SUM", groupBy: "" },
  },
  {
    type: "Transform",
    name: "Distinct",
    description: "Remove duplicate rows",
    icon: "distinct",
    category: "Transform",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Distinct" },
  },
  {
    type: "Transform",
    name: "AI Classify",
    description: "Classify data using AI",
    icon: "sparkles",
    category: "AI",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New AI Classification" },
  },
  {
    type: "Transform",
    name: "AI Extract",
    description: "Extract insights from text",
    icon: "fileText",
    category: "AI",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New AI Extraction" },
  },
  {
    type: "Transform",
    name: "AI Data Deep Insights",
    description: "Uncover hidden patterns in data",
    icon: "lightbulb",
    category: "AI",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Deep Insights" },
  },
  {
    type: "Transform",
    name: "Advanced Analytics Agents",
    description: "Deploy autonomous analytics agents",
    icon: "bot",
    category: "AI",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Output" }],
    defaultConfig: { name: "New Analytics Agent" },
  },
  {
    type: "Transform",
    name: "ML Model Training",
    description: "Train custom machine learning models",
    icon: "cpu",
    category: "AI",
    inputs: [{ id: "in", label: "Input" }],
    outputs: [{ id: "out", label: "Model" }],
    defaultConfig: { name: "New Model Training" },
  },
  {
    type: "Transform",
    name: "2D/3D Gravity Inversion",
    description: "Model subsurface density from gravity data",
    icon: "gravity",
    category: "Geoscience Solutions",
    inputs: [{ id: "in", label: "Gravity Data" }],
    outputs: [{ id: "out", label: "Density Model" }],
    defaultConfig: { name: "New Gravity Inversion" },
  },
  {
    type: "Transform",
    name: "2D/3D Conductivity Joint Inversion",
    description: "Jointly invert multiple conductivity datasets",
    icon: "conductivity",
    category: "Geoscience Solutions",
    inputs: [
        { id: "in1", label: "Data 1" },
        { id: "in2", label: "Data 2" }
    ],
    outputs: [{ id: "out", label: "Conductivity Model" }],
    defaultConfig: { name: "New Joint Inversion" },
  },
  {
    type: "Transform",
    name: "Resistivity Inversion",
    description: "Model subsurface resistivity from electrical data",
    icon: "resistivity",
    category: "Geoscience Solutions",
    inputs: [{ id: "in", label: "Resistivity Data" }],
    outputs: [{ id: "out", label: "Resistivity Model" }],
    defaultConfig: { name: "New Resistivity Inversion" },
  },
  {
    type: "Transform",
    name: "IP Inversion",
    description: "Model chargeability from Induced Polarization data",
    icon: "ip",
    category: "Geoscience Solutions",
    inputs: [{ id: "in", label: "IP Data" }],
    outputs: [{ id: "out", label: "Chargeability Model" }],
    defaultConfig: { name: "New IP Inversion" },
  },
];

const categoryStyles: Record<string, { border: string; icon: string }> = {
  Source: {
    border: "border-l-green-500",
    icon: "text-green-500",
  },
  Transform: {
    border: "border-l-blue-500",
    icon: "text-blue-500",
  },
  AI: {
    border: "border-l-yellow-500",
    icon: "text-yellow-500",
  },
  "Geoscience Solutions": {
    border: "border-l-purple-500",
    icon: "text-purple-500",
  },
};

const DraggableComponent = ({ component }: { component: ComponentDefinition }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflow", component.name);
    event.dataTransfer.effectAllowed = "move";
  };

  const Icon = Icons[component.icon];
  const styles = categoryStyles[component.category] || { border: "border-l-gray-500", icon: "text-gray-500" };


  return (
    <div
      className={cn(
        "flex w-full cursor-grab items-center space-x-3 rounded-md border bg-card p-3 transition-shadow hover:shadow-md border-l-4",
        styles.border
      )}
      draggable
      onDragStart={onDragStart}
    >
      <Icon className={cn("h-6 w-6 shrink-0", "text-muted-foreground")} />
      <div className="flex flex-col">
        <span className="font-semibold">{component.name}</span>
        <span className="text-xs text-muted-foreground">{component.description}</span>
      </div>
    </div>
  );
};

export function ComponentSidebar() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComponents = COMPONENT_DEFINITIONS.filter(
    (def) =>
      def.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedComponents = filteredComponents.reduce((acc, component) => {
    const category = component.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, ComponentDefinition[]>);

  const categories = ["Source", "Transform", "AI", "Geoscience Solutions"].filter(category => groupedComponents[category]);

  return (
    <aside className="w-72 shrink-0 border-r bg-card flex flex-col">
      <div className="p-4 space-y-4 border-b">
        <h2 className="text-xl font-semibold tracking-tight">Components</h2>
        <Input 
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 pt-0">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-3 pt-4">
                <h3 className="text-sm font-medium uppercase text-muted-foreground px-1">{category}</h3>
                <div className="space-y-2">
                  {groupedComponents[category].map((def) => (
                    <DraggableComponent key={def.name} component={def} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}

    