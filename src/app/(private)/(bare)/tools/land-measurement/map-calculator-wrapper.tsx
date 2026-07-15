'use client';

import nextDynamic from 'next/dynamic';

const MapCalculator = nextDynamic(
  () => import('@/features/map-tool/components/MapCalculator'),
  { ssr: false }
);

export default function MapCalculatorWrapper() {
  return <MapCalculator />;
}
