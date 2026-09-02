import { Suspense } from 'react';

import GeoStudioClient from './geo-studio-client';

export const metadata = {
  title: 'Mouza Geo Studio | Mouza Map Pro',
  description: 'Align mouza maps with real-world geographical coordinates and export as KMZ.',
};

export default function MouzaGeoStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center bg-background">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <GeoStudioClient />
    </Suspense>
  );
}
