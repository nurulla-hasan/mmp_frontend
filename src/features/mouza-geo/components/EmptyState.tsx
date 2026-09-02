import { Globe2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolEmptyState } from "@/components/tools/tool-workspace-ui";

type EmptyStateProps = {
  onOpenSettings: () => void;
};

export default function EmptyState({ onOpenSettings }: EmptyStateProps) {
  return (
    <ToolEmptyState
      icon={Globe2}
      title="Georeference Mouza Map"
      description="Upload a PDF or image to align your mouza map with real-world geographical coordinates and export as KMZ for Google Earth."
      actions={
        <Button onClick={onOpenSettings} className="w-full gap-2">
          <Settings2 className="size-4" />
          Open Geo Settings
        </Button>
      }
    />
  );
}
