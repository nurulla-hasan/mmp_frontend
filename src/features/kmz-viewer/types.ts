export type GeoPoint = {
  lat: number;
  lng: number;
};

export type KmzTile = {
  url: string; // Blob or Object URL
  corners: [GeoPoint, GeoPoint, GeoPoint, GeoPoint]; // [Bottom-Left, Bottom-Right, Top-Right, Top-Left]
  width: number;
  height: number;
};

export type KmzData = {
  name: string;
  tiles: KmzTile[];
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
