import { FileUp, Globe2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToolEmptyState } from '@/components/tools/tool-workspace-ui';

type EmptyStateProps = {
  loadingFile: boolean;
  onUploadClick: () => void;
};

export default function EmptyState({
  loadingFile,
  onUploadClick,
}: EmptyStateProps) {
  return (
    <ToolEmptyState
      icon={Globe2}
      title="মৌজা ম্যাপ জিওরেফারেন্স করুন"
      description="কাজ শুরু করতে PDF অথবা image আপলোড করুন।"
      actions={
        <Button
          size="lg"
          disabled={loadingFile}
          onClick={onUploadClick}
          className="w-full"
        >
          <FileUp className="size-4" />
          {loadingFile ? 'লোড হচ্ছে…' : 'PDF / Image আপলোড'}
        </Button>
      }
    />
  );
}
