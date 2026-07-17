import { create } from 'zustand';
import { routeAlongPolygon } from '../utils/routing';
import { useShallow } from 'zustand/shallow';

export type Point = { x: number; y: number };

export type TracerPolygon = {
  id: string;
  points: Point[];
  label: string;
  labelX?: number;
  labelY?: number;
};

export type TracerLayer = {
  id: string;
  name: string;
  color: string;
  lineWidth: number;
  visible: boolean;
  polygons: TracerPolygon[];
};

export type TracerMode = 'select' | 'polygon';

// ── Deep clone layers array for undo/redo snapshots ──
function cloneLayers(layers: TracerLayer[]): TracerLayer[] {
  return layers.map(l => ({
    ...l,
    polygons: l.polygons.map(p => ({ ...p, points: p.points.map(pt => ({ ...pt })) })),
  }));
}

/** Compute the centroid (center) of a polygon */
export function centroid(points: Point[]): Point {
  if (!points.length) return { x: 0, y: 0 };
  const s = points.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / points.length, y: s.y / points.length };
}

const DEFAULT_LAYERS: TracerLayer[] = [
  { id: 'cs', name: 'C.S ম্যাপ', color: '#DC2626', lineWidth: 3, visible: true, polygons: [] },
  { id: 'bs', name: 'B.S ম্যাপ', color: '#16A34A', lineWidth: 3, visible: true, polygons: [] },
];

const EXTRA_COLORS = ['#2563EB', '#D97706', '#7C3AED', '#0891B2', '#BE185D'];
let _polyId = 0;
let _layerCount = 0;

export interface TracerStore {
  // Background
  backgroundImage: HTMLImageElement | null;
  imageLoading: boolean;

  // Layers & drawing
  layers: TracerLayer[];
  activeLayerId: string;
  mode: TracerMode;
  pendingPoints: Point[];
  pendingRedoPoints: Point[];

  // Selection
  selectedPolygonId: string | null;
  selectedLayerId: string | null;

  // Undo / redo
  past: TracerLayer[][];
  future: TracerLayer[][];

  // ── Actions ──
  setBackground(img: HTMLImageElement | null): void;
  setImageLoading(v: boolean): void;

  addLayer(): void;
  removeLayer(id: string): void;
  setActiveLayer(id: string): void;
  toggleLayerVisibility(id: string): void;
  setLayerColor(id: string, color: string): void;
  setLayerLineWidth(id: string, w: number): void;
  renameLayer(id: string, name: string): void;

  addPendingPoints(points: Point[]): void;
  undoPendingPoint(): void;
  redoPendingPoint(): void;
  commitPolygon(): void;
  cancelDrawing(): void;

  deletePolygon(layerId: string, polygonId: string): void;
  selectPolygon(layerId: string | null, polygonId: string | null): void;
  setPolygonLabel(layerId: string, polygonId: string, label: string): void;
  setPolygonLabelPosition(layerId: string, polygonId: string, x: number, y: number): void;

  setMode(mode: TracerMode): void;
  undo(): void;
  redo(): void;
  reset(): void;
}

export const useTracerStore = create<TracerStore>()((set, get) => ({
  backgroundImage: null,
  imageLoading: false,

  layers: cloneLayers(DEFAULT_LAYERS),
  activeLayerId: 'cs',

  mode: 'select',
  pendingPoints: [],
  pendingRedoPoints: [],

  selectedPolygonId: null,
  selectedLayerId: null,

  past: [],
  future: [],

  // ── Background ──────────────────────────────────────────────────────────────
  setBackground: (backgroundImage) => set({ backgroundImage }),
  setImageLoading: (imageLoading) => set({ imageLoading }),

  // ── Layer management ─────────────────────────────────────────────────────────
  addLayer: () => {
    _layerCount++;
    const newLayer: TracerLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${_layerCount}`,
      color: EXTRA_COLORS[(_layerCount - 1) % EXTRA_COLORS.length],
      lineWidth: 3,
      visible: true,
      polygons: [],
    };
    set(s => ({ layers: [...s.layers, newLayer], activeLayerId: newLayer.id }));
  },

  removeLayer: (id) =>
    set(s => {
      const layers = s.layers.filter(l => l.id !== id);
      return { layers, activeLayerId: s.activeLayerId === id ? (layers[0]?.id ?? 'cs') : s.activeLayerId };
    }),

  setActiveLayer: (id) => set({ activeLayerId: id, pendingPoints: [], pendingRedoPoints: [] }),
  toggleLayerVisibility: (id) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l) })),
  setLayerColor: (id, color) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, color } : l) })),
  setLayerLineWidth: (id, lineWidth) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, lineWidth } : l) })),
  renameLayer: (id, name) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, name } : l) })),

  // ── Drawing ──────────────────────────────────────────────────────────────────
  addPendingPoints: (points) => set(s => ({ pendingPoints: [...s.pendingPoints, ...points], pendingRedoPoints: [] })),

  undoPendingPoint: () => {
    const { pendingPoints } = get();
    if (!pendingPoints.length) return;
    const last = pendingPoints[pendingPoints.length - 1];
    set(s => ({
      pendingPoints: s.pendingPoints.slice(0, -1),
      pendingRedoPoints: [...s.pendingRedoPoints, last],
    }));
  },

  redoPendingPoint: () => {
    const { pendingRedoPoints } = get();
    if (!pendingRedoPoints.length) return;
    const last = pendingRedoPoints[pendingRedoPoints.length - 1];
    set(s => ({
      pendingRedoPoints: s.pendingRedoPoints.slice(0, -1),
      pendingPoints: [...s.pendingPoints, last],
    }));
  },


  commitPolygon: () => {
    const { pendingPoints, activeLayerId, layers, past } = get();
    if (pendingPoints.length < 3) { set({ pendingPoints: [], pendingRedoPoints: [] }); return; }

    const allPolyPoints = layers.flatMap(l => l.polygons.map(p => p.points));
    const lastPoint = pendingPoints[pendingPoints.length - 1];
    const firstPoint = pendingPoints[0];
    
    let routedPath: Point[] | null = null;
    for (const poly of allPolyPoints) {
      const path = routeAlongPolygon(lastPoint, firstPoint, poly);
      if (path) {
        routedPath = path;
        break;
      }
    }
    
    const finalPoints = routedPath && routedPath.length > 0 
      ? [...pendingPoints, ...routedPath]
      : [...pendingPoints];

    const id = `poly_${++_polyId}`;
    const c = centroid(finalPoints);
    const polygon: TracerPolygon = { id, points: finalPoints, label: '', labelX: c.x, labelY: c.y };
    set({
      past: [...past, cloneLayers(layers)],
      future: [],
      layers: layers.map(l => l.id === activeLayerId ? { ...l, polygons: [...l.polygons, polygon] } : l),
      pendingPoints: [],
      pendingRedoPoints: [],
    });
  },

  cancelDrawing: () => set({ pendingPoints: [], pendingRedoPoints: [] }),

  // ── Polygons ──────────────────────────────────────────────────────────────────

  deletePolygon: (layerId, polygonId) => {
    const { layers, past } = get();
    set({
      past: [...past, cloneLayers(layers)],
      future: [],
      layers: layers.map(l => l.id === layerId ? { ...l, polygons: l.polygons.filter(p => p.id !== polygonId) } : l),
      selectedPolygonId: null,
      selectedLayerId: null,
    });
  },

  selectPolygon: (selectedLayerId, selectedPolygonId) => set({ selectedLayerId, selectedPolygonId }),

  setPolygonLabel: (layerId, polygonId, label) =>
    set(s => ({
      layers: s.layers.map(l =>
        l.id === layerId
          ? { ...l, polygons: l.polygons.map(p => (p.id === polygonId ? { ...p, label } : p)) }
          : l,
      ),
    })),

  setPolygonLabelPosition: (layerId, polygonId, x, y) =>
    set(s => ({
      layers: s.layers.map(l =>
        l.id === layerId
          ? { ...l, polygons: l.polygons.map(p => (p.id === polygonId ? { ...p, labelX: x, labelY: y } : p)) }
          : l,
      ),
    })),

  // ── Mode / History ───────────────────────────────────────────────────────────
  setMode: (mode) =>
    set({ mode, pendingPoints: [], pendingRedoPoints: [], selectedPolygonId: null, selectedLayerId: null }),

  undo: () => {
    const { past, layers, future } = get();
    if (!past.length) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    
    // Check if the only difference is exactly one added polygon (i.e. a commit action)
    let addedPolygon: TracerPolygon | null = null;
    let addedLayerId: string | null = null;
    
    for (const currLayer of layers) {
      const prevLayer = previous.find(l => l.id === currLayer.id);
      if (prevLayer && currLayer.polygons.length === prevLayer.polygons.length + 1) {
        addedPolygon = currLayer.polygons[currLayer.polygons.length - 1];
        addedLayerId = currLayer.id;
        break;
      }
    }
    
    if (addedPolygon) {
      const points = [...addedPolygon.points];
      const lastPoint = points.pop();
      set({
        past: newPast,
        future: [], // Clear future as we are branching off history
        layers: cloneLayers(previous),
        selectedPolygonId: null,
        pendingPoints: points,
        pendingRedoPoints: lastPoint ? [lastPoint] : [],
        mode: 'polygon',
        activeLayerId: addedLayerId!
      });
      return;
    }

    set({
      layers: previous, // It's already a clone in past
      past: newPast,
      future: [cloneLayers(layers), ...future],
      pendingPoints: [],
      pendingRedoPoints: [],
    });
  },

  redo: () => {
    const { past, layers, future } = get();
    if (!future.length) return;
    set({ layers: future[0], past: [...past, cloneLayers(layers)], future: future.slice(1), pendingPoints: [], pendingRedoPoints: [] });
  },

  reset: () => {
    set({
      backgroundImage: null,
      imageLoading: false,
      layers: cloneLayers(DEFAULT_LAYERS),
      activeLayerId: 'cs',
      mode: 'select',
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedPolygonId: null,
      selectedLayerId: null,
      past: [],
      future: [],
    });
    _polyId = 0;
    _layerCount = 0;
  },
}));

export { useShallow };
