import { FileUp, Globe2 } from 'lucide-react';

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
        <button
          type="button"
          disabled={loadingFile}
          onClick={onUploadClick}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          <FileUp className="size-4" />
          {loadingFile ? 'Load হচ্ছে…' : 'PDF / Image আপলোড'}
        </button>
      </div>
    </div>
  );
}
