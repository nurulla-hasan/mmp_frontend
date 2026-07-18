'use client';

import nextDynamic from 'next/dynamic';

const MouzaMapStudioLayout = nextDynamic(
  () => import('@/features/mouza-map-studio/components/MouzaMapStudioLayout'),
  { ssr: false },
);

export default function StudioClientWrapper() {
  return <MouzaMapStudioLayout />;
}
