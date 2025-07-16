// This file is no longer used for execution but is kept for reference.
// The execution logic has been moved to src/app/actions.ts to call a Python backend.
'use server';

import {ai} from '@/ai/genkit';
import {
  ExecutePipelineInputSchema,
  type ExecutePipelineInput,
  ExecutePipelineOutputSchema,
  type ExecutePipelineOutput,
} from '@/ai/schemas';

export async function executePipeline(input: ExecutePipelineInput): Promise<ExecutePipelineOutput> {
  return executePipelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'executePipelinePrompt',
  input: {schema: ExecutePipelineInputSchema},
  output: {schema: ExecutePipelineOutputSchema},
  prompt: `You are an AI expert in data pipelines. Based on the provided pipeline structure (nodes and connections), create a logical, step-by-step execution plan.

The pipeline starts with "Source" nodes and ends with "Output" nodes. The connections define the flow of data.

Your output should be a markdown-formatted numbered list detailing each action. For each step, mention the component name and what it does based on its configuration.

Pipeline:
\`\`\`json
{{{jsonStringify pipeline}}}
\`\`\`
`,
});

const executePipelineFlow = ai.defineFlow(
  {
    name: 'executePipelineFlow',
    inputSchema: ExecutePipelineInputSchema,
    outputSchema: ExecutePipelineOutputSchema,
  },
  async (input) => {
    // Helper to stringify JSON in Handlebars
    ai.handlebars.registerHelper('jsonStringify', (context) => {
        return JSON.stringify(context, null, 2);
    });
    
    const {output} = await prompt(input);
    return output!;
  }
);
