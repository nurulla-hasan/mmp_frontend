import type { Point, TracerPolygon } from '@/features/tracer/store/useTracerStore';

export function pointDistance(start: Point, end: Point): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

export function polygonPixelArea(points: Point[]): number {
  if (points.length < 3) return 0;

  let doubleArea = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    doubleArea += current.x * next.y - next.x * current.y;
  }
  return Math.abs(doubleArea) / 2;
}

export function getPolygonBounds(polygons: TracerPolygon[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const polygon of polygons) {
    for (const point of polygon.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

export function formatDistance(value: number, unit: 'ft' | 'm'): string {
  return `${value.toFixed(value >= 100 ? 1 : 2)} ${unit === 'ft' ? 'ft' : 'm'}`;
}

export function formatArea(value: number, unit: 'ft' | 'm'): string {
  return `${value.toFixed(value >= 1000 ? 1 : 2)} ${unit === 'ft' ? 'sq ft' : 'm²'}`;
}
