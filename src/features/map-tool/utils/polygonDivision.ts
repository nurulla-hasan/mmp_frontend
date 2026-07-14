import type { Point } from '../types/map';
import { isPointInPolygon, getLineIntersection, normalizePolygonPoints } from './geometry';
import { DIVISION_VERTEX_SNAP_PX } from './mapCalculations';

function getSegmentIntersection(p1: Point, p2: Point, p3: Point, p4: Point): (Point & { t: number }) | null {
  const point = getLineIntersection(p1, p2, p3, p4);
  if (!point) return null;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq > 0 ? ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSq : 0;
  return { ...point, t };
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const snapToNearbyPolygonVertex = (point: Point, polygon: Point[]): Point => {
  let nearest = point;
  let nearestDistance = DIVISION_VERTEX_SNAP_PX;

  for (const vertex of polygon) {
    const dist = distance(point, vertex);
    if (dist <= nearestDistance) {
      nearestDistance = dist;
      nearest = vertex;
    }
  }

  return { x: nearest.x, y: nearest.y };
};

const cleanSplitPolygon = (points: Point[], sourcePolygon: Point[]): Point[] => {
  let cleaned = normalizePolygonPoints(
    points.map(point => snapToNearbyPolygonVertex(point, sourcePolygon))
  );

  let changed = true;
  while (changed && cleaned.length > 3) {
    changed = false;
    const next: Point[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const prev = cleaned[(i - 1 + cleaned.length) % cleaned.length];
      const current = cleaned[i];
      const following = cleaned[(i + 1) % cleaned.length];

      if (
        cleaned.length - next.length > 3 &&
        (distance(prev, current) <= DIVISION_VERTEX_SNAP_PX || distance(current, following) <= DIVISION_VERTEX_SNAP_PX)
      ) {
        changed = true;
        continue;
      }

      next.push(current);
    }

    cleaned = normalizePolygonPoints(next);
  }

  return cleaned;
};

export function splitPolygonByPolyline(polygon: Point[], polyline: Point[]): { poly1: Point[], poly2: Point[] } | null {
  if (polyline.length < 2) return null;
  
  // Create extended segments
  const segments: { p1: Point; p2: Point; baseDist: number; len: number }[] = [];
  let currentDist = 0;
  
  for (let i = 0; i < polyline.length - 1; i++) {
    let pA = { ...polyline[i] };
    let pB = { ...polyline[i + 1] };
    
    // Extend the first segment backwards
    if (i === 0) {
      const dx = pA.x - pB.x;
      const dy = pA.y - pB.y;
      pA = { x: pA.x + dx * 10000, y: pA.y + dy * 10000 };
    }
    // Extend the last segment forwards
    if (i === polyline.length - 2) {
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      pB = { x: pB.x + dx * 10000, y: pB.y + dy * 10000 };
    }
    
    const len = Math.hypot(pB.x - pA.x, pB.y - pA.y);
    segments.push({ p1: pA, p2: pB, baseDist: currentDist, len });
    currentDist += len;
  }
  
  const intersections: Array<{ x: number; y: number; dist: number; edgeIdx: number }> = [];
  
  for (let i = 0; i < polygon.length; i++) {
    const e1 = polygon[i];
    const e2 = polygon[(i + 1) % polygon.length];
    
    for (const seg of segments) {
      const inter = getSegmentIntersection(seg.p1, seg.p2, e1, e2);
      if (inter) {
        intersections.push({
          x: inter.x,
          y: inter.y,
          dist: seg.baseDist + inter.t * seg.len,
          edgeIdx: i
        });
      }
    }
  }
  
  if (intersections.length < 2) return null;
  
  intersections.sort((a, b) => a.dist - b.dist);
  
  const enter = intersections[0];
  const exit = intersections[intersections.length - 1];
  
  const polylinePath: Point[] = [];
  polylinePath.push({ x: enter.x, y: enter.y });
  
  // Add inner vertices of the polyline
  for (let i = 1; i < polyline.length - 1; i++) {
    if (isPointInPolygon(polyline[i], polygon)) {
      polylinePath.push(polyline[i]);
    }
  }
  polylinePath.push({ x: exit.x, y: exit.y });
  
  // Find which intersection comes first on the edge
  let enterComesBeforeExit = false;
  if (enter.edgeIdx === exit.edgeIdx) {
    const pStart = polygon[enter.edgeIdx];
    const dEnter = Math.hypot(enter.x - pStart.x, enter.y - pStart.y);
    const dExit = Math.hypot(exit.x - pStart.x, exit.y - pStart.y);
    enterComesBeforeExit = dEnter < dExit;
  }

  // Build poly1 (Walk polygon from exit to enter)
  const poly1: Point[] = [];
  poly1.push({ x: exit.x, y: exit.y });
  
  const poly1Wrap = enter.edgeIdx === exit.edgeIdx ? enterComesBeforeExit : true;
  if (poly1Wrap || enter.edgeIdx !== exit.edgeIdx) {
    let currIdx = (exit.edgeIdx + 1) % polygon.length;
    while (true) {
      poly1.push(polygon[currIdx]);
      if (currIdx === enter.edgeIdx) break;
      currIdx = (currIdx + 1) % polygon.length;
    }
  }
  
  poly1.push({ x: enter.x, y: enter.y });
  for (let i = 1; i < polylinePath.length - 1; i++) {
    poly1.push(polylinePath[i]);
  }

  // Build poly2 (Walk polygon from enter to exit)
  const poly2: Point[] = [];
  poly2.push({ x: enter.x, y: enter.y });
  
  const poly2Wrap = enter.edgeIdx === exit.edgeIdx ? !enterComesBeforeExit : true;
  if (poly2Wrap || enter.edgeIdx !== exit.edgeIdx) {
    let currIdx = (enter.edgeIdx + 1) % polygon.length;
    while (true) {
      poly2.push(polygon[currIdx]);
      if (currIdx === exit.edgeIdx) break;
      currIdx = (currIdx + 1) % polygon.length;
    }
  }
  
  poly2.push({ x: exit.x, y: exit.y });
  for (let i = polylinePath.length - 2; i > 0; i--) {
    poly2.push(polylinePath[i]);
  }
  
  const cleanedPoly1 = cleanSplitPolygon(poly1, polygon);
  const cleanedPoly2 = cleanSplitPolygon(poly2, polygon);

  if (cleanedPoly1.length < 3 || cleanedPoly2.length < 3) return null;

  return { poly1: cleanedPoly1, poly2: cleanedPoly2 };
}
