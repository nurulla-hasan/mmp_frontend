'use client';

import nextDynamic from 'next/dynamic';

const MouzaGeoStudio = nextDynamic(
  () => import('@/features/mouza-geo/components/MouzaGeoStudio'),
  { ssr: false },
);

export default function GeoStudioClient() {
  return <MouzaGeoStudio />;
}
