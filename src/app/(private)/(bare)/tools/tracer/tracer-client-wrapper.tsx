'use client';

import nextDynamic from 'next/dynamic';

const TracerLayout = nextDynamic(
  () => import('@/features/tracer/components/TracerLayout'),
  { ssr: false },
);

export default function TracerClientWrapper() {
  return <TracerLayout />;
}
