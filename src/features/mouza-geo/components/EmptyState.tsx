import { FileUp, Globe2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  loadingFile: boolean;
  onUploadClick: () => void;
};

export default function EmptyState({
  loadingFile,
  onUploadClick,
}: EmptyStateProps) {
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Globe2 className="size-8" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-bold">
          মৌজা ম্যাপ Georeference করুন
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Settings থেকে PDF অথবা image upload করুন।
        </p>
        <div className="mt-5">
          <Button
            variant="default"
            size="lg"
            disabled={loadingFile}
            onClick={onUploadClick}
          >
            <FileUp className="size-4" />
            {loadingFile ? 'Load হচ্ছে…' : 'PDF / Image আপলোড'}
          </Button>
        </div>
      </div>
    </div>
  );
}
