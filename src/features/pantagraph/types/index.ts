export interface Point2D {
  x: number;
  y: number;
}

export interface MatchPoint {
  id: string;
  former: Point2D;
  current: Point2D | null; // null = not yet placed
}

export interface SimilarityResult {
  tx: number;
  ty: number;
  rotation: number; // radians
  scale: number;
}
