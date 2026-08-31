"use client";

import { type ReactNode } from "react";
import {
  Crop,
  Eraser,
  Eye,
  EyeOff,
  Hand,
  Pencil,
  Redo2,
  RotateCcw,
  Type,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StudioEditorTool } from "../store/useMouzaMapStudioStore";

const toolDefinitions: Array<{
  id: StudioEditorTool;
  label: string;
  icon: typeof Hand;
}> = [
  { id: "pan", label: "সরান / Zoom", icon: Hand },
  { id: "cleanup", label: "Cleanup brush", icon: Eraser },
  { id: "text", label: "লেখা বসান", icon: Type },
  { id: "mark", label: "Mark আঁকুন", icon: Pencil },
];

function EditorTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="inline-flex" />}
        className="focus:outline-none focus-visible:outline-none"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

type StudioEditorToolbarProps = {
  editorTool: StudioEditorTool;
  showEdits: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasContent: boolean;
  onSelectTool: (tool: StudioEditorTool) => void;
  onToggleShowEdits: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onOpenCrop: () => void;
};

export default function StudioEditorToolbar({
  editorTool,
  showEdits,
  canUndo,
  canRedo,
  hasContent,
  onSelectTool,
  onToggleShowEdits,
  onUndo,
  onRedo,
  onClear,
  onOpenCrop,
}: StudioEditorToolbarProps) {
  return (
    <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl">
      <EditorTooltip label="দুই ম্যাপ একসাথে crop করুন">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="দুই ম্যাপ একসাথে crop করুন"
          className="text-muted-foreground"
          onClick={onOpenCrop}
        >
          <Crop className="size-5" />
        </Button>
      </EditorTooltip>

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {toolDefinitions.map(({ id, label, icon: Icon }) => (
        <EditorTooltip key={id} label={label}>
          <Button
            type="button"
            variant={editorTool === id ? "default" : "ghost"}
            size="icon-lg"
            aria-label={label}
            className={editorTool === id ? "" : "text-muted-foreground"}
            onClick={() => onSelectTool(id)}
          >
            <Icon className="size-5" />
          </Button>
        </EditorTooltip>
      ))}

      <div className="my-0.5 h-px w-6 bg-border/60" />

      <EditorTooltip label={showEdits ? "Original map দেখুন" : "Edited map দেখুন"}>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label={showEdits ? "Original map দেখুন" : "Edited map দেখুন"}
          className="text-muted-foreground"
          onClick={onToggleShowEdits}
        >
          {showEdits ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
        </Button>
      </EditorTooltip>
      <EditorTooltip label="শেষ edit ফিরিয়ে নিন">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="শেষ edit ফিরিয়ে নিন"
          disabled={!canUndo}
          className="text-muted-foreground"
          onClick={onUndo}
        >
          <Undo2 className="size-5" />
        </Button>
      </EditorTooltip>
      <EditorTooltip label="ফিরিয়ে নেওয়া edit আবার দিন">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="ফিরিয়ে নেওয়া edit আবার দিন"
          disabled={!canRedo}
          className="text-muted-foreground"
          onClick={onRedo}
        >
          <Redo2 className="size-5" />
        </Button>
      </EditorTooltip>
      <EditorTooltip label="সব edit মুছুন">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="সব edit মুছুন"
          disabled={!hasContent}
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-5" />
        </Button>
      </EditorTooltip>
    </div>
  );
}
