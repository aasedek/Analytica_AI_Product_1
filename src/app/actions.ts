"use server";

import { optimizePipeline } from "@/ai/flows/optimize-pipeline";
import { 
  type OptimizePipelineInput, 
  type OptimizePipelineOutput, 
  type ExecutePipelineInput, 
  type ExecutePipelineOutput,
  AIOptimizerSchema,
  AIExecutorSchema 
} from "@/ai/schemas";


export async function getAIOptimizations(
  formData: FormData
): Promise<OptimizePipelineOutput> {
  const parsed = AIOptimizerSchema.safeParse({
    pipelineConfiguration: formData.get("pipelineConfiguration"),
    optimizationGoals: formData.get("optimizationGoals"),
  });

  if (!parsed.success) {
    return {
      suggestions: "Invalid input provided.",
      rationale: parsed.error.message,
    };
  }

  const pipelineData = JSON.parse(parsed.data.pipelineConfiguration);

  const input: OptimizePipelineInput = {
    pipelineConfiguration: JSON.stringify(pipelineData, null, 2),
    optimizationGoals: parsed.data.optimizationGoals,
  };

  try {
    const result = await optimizePipeline(input);
    return result;
  } catch (error) {
    console.error("Error optimizing pipeline:", error);
    return {
      suggestions: "An error occurred while generating suggestions.",
      rationale:
        error instanceof Error ? error.message : "Please check the server logs for more details.",
    };
  }
}

export async function getAIExecution(
  formData: FormData
): Promise<ExecutePipelineOutput> {
  const parsed = AIExecutorSchema.safeParse({
    pipelineConfiguration: formData.get("pipelineConfiguration"),
  });

  if (!parsed.success) {
    return {
      executionPlan: "Invalid input provided.",
    };
  }
  
  const pipelineData = JSON.parse(parsed.data.pipelineConfiguration);
  const backendUrl = process.env.PYTHON_BACKEND_URL;

  if (!backendUrl) {
    return {
      executionPlan: "Error: PYTHON_BACKEND_URL environment variable is not set. Please configure the backend URL in the .env file."
    };
  }

  try {
    console.log(`Sending pipeline to backend: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend request failed with status ${response.status}: ${errorText}`);
    }

    // Assuming the backend returns a JSON object with an "executionPlan" key
    const result = await response.json();
    return {
        executionPlan: result.executionPlan || "Backend returned a response without an execution plan."
    };

  } catch (error) {
    console.error("Error executing pipeline with Python backend:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      executionPlan: `An error occurred while communicating with the Python backend: ${errorMessage}`
    };
  }
}
