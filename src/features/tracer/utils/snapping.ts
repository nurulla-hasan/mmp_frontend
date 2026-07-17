import type Konva from 'konva';
import { getClosestPointOnSegment } from '@/features/map-tool/utils/geometry';

export const getTracerSnappedPoint = (
  pt: Konva.Vector2d,
  polygons: Konva.Vector2d[][],
  thresholdPx: number,
  ignoreFlatVerticesThreshold = 15
): Konva.Vector2d => {
  let minVertexDist = thresholdPx * 1.5;
  let minEdgeDist = thresholdPx;
  let snappedVertex: Konva.Vector2d | null = null;
  let snappedEdge: Konva.Vector2d | null = null;

  for (const poly of polygons) {
    for (let i = 0; i < poly.length; i++) {
      const p1 = poly[i];
      const p2 = poly[(i + 1) % poly.length];

      // Calculate angle deflection at p1
      let magnetMultiplier = 1.5;
      if (poly.length > 2) {
        const prev = poly[(i - 1 + poly.length) % poly.length];
        const next = p2;
        const angle1 = (Math.atan2(p1.y - prev.y, p1.x - prev.x) * 180) / Math.PI;
        const angle2 = (Math.atan2(next.y - p1.y, next.x - p1.x) * 180) / Math.PI;
        let deflection = Math.abs(angle1 - angle2);
        if (deflection > 180) deflection = 360 - deflection;

        // If it's a flat vertex, use a weak magnet so it doesn't aggressively pull
        // when trying to place a point nearby on the straight line.
        if (deflection <= ignoreFlatVerticesThreshold) {
          magnetMultiplier = 0.5;
        }
      }

      const vDist = Math.hypot(p1.x - pt.x, p1.y - pt.y);
      if (vDist < thresholdPx * magnetMultiplier && vDist < minVertexDist) {
        minVertexDist = vDist;
        snappedVertex = p1;
      }

      // Check edge
      const closest = getClosestPointOnSegment(pt, p1, p2);
      const eDist = Math.hypot(closest.x - pt.x, closest.y - pt.y);
      if (eDist < minEdgeDist) {
        minEdgeDist = eDist;
        snappedEdge = closest;
      }
    }
  }

  if (snappedVertex) return snappedVertex;
  if (snappedEdge) return snappedEdge;

  return pt;
};
