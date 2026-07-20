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

export type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

export type GooglePoint = {
  x: number;
  y: number;
};

export type GoogleMapsEvent = {
  latLng?: GoogleLatLng | null;
};

export type GoogleMapsListener = {
  remove: () => void;
};

export type GoogleMap = {
  addListener: (
    eventName: string,
    handler: (event: GoogleMapsEvent) => void,
  ) => GoogleMapsListener;
  getCenter: () => GoogleLatLng | undefined;
  getZoom: () => number | undefined;
};

export type GoogleMapProjection = {
  fromLatLngToContainerPixel: (point: GoogleLatLng) => GooglePoint | null;
  fromContainerPixelToLatLng: (
    point: GooglePoint,
    noClampNoWrap?: boolean,
  ) => GoogleLatLng | null;
};

export type GoogleOverlayView = {
  onAdd: () => void;
  draw: () => void;
  onRemove: () => void;
  setMap: (map: GoogleMap | null) => void;
  getProjection: () => GoogleMapProjection;
};

export type GoogleMapsApi = {
  Map: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => GoogleMap;
  LatLng: new (lat: number, lng: number) => GoogleLatLng;
  Point: new (x: number, y: number) => GooglePoint;
  OverlayView: new () => GoogleOverlayView;
  MapTypeId: {
    HYBRID: string;
    ROADMAP: string;
    SATELLITE: string;
  };
};
