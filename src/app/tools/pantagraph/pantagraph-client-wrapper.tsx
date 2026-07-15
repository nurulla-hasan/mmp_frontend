'use client';

import nextDynamic from 'next/dynamic';

const PantagraphLayout = nextDynamic(
  () => import('@/features/pantagraph/components/PantagraphLayout'),
  { ssr: false }
);

export default function PantagraphClientWrapper() {
  return <PantagraphLayout />;
}
