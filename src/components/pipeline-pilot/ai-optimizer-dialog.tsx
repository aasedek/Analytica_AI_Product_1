
"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getAIOptimizations } from "@/app/actions";
import type { PipelineNode, PipelineConnection } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface AIOptimizerDialogProps {
  pipeline: {
    nodes: PipelineNode[];
    connections: PipelineConnection[];
  };
}

export function AIOptimizerDialog({ pipeline }: AIOptimizerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ suggestions: string; rationale: string } | null>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pipelineString = JSON.stringify(pipeline, null, 2);
    formData.set("pipelineConfiguration", pipelineString);

    startTransition(async () => {
      const res = await getAIOptimizations(formData);
      if (res.suggestions.includes("error")) {
        toast({
          title: "Optimization Error",
          description: res.rationale,
          variant: "destructive",
        });
        setResult(null);
      } else {
        setResult(res);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="group">
          <Icons.sparkles className="mr-2 h-4 w-4 text-yellow-500 transition-colors group-hover:text-white" />
          Optimize with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>AI-Powered Pipeline Optimization</DialogTitle>
            <DialogDescription>
              Analyze your pipeline configuration and get suggestions for
              improving performance, cost, and efficiency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="optimizationGoals">Optimization Goals</Label>
              <Textarea
                id="optimizationGoals"
                name="optimizationGoals"
                placeholder="e.g., 'Maximize performance and reduce data processing costs.'"
                required
              />
            </div>

            {isPending && (
              <div className="flex items-center justify-center rounded-md border border-dashed p-8">
                <Icons.bot className="mr-2 h-6 w-6 animate-spin" />
                <p>Analyzing your pipeline...</p>
              </div>
            )}
            {result && (
              <div className="mt-4 rounded-md border bg-secondary/50 p-4">
                <ScrollArea className="h-[250px]">
                <h4 className="font-semibold text-lg mb-2">Optimization Suggestions</h4>
                <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: result.suggestions.replace(/\n/g, '<br />') }}/>
                <Separator className="my-4" />
                <h4 className="font-semibold text-lg mb-2">Rationale</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: result.rationale.replace(/\n/g, '<br />') }} />
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Optimizing..." : "Run Optimization"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
