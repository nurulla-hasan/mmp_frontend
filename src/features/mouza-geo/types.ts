export type Point2D = {
  x: number;
  y: number;
};

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type MercatorPoint = {
  u: number;
  v: number;
};

export type ControlPair = {
  id: string;
  source: Point2D;
  world: GeoPoint;
};

export type InteractionTarget = 'map' | 'pdf';
export type AlignmentMode = 'similarity' | 'affine';

/** Source-image pixels to normalized Web Mercator coordinates. */
export type GeoTransform = {
  mode: AlignmentMode;
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
};

