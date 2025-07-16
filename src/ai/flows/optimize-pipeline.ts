// This file uses AI to analyze a data pipeline configuration and provide optimization suggestions.

'use server';

import {ai} from '@/ai/genkit';
import {
  OptimizePipelineInputSchema,
  type OptimizePipelineInput,
  OptimizePipelineOutputSchema,
  type OptimizePipelineOutput,
} from '@/ai/schemas';

export async function optimizePipeline(input: OptimizePipelineInput): Promise<OptimizePipelineOutput> {
  return optimizePipelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizePipelinePrompt',
  input: {schema: OptimizePipelineInputSchema},
  output: {schema: OptimizePipelineOutputSchema},
  prompt: `You are an AI expert in optimizing data pipelines. Analyze the provided pipeline configuration and suggest optimizations based on the specified goals.\n\nPipeline Configuration: {{{pipelineConfiguration}}}\nOptimization Goals: {{{optimizationGoals}}}\n\nProvide clear and actionable suggestions, along with a rationale for each suggestion. Consider factors like performance, cost, and efficiency.\n\nSuggestions should be formatted as a numbered list within the 'suggestions' field, and the 'rationale' field should explain why each suggestion is beneficial.\n\nYour analysis should focus on identifying bottlenecks, inefficiencies, and potential areas for improvement in the pipeline configuration. Consider suggesting alternative component arrangements, parameter adjustments, and the use of more efficient algorithms or data structures.\n\nEnsure that the suggestions are tailored to the specific characteristics of the pipeline and the stated optimization goals.\n`,
});

const optimizePipelineFlow = ai.defineFlow(
  {
    name: 'optimizePipelineFlow',
    inputSchema: OptimizePipelineInputSchema,
    outputSchema: OptimizePipelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
