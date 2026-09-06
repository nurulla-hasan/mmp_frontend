import { Layers, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { KmzData } from "../types";
import KmzFloatingToolButton from "./KmzFloatingToolButton";

type Props = {
  document: KmzData | null;
  opacity: number;
  mobile: boolean;
  onSetOpacity: (val: number) => void;
};

const OPACITY_PRESETS = [0.25, 0.5, 0.75, 1.0];

export default function KmzOpacityPopover({
  document,
  opacity,
  mobile,
  onSetOpacity,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<div className="inline-flex" />}
        className="focus:outline-none focus-visible:outline-none"
      >
        <KmzFloatingToolButton
          icon={Layers}
          label={
            document
              ? `KMZ Opacity (${Math.round(opacity * 100)}%)`
              : "Opacity"
          }
          active={open}
          disabled={!document}
          onClick={() => setOpen((prev) => !prev)}
          mobile={mobile}
        />
      </PopoverTrigger>
      <PopoverContent
        side={mobile ? "top" : "left"}
        sideOffset={12}
        className="w-64 p-3 rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              <span className="text-xs font-semibold">
                KMZ স্বচ্ছতা (Opacity)
              </span>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              {Math.round(opacity * 100)}%
            </span>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {OPACITY_PRESETS.map((preset) => {
              const isSelected = Math.abs(opacity - preset) < 0.05;
              return (
                <Button
                  key={preset}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs px-1"
                  onClick={() => onSetOpacity(preset)}
                >
                  {Math.round(preset * 100)}%
                </Button>
              );
            })}
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
            <Button
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              disabled={opacity <= 0.1}
              onClick={() =>
                onSetOpacity(
                  Math.max(0.1, Math.round((opacity - 0.1) * 10) / 10),
                )
              }
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="text-[10px] text-muted-foreground text-center">
              -10% কমাতে +10% বাড়াতে
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7 shrink-0"
              disabled={opacity >= 1.0}
              onClick={() =>
                onSetOpacity(
                  Math.min(1.0, Math.round((opacity + 0.1) * 10) / 10),
                )
              }
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
