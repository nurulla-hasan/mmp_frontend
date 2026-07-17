import type Konva from 'konva';
import { getClosestPointOnSegment } from '@/features/land-measurement/utils/geometry';

export type SnapResult = {
  point: Konva.Vector2d;
  polyIndex: number | null;
  vertexIndex: number | null;
  edgeIndex: number | null;
};

export const getTracerSnappedPoint = (
  pt: Konva.Vector2d,
  polygons: Konva.Vector2d[][],
  thresholdPx: number,
  ignoreFlatVerticesThreshold = 15
): SnapResult => {
  let minVertexDist = thresholdPx * 1.5;
  let minEdgeDist = thresholdPx;
  let snappedVertex: Konva.Vector2d | null = null;
  let snappedEdge: Konva.Vector2d | null = null;
  
  let bestPolyIndex: number | null = null;
  let bestVertexIndex: number | null = null;
  
  let bestEdgePolyIndex: number | null = null;
  let bestEdgeIndex: number | null = null;

  for (let pIdx = 0; pIdx < polygons.length; pIdx++) {
    const poly = polygons[pIdx];
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

        if (deflection <= ignoreFlatVerticesThreshold) {
          magnetMultiplier = 0.5;
        }
      }

      const vDist = Math.hypot(p1.x - pt.x, p1.y - pt.y);
      if (vDist < thresholdPx * magnetMultiplier && vDist < minVertexDist) {
        minVertexDist = vDist;
        snappedVertex = p1;
        bestPolyIndex = pIdx;
        bestVertexIndex = i;
      }

      // Check edge
      const closest = getClosestPointOnSegment(pt, p1, p2);
      const eDist = Math.hypot(closest.x - pt.x, closest.y - pt.y);
      if (eDist < minEdgeDist) {
        minEdgeDist = eDist;
        snappedEdge = closest;
        bestEdgePolyIndex = pIdx;
        bestEdgeIndex = i;
      }
    }
  }

  if (snappedVertex) return { point: snappedVertex, polyIndex: bestPolyIndex, vertexIndex: bestVertexIndex, edgeIndex: null };
  if (snappedEdge) return { point: snappedEdge, polyIndex: bestEdgePolyIndex, vertexIndex: null, edgeIndex: bestEdgeIndex };

  return { point: pt, polyIndex: null, vertexIndex: null, edgeIndex: null };
};

