import { Suspense } from 'react';
import StudioClientWrapper from './studio-client-wrapper';

export const metadata = {
  title: 'মৌজা ম্যাপ স্টুডিও | Mouza Map Pro',
  description: 'C.S ও B.S মৌজা ম্যাপ মিলিয়ে একই workspace-এ পরিষ্কার vector map trace করুন।',
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
