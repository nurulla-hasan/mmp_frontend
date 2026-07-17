'use client';

import nextDynamic from 'next/dynamic';

const MapCalculator = nextDynamic(
  () => import('@/features/land-measurement/components/MapCalculator'),
  { ssr: false }
);

export default function MapCalculatorWrapper() {
  return <MapCalculator />;
}
