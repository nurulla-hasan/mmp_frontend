import type Konva from 'konva';
import { getClosestPointOnSegment } from '@/features/land-measurement/utils/geometry';

export type SnapResult = {
  point: Konva.Vector2d;
  polyIndex: number | null;
  vertexIndex: number | null;
  edgeIndex: number | null;
};

type IndexedVertex = {
  point: Konva.Vector2d;
  polyIndex: number;
  vertexIndex: number;
  magnetMultiplier: number;
};

type IndexedEdge = {
  p1: Konva.Vector2d;
  p2: Konva.Vector2d;
  polyIndex: number;
  edgeIndex: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type TracerSnapIndex = {
  vertices: IndexedVertex[];
  edges: IndexedEdge[];
};

/** Precompute stable point and segment metadata once when boundary paths change. */
export function buildTracerSnapIndex(
  polygons: Konva.Vector2d[][],
  ignoreFlatVerticesThreshold = 15,
): TracerSnapIndex {
  const vertices: IndexedVertex[] = [];
  const edges: IndexedEdge[] = [];

  for (let polyIndex = 0; polyIndex < polygons.length; polyIndex++) {
    const polygon = polygons[polyIndex];
    for (let vertexIndex = 0; vertexIndex < polygon.length; vertexIndex++) {
      const point = polygon[vertexIndex];
      let magnetMultiplier = 1.5;

      if (vertexIndex > 0 && vertexIndex < polygon.length - 1) {
        const previous = polygon[vertexIndex - 1];
        const next = polygon[vertexIndex + 1];
        const angle1 = Math.atan2(point.y - previous.y, point.x - previous.x);
        const angle2 = Math.atan2(next.y - point.y, next.x - point.x);
        let deflection = Math.abs((angle1 - angle2) * 180 / Math.PI);
        if (deflection > 180) deflection = 360 - deflection;
        if (deflection <= ignoreFlatVerticesThreshold) magnetMultiplier = 0.5;
      }

      vertices.push({ point, polyIndex, vertexIndex, magnetMultiplier });
    }

    for (let edgeIndex = 0; edgeIndex < polygon.length - 1; edgeIndex++) {
      const point = polygon[edgeIndex];
      const next = polygon[edgeIndex + 1];
      edges.push({
        p1: point,
        p2: next,
        polyIndex,
        edgeIndex,
        minX: Math.min(point.x, next.x),
        maxX: Math.max(point.x, next.x),
        minY: Math.min(point.y, next.y),
        maxY: Math.max(point.y, next.y),
      });
    }
  }

  return { vertices, edges };
}

export const getTracerSnappedPoint = (
  pt: Konva.Vector2d,
  index: TracerSnapIndex,
  thresholdPx: number,
): SnapResult => {
  let minVertexDistSquared = (thresholdPx * 1.5) ** 2;
  let minEdgeDistSquared = thresholdPx ** 2;
  let snappedVertex: Konva.Vector2d | null = null;
  let snappedEdge: Konva.Vector2d | null = null;
  
  let bestPolyIndex: number | null = null;
  let bestVertexIndex: number | null = null;
  
  let bestEdgePolyIndex: number | null = null;
  let bestEdgeIndex: number | null = null;

  for (const vertex of index.vertices) {
    const dx = vertex.point.x - pt.x;
    const dy = vertex.point.y - pt.y;
    const maxDistance = thresholdPx * vertex.magnetMultiplier;
    if (Math.abs(dx) >= maxDistance || Math.abs(dy) >= maxDistance) continue;

    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < maxDistance * maxDistance && distanceSquared < minVertexDistSquared) {
      minVertexDistSquared = distanceSquared;
      snappedVertex = vertex.point;
      bestPolyIndex = vertex.polyIndex;
      bestVertexIndex = vertex.vertexIndex;
    }
  }

  for (const edge of index.edges) {
    if (
      pt.x < edge.minX - thresholdPx ||
      pt.x > edge.maxX + thresholdPx ||
      pt.y < edge.minY - thresholdPx ||
      pt.y > edge.maxY + thresholdPx
    ) {
      continue;
    }

    const closest = getClosestPointOnSegment(pt, edge.p1, edge.p2);
    const dx = closest.x - pt.x;
    const dy = closest.y - pt.y;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < minEdgeDistSquared) {
      minEdgeDistSquared = distanceSquared;
      snappedEdge = closest;
      bestEdgePolyIndex = edge.polyIndex;
      bestEdgeIndex = edge.edgeIndex;
    }
  }

  if (snappedVertex) return { point: snappedVertex, polyIndex: bestPolyIndex, vertexIndex: bestVertexIndex, edgeIndex: null };
  if (snappedEdge) return { point: snappedEdge, polyIndex: bestEdgePolyIndex, vertexIndex: null, edgeIndex: bestEdgeIndex };

  return { point: pt, polyIndex: null, vertexIndex: null, edgeIndex: null };
};
