import { Suspense } from 'react';
import StudioClientWrapper from './studio-client-wrapper';

export const metadata = {
  title: 'Mouza Map Studio | Mouza Map Pro',
  description: 'Align C.S & B.S mouza maps, perform cleanups, and export professional survey sheets.',
};

export default function MouzaMapStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <StudioClientWrapper />
    </Suspense>
  );
}
