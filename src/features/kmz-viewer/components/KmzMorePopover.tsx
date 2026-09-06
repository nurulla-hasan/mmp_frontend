import {
  MoreHorizontal,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { KmzData } from "../types";

type Props = {
  document: KmzData | null;
  mobile: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClearDocument: () => void;
};

export default function KmzMorePopover({
  document,
  mobile,
  onZoomIn,
  onZoomOut,
  onClearDocument,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant={open ? "default" : "ghost"}
            size={mobile ? "icon" : "icon-lg"}
            aria-label="More Options"
            title="More Options"
            className={open ? "" : "text-muted-foreground"}
          >
            <MoreHorizontal className={mobile ? "size-4" : "size-5"} />
          </Button>
        }
      />
      <PopoverContent
        side={mobile ? "top" : "left"}
        sideOffset={12}
        className="w-48 p-1.5 rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md"
      >
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs font-normal"
            onClick={onZoomIn}
          >
            <ZoomIn className="size-3.5 text-muted-foreground" />
            <span>Zoom In (+)</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs font-normal"
            onClick={onZoomOut}
          >
            <ZoomOut className="size-3.5 text-muted-foreground" />
            <span>Zoom Out (-)</span>
          </Button>

          {document && (
            <>
              <div className="my-1 h-px bg-border/60" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onClearDocument();
                  setOpen(false);
                }}
              >
                <RotateCcw className="size-3.5 text-destructive" />
                <span>Reset / Clear KMZ</span>
              </Button>
            </>
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
}
