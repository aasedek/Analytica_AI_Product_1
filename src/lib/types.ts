import type { Icons } from "@/components/icons";

export type PipelineComponentType =
  | 'Source'
  | 'Filter'
  | 'Aggregate'
  | 'Join'
  | 'Transform'
  | 'Output';

export interface ComponentConfig {
  name: string;
  [key: string]: any;
}

export interface PipelineNode {
  id: string;
  type: string; // Now a string to accommodate new component names
  position: { x: number; y: number };
  config: ComponentConfig;
}

export interface PipelineConnection {
  id:string;
  sourceId: string;
  sourceHandle: string;
  targetId: string;
  targetHandle: string;
}

export interface ComponentDefinition {
  type: PipelineComponentType;
  name: string;
  description: string;
  icon: keyof typeof Icons;
  category: 'Source' | 'Transform' | 'AI' | 'Geoscience Solutions';
  inputs: { id: string; label: string }[];
  outputs: { id: string; label: string }[];
  defaultConfig: ComponentConfig;
}
