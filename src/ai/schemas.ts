import {z} from 'zod';

// Schemas for optimize-pipeline flow
export const OptimizePipelineInputSchema = z.object({
  pipelineConfiguration: z
    .string()
    .describe('The configuration of the data pipeline to be optimized.'),
  optimizationGoals: z
    .string()
    .describe(
      'The goals for optimizing the pipeline, such as performance, cost, and efficiency.'
    ),
});
export type OptimizePipelineInput = z.infer<typeof OptimizePipelineInputSchema>;

export const OptimizePipelineOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('AI-powered suggestions for optimizing the data pipeline.'),
  rationale: z
    .string()
    .describe('The rationale behind the optimization suggestions.'),
});
export type OptimizePipelineOutput = z.infer<typeof OptimizePipelineOutputSchema>;


// Schemas for execute-pipeline flow
const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({x: z.number(), y: z.number()}),
  config: z.record(z.any()),
});

const ConnectionSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    sourceHandle: z.string(),
    targetId: z.string(),
    targetHandle: z.string(),
});

export const ExecutePipelineInputSchema = z.object({
  pipeline: z.object({
    nodes: z.array(NodeSchema),
    connections: z.array(ConnectionSchema)
  }).describe('The entire pipeline structure including nodes and connections.'),
});
export type ExecutePipelineInput = z.infer<typeof ExecutePipelineInputSchema>;

export const ExecutePipelineOutputSchema = z.object({
  executionPlan: z
    .string()
    .describe('A step-by-step execution plan for the data pipeline, formatted as a markdown numbered list.'),
});
export type ExecutePipelineOutput = z.infer<typeof ExecutePipelineOutputSchema>;

// Schemas for actions.ts
export const AIOptimizerSchema = z.object({
  pipelineConfiguration: z.string(),
  optimizationGoals: z.string(),
});

export const AIExecutorSchema = z.object({
  pipelineConfiguration: z.string(),
});
