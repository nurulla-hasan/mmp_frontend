import type { Point } from '../store/useTracerStore';

export function getPositionOnPolygon(pt: Point, poly: Point[]): { edgeIndex: number; distance: number; fraction: number } | null {
  let bestEdge = -1;
  let minDist = Infinity;
  let bestFraction = 0;
  
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    
    const l2 = (p1.x - p2.x)**2 + (p1.y - p2.y)**2;
    if (l2 === 0) continue;
    
    let t = ((pt.x - p1.x) * (p2.x - p1.x) + (pt.y - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const projX = p1.x + t * (p2.x - p1.x);
    const projY = p1.y + t * (p2.y - p1.y);
    
    const dist = Math.hypot(pt.x - projX, pt.y - projY);
    if (dist < minDist) {
      minDist = dist;
      bestEdge = i;
      bestFraction = t;
    }
  }
  
  // Use a generous threshold like 1.5 pixels since coordinates might be slightly floating point off
  if (minDist < 1.5) { 
    return { edgeIndex: bestEdge, distance: minDist, fraction: bestFraction };
  }
  return null;
}

export function getForwardVertices(S: number, fs: number, E: number, fe: number, N: number): number[] {
  const vertices: number[] = [];
  if (S === E && fs <= fe) return vertices; 
  
  let curr = (S + 1) % N;
  while (true) {
    vertices.push(curr);
    if (curr === E) break;
    curr = (curr + 1) % N;
  }
  return vertices;
}

export function getBackwardVertices(S: number, fs: number, E: number, fe: number, N: number): number[] {
  const vertices: number[] = [];
  if (S === E && fs >= fe) return vertices; 
  
  let curr = S;
  while (true) {
    vertices.push(curr);
    if (curr === (E + 1) % N) break;
    curr = (curr - 1 + N) % N;
  }
  return vertices;
}

function calculatePathLength(startPt: Point, endPt: Point, poly: Point[], pathIdxs: number[]): number {
  if (pathIdxs.length === 0) {
    return Math.hypot(endPt.x - startPt.x, endPt.y - startPt.y);
  }
  let len = Math.hypot(poly[pathIdxs[0]].x - startPt.x, poly[pathIdxs[0]].y - startPt.y);
  for (let i = 0; i < pathIdxs.length - 1; i++) {
    len += Math.hypot(poly[pathIdxs[i+1]].x - poly[pathIdxs[i]].x, poly[pathIdxs[i+1]].y - poly[pathIdxs[i]].y);
  }
  len += Math.hypot(endPt.x - poly[pathIdxs[pathIdxs.length - 1]].x, endPt.y - poly[pathIdxs[pathIdxs.length - 1]].y);
  return len;
}

export function routeAlongPolygon(pStart: Point, pEnd: Point, poly: Point[]): Point[] | null {
  const startPos = getPositionOnPolygon(pStart, poly);
  const endPos = getPositionOnPolygon(pEnd, poly);
  
  if (!startPos || !endPos) return null; 
  
  const N = poly.length;
  
  const forwardIdxs = getForwardVertices(startPos.edgeIndex, startPos.fraction, endPos.edgeIndex, endPos.fraction, N);
  const backwardIdxs = getBackwardVertices(startPos.edgeIndex, startPos.fraction, endPos.edgeIndex, endPos.fraction, N);
  
  let shortestPath: Point[] | null = null;
  let shortestPathDist = 0;
  
  const fDist = calculatePathLength(pStart, pEnd, poly, forwardIdxs);
  const bDist = calculatePathLength(pStart, pEnd, poly, backwardIdxs);
  
  // Choose the shorter path by physical distance
  if (fDist <= bDist) {
    shortestPathDist = fDist;
    shortestPath = forwardIdxs.map(i => poly[i]);
  } else {
    shortestPathDist = bDist;
    shortestPath = backwardIdxs.map(i => poly[i]);
  }
  
  const straightDist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  
  // If the straight line is significantly shorter than the boundary path, it's a cut across the polygon.
  if (straightDist < shortestPathDist * 0.6) {
    return null;
  }
  
  return shortestPath;
}
