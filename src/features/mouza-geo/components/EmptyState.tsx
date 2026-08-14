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
      description="PDF বা image আপলোড করে মৌজা ম্যাপকে বাস্তব পৃথিবীর অবস্থানের সঙ্গে মিলান এবং Google Earth-এর জন্য KMZ export করুন।"
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
