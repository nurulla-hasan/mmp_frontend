import { Suspense } from 'react';
import TracerClientWrapper from './tracer-client-wrapper';

export const metadata = {
  title: 'Digital Map Tracer | Mouza Map Pro',
  description: 'Trace C.S and B.S plot boundaries over old mouza maps to create clean digital vector maps.',
};

export default function TracerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <TracerClientWrapper />
    </Suspense>
  );
}
