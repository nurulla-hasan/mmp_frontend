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
      title="মৌজা ম্যাপ জিওরেফারেন্স করুন"
      description="PDF বা image আপলোড করে মৌজা ম্যাপকে বাস্তব পৃথিবীর অবস্থানের সঙ্গে মিলান এবং Google Earth-এর জন্য KMZ export করুন।"
      actions={
        <Button onClick={onOpenSettings} className="w-full gap-2">
          <Settings2 className="size-4" />
          জিও সেটিংস খুলুন
        </Button>
      }
    />
  );
}
