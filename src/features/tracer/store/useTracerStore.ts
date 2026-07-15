import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

export type Point = { x: number; y: number };

export type TracerPolygon = {
  id: string;
  points: Point[];
  label: string;
};

export type TracerLayer = {
  id: string;
  name: string;
  color: string;
  lineWidth: number;
  visible: boolean;
  polygons: TracerPolygon[];
};

export type TracerMode = 'select' | 'polygon' | 'pan';

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
  { id: 'cs', name: 'C.S ম্যাপ', color: '#DC2626', lineWidth: 2, visible: true, polygons: [] },
  { id: 'bs', name: 'B.S ম্যাপ', color: '#16A34A', lineWidth: 2, visible: true, polygons: [] },
];

const EXTRA_COLORS = ['#2563EB', '#D97706', '#7C3AED', '#0891B2', '#BE185D'];
let _polyId = 0;
let _layerCount = 0;

export interface TracerStore {
  // Background
  backgroundImage: HTMLImageElement | null;
  backgroundOpacity: number;

  // Layers & drawing
  layers: TracerLayer[];
  activeLayerId: string;
  mode: TracerMode;
  pendingPoints: Point[];
  hoverPoint: Point | null;

  // Selection
  selectedPolygonId: string | null;
  selectedLayerId: string | null;

  // Label prompt (shown after polygon commit)
  pendingLabelId: string | null;
  pendingLabelLayerId: string | null;

  // Undo / redo
  past: TracerLayer[][];
  future: TracerLayer[][];

  // ── Actions ──
  setBackground(img: HTMLImageElement | null): void;
  setBackgroundOpacity(v: number): void;

  addLayer(): void;
  removeLayer(id: string): void;
  setActiveLayer(id: string): void;
  toggleLayerVisibility(id: string): void;
  setLayerColor(id: string, color: string): void;
  setLayerLineWidth(id: string, w: number): void;
  renameLayer(id: string, name: string): void;

  addPendingPoint(p: Point): void;
  setHoverPoint(p: Point | null): void;
  commitPolygon(): void;
  cancelDrawing(): void;

  setPolygonLabel(layerId: string, polygonId: string, label: string): void;
  clearPendingLabel(): void;
  deletePolygon(layerId: string, polygonId: string): void;
  selectPolygon(layerId: string | null, polygonId: string | null): void;

  setMode(mode: TracerMode): void;
  undo(): void;
  redo(): void;
  reset(): void;
}

export const useTracerStore = create<TracerStore>()((set, get) => ({
  backgroundImage: null,
  backgroundOpacity: 0.65,

  layers: cloneLayers(DEFAULT_LAYERS),
  activeLayerId: 'cs',

  mode: 'pan',
  pendingPoints: [],
  hoverPoint: null,

  selectedPolygonId: null,
  selectedLayerId: null,

  pendingLabelId: null,
  pendingLabelLayerId: null,

  past: [],
  future: [],

  // ── Background ──────────────────────────────────────────────────────────────
  setBackground: (backgroundImage) => set({ backgroundImage }),
  setBackgroundOpacity: (backgroundOpacity) => set({ backgroundOpacity }),

  // ── Layer management ─────────────────────────────────────────────────────────
  addLayer: () => {
    _layerCount++;
    const newLayer: TracerLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${_layerCount}`,
      color: EXTRA_COLORS[(_layerCount - 1) % EXTRA_COLORS.length],
      lineWidth: 2,
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

  setActiveLayer: (id) => set({ activeLayerId: id, pendingPoints: [], hoverPoint: null }),
  toggleLayerVisibility: (id) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l) })),
  setLayerColor: (id, color) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, color } : l) })),
  setLayerLineWidth: (id, lineWidth) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, lineWidth } : l) })),
  renameLayer: (id, name) => set(s => ({ layers: s.layers.map(l => l.id === id ? { ...l, name } : l) })),

  // ── Drawing ──────────────────────────────────────────────────────────────────
  addPendingPoint: (p) => set(s => ({ pendingPoints: [...s.pendingPoints, p] })),
  setHoverPoint: (hoverPoint) => set({ hoverPoint }),

  commitPolygon: () => {
    const { pendingPoints, activeLayerId, layers, past } = get();
    if (pendingPoints.length < 3) { set({ pendingPoints: [], hoverPoint: null }); return; }
    const id = `poly_${++_polyId}`;
    const polygon: TracerPolygon = { id, points: [...pendingPoints], label: '' };
    set({
      past: [...past, cloneLayers(layers)],
      future: [],
      layers: layers.map(l => l.id === activeLayerId ? { ...l, polygons: [...l.polygons, polygon] } : l),
      pendingPoints: [],
      hoverPoint: null,
      pendingLabelId: id,
      pendingLabelLayerId: activeLayerId,
    });
  },

  cancelDrawing: () => set({ pendingPoints: [], hoverPoint: null }),

  // ── Labels / Polygons ────────────────────────────────────────────────────────
  setPolygonLabel: (layerId, polygonId, label) =>
    set(s => ({
      layers: s.layers.map(l =>
        l.id === layerId
          ? { ...l, polygons: l.polygons.map(p => p.id === polygonId ? { ...p, label } : p) }
          : l,
      ),
    })),

  clearPendingLabel: () => set({ pendingLabelId: null, pendingLabelLayerId: null }),

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

  // ── Mode / History ───────────────────────────────────────────────────────────
  setMode: (mode) => set({ mode, pendingPoints: [], hoverPoint: null, selectedPolygonId: null, selectedLayerId: null }),

  undo: () => {
    const { past, layers, future } = get();
    if (!past.length) return;
    set({
      layers: past[past.length - 1],
      past: past.slice(0, -1),
      future: [cloneLayers(layers), ...future],
      pendingPoints: [],
      hoverPoint: null,
      pendingLabelId: null,
      pendingLabelLayerId: null,
    });
  },

  redo: () => {
    const { past, layers, future } = get();
    if (!future.length) return;
    set({ layers: future[0], past: [...past, cloneLayers(layers)], future: future.slice(1) });
  },

  reset: () => {
    set({
      backgroundImage: null,
      backgroundOpacity: 0.65,
      layers: cloneLayers(DEFAULT_LAYERS),
      activeLayerId: 'cs',
      mode: 'pan',
      pendingPoints: [],
      hoverPoint: null,
      selectedPolygonId: null,
      selectedLayerId: null,
      pendingLabelId: null,
      pendingLabelLayerId: null,
      past: [],
      future: [],
    });
    _polyId = 0;
    _layerCount = 0;
  },
}));

export { useShallow };
