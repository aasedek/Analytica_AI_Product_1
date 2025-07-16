"use client";

import React from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { AIOptimizerDialog } from "./ai-optimizer-dialog";
import { AIExecutorDialog } from "./ai-executor-dialog";
import type { PipelineNode, PipelineConnection } from "@/lib/types";

interface HeaderProps {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  pipeline: {
    nodes: PipelineNode[];
    connections: PipelineConnection[];
  };
}

export function Header({ onImport, onExport, pipeline }: HeaderProps) {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Icons.logo className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-xl font-bold tracking-tighter">Pipeline Pilot</h1>
          <p className="text-xs text-muted-foreground">Analytica AI product</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <AIOptimizerDialog pipeline={pipeline} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => importInputRef.current?.click()}
        >
          <Icons.upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <input
          type="file"
          ref={importInputRef}
          className="hidden"
          accept=".json"
          onChange={onImport}
        />
        <Button variant="outline" size="sm" onClick={onExport}>
          <Icons.download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <AIExecutorDialog pipeline={pipeline} />
      </div>
    </header>
  );
}
