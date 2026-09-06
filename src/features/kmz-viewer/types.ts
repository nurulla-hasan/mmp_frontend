export type GeoPoint = {
  lat: number;
  lng: number;
};

export type KmzTile = {
  url: string; // Blob or Object URL
  corners: [GeoPoint, GeoPoint, GeoPoint, GeoPoint]; // [Bottom-Left, Bottom-Right, Top-Right, Top-Left]
  width?: number;
  height?: number;
};

export type KmzFeature = {
  id: string;
  name?: string;
  description?: string;
  type: "Polygon" | "LineString" | "Point";
  // Coordinates in GeoPoint or array of GeoPoint
  rings?: GeoPoint[][]; // For Polygon: [outerRing, ...innerHoles]
  path?: GeoPoint[]; // For LineString
  point?: GeoPoint; // For Point
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
};

export type KmzData = {
  name: string;
  tiles: KmzTile[];
  features?: KmzFeature[];
  bounds?: [[number, number], [number, number]] | null; // [[minLat, minLng], [maxLat, maxLng]]
  summary?: {
    tileCount: number;
    polygonCount: number;
    lineCount: number;
    pointCount: number;
  };
};

export type UserLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
};

export type InspectedCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapStyle = "satellite" | "street";
