import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';

export type Point = { x: number; y: number };

export type TracerPolygon = {
  id: string;
  points: Point[];
  /** Legacy fields kept optional so existing in-memory drawings remain readable. */
  label?: string;
  labelX?: number;
  labelY?: number;
};

export type TracerLabel = {
  id: string;
  text: string;
  x: number;
  y: number;
};

export type TracerLayer = {
  id: string;
  name: string;
  color: string;
  lineWidth: number;
  visible: boolean;
  /** Open boundary paths. The field name is retained for backwards compatibility. */
  polygons: TracerPolygon[];
  labels: TracerLabel[];
};

export type TracerMode = 'select' | 'polygon' | 'label';

function cloneLayers(layers: TracerLayer[]): TracerLayer[] {
  return layers.map(layer => ({
    ...layer,
    polygons: layer.polygons.map(path => ({
      ...path,
      points: path.points.map(point => ({ ...point })),
    })),
    labels: layer.labels.map(label => ({ ...label })),
  }));
}

const MAX_HISTORY_ENTRIES = 100;

function appendHistory(
  history: TracerLayer[][],
  layers: TracerLayer[],
): TracerLayer[][] {
  return [...history.slice(-(MAX_HISTORY_ENTRIES - 1)), layers];
}

/** Average point, retained for consumers that still need a path center. */
export function centroid(points: Point[]): Point {
  if (!points.length) return { x: 0, y: 0 };

  const sum = points.reduce(
    (result, point) => ({
      x: result.x + point.x,
      y: result.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return { x: sum.x / points.length, y: sum.y / points.length };
}

const DEFAULT_LAYERS: TracerLayer[] = [
  {
    id: 'cs',
    name: 'C.S ম্যাপ',
    color: '#DC2626',
    lineWidth: 3,
    visible: true,
    polygons: [],
    labels: [],
  },
  {
    id: 'bs',
    name: 'B.S ম্যাপ',
    color: '#16A34A',
    lineWidth: 3,
    visible: true,
    polygons: [],
    labels: [],
  },
];

const EXTRA_COLORS = ['#2563EB', '#D97706', '#7C3AED', '#0891B2', '#BE185D'];
let pathId = 0;
let labelId = 0;
let layerCount = 0;

export interface TracerStore {
  backgroundImage: HTMLImageElement | null;
  imageLoading: boolean;

  layers: TracerLayer[];
  activeLayerId: string;
  mode: TracerMode;
  pendingPoints: Point[];
  pendingRedoPoints: Point[];

  selectedPolygonId: string | null;
  selectedLabelId: string | null;
  selectedLayerId: string | null;

  past: TracerLayer[][];
  future: TracerLayer[][];

  setBackground(img: HTMLImageElement | null): void;
  setImageLoading(value: boolean): void;

  addLayer(): void;
  removeLayer(id: string): void;
  setActiveLayer(id: string): void;
  toggleLayerVisibility(id: string): void;
  setLayerColor(id: string, color: string): void;
  setLayerLineWidth(id: string, width: number): void;
  renameLayer(id: string, name: string): void;

  addPendingPoints(points: Point[]): void;
  undoPendingPoint(): void;
  redoPendingPoint(): void;
  commitPolygon(): void;
  cancelDrawing(): void;

  deletePolygon(layerId: string, polygonId: string): void;
  selectPolygon(layerId: string | null, polygonId: string | null): void;

  addLabel(x: number, y: number): string;
  deleteLabel(layerId: string, labelId: string): void;
  selectLabel(layerId: string | null, labelId: string | null): void;
  setLabelText(layerId: string, labelId: string, text: string): void;
  setLabelPosition(layerId: string, labelId: string, x: number, y: number): void;

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
  selectedLabelId: null,
  selectedLayerId: null,

  past: [],
  future: [],

  setBackground: backgroundImage => set({ backgroundImage }),
  setImageLoading: imageLoading => set({ imageLoading }),

  addLayer: () => {
    layerCount += 1;
    const newLayer: TracerLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layerCount}`,
      color: EXTRA_COLORS[(layerCount - 1) % EXTRA_COLORS.length],
      lineWidth: 3,
      visible: true,
      polygons: [],
      labels: [],
    };

    set(state => ({
      layers: [...state.layers, newLayer],
      activeLayerId: newLayer.id,
      pendingPoints: [],
      pendingRedoPoints: [],
    }));
  },

  removeLayer: id =>
    set(state => {
      const layers = state.layers.filter(layer => layer.id !== id);
      return {
        layers,
        activeLayerId:
          state.activeLayerId === id ? (layers[0]?.id ?? 'cs') : state.activeLayerId,
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        selectedPolygonId: state.selectedLayerId === id ? null : state.selectedPolygonId,
        selectedLabelId: state.selectedLayerId === id ? null : state.selectedLabelId,
      };
    }),

  setActiveLayer: id =>
    set({
      activeLayerId: id,
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedLayerId: null,
      selectedPolygonId: null,
      selectedLabelId: null,
    }),

  toggleLayerVisibility: id =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer,
      ),
    })),

  setLayerColor: (id, color) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id ? { ...layer, color } : layer,
      ),
    })),

  setLayerLineWidth: (id, lineWidth) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id ? { ...layer, lineWidth } : layer,
      ),
    })),

  renameLayer: (id, name) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id ? { ...layer, name } : layer,
      ),
    })),

  addPendingPoints: points =>
    set(state => ({
      pendingPoints: [...state.pendingPoints, ...points],
      pendingRedoPoints: [],
    })),

  undoPendingPoint: () => {
    const { pendingPoints } = get();
    if (!pendingPoints.length) return;

    const lastPoint = pendingPoints[pendingPoints.length - 1];
    set(state => ({
      pendingPoints: state.pendingPoints.slice(0, -1),
      pendingRedoPoints: [...state.pendingRedoPoints, lastPoint],
    }));
  },

  redoPendingPoint: () => {
    const { pendingRedoPoints } = get();
    if (!pendingRedoPoints.length) return;

    const lastPoint = pendingRedoPoints[pendingRedoPoints.length - 1];
    set(state => ({
      pendingRedoPoints: state.pendingRedoPoints.slice(0, -1),
      pendingPoints: [...state.pendingPoints, lastPoint],
    }));
  },

  commitPolygon: () => {
    const { pendingPoints, activeLayerId, layers, past } = get();

    if (pendingPoints.length < 2) return;

    const boundaryPath: TracerPolygon = {
      id: `path_${++pathId}`,
      points: pendingPoints.map(point => ({ ...point })),
    };

    set({
      past: appendHistory(past, layers),
      future: [],
      layers: layers.map(layer =>
        layer.id === activeLayerId
          ? { ...layer, polygons: [...layer.polygons, boundaryPath] }
          : layer,
      ),
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedLayerId: activeLayerId,
      selectedPolygonId: boundaryPath.id,
      selectedLabelId: null,
    });
  },

  cancelDrawing: () => set({ pendingPoints: [], pendingRedoPoints: [] }),

  deletePolygon: (layerId, polygonId) => {
    const { layers, past } = get();

    set({
      past: appendHistory(past, layers),
      future: [],
      layers: layers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              polygons: layer.polygons.filter(path => path.id !== polygonId),
            }
          : layer,
      ),
      selectedPolygonId: null,
      selectedLabelId: null,
      selectedLayerId: null,
    });
  },

  selectPolygon: (selectedLayerId, selectedPolygonId) =>
    set({
      selectedLayerId,
      selectedPolygonId,
      selectedLabelId: null,
    }),

  addLabel: (x, y) => {
    const { activeLayerId, layers, past } = get();
    const id = `label_${++labelId}`;
    const label: TracerLabel = { id, text: '', x, y };

    set({
      past: appendHistory(past, layers),
      future: [],
      layers: layers.map(layer =>
        layer.id === activeLayerId
          ? { ...layer, labels: [...layer.labels, label] }
          : layer,
      ),
      selectedLayerId: activeLayerId,
      selectedPolygonId: null,
      selectedLabelId: id,
    });

    return id;
  },

  deleteLabel: (layerId, id) => {
    const { layers, past } = get();

    set({
      past: appendHistory(past, layers),
      future: [],
      layers: layers.map(layer =>
        layer.id === layerId
          ? { ...layer, labels: layer.labels.filter(label => label.id !== id) }
          : layer,
      ),
      selectedPolygonId: null,
      selectedLabelId: null,
      selectedLayerId: null,
    });
  },

  selectLabel: (selectedLayerId, selectedLabelId) =>
    set({
      selectedLayerId,
      selectedLabelId,
      selectedPolygonId: null,
    }),

  setLabelText: (layerId, id, text) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              labels: layer.labels.map(label =>
                label.id === id ? { ...label, text } : label,
              ),
            }
          : layer,
      ),
    })),

  setLabelPosition: (layerId, id, x, y) =>
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === layerId
          ? {
              ...layer,
              labels: layer.labels.map(label =>
                label.id === id ? { ...label, x, y } : label,
              ),
            }
          : layer,
      ),
    })),

  setMode: mode =>
    set({
      mode,
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedPolygonId: null,
      selectedLabelId: null,
      selectedLayerId: null,
    }),

  undo: () => {
    const { past, layers, future } = get();
    if (!past.length) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    let addedPath: TracerPolygon | null = null;
    let addedLayerId: string | null = null;

    for (const currentLayer of layers) {
      const previousLayer = previous.find(layer => layer.id === currentLayer.id);
      if (
        previousLayer &&
        currentLayer.polygons.length === previousLayer.polygons.length + 1 &&
        currentLayer.labels.length === previousLayer.labels.length
      ) {
        addedPath = currentLayer.polygons[currentLayer.polygons.length - 1];
        addedLayerId = currentLayer.id;
        break;
      }
    }

    if (addedPath && addedLayerId) {
      const points = addedPath.points.map(point => ({ ...point }));
      const lastPoint = points.pop();

      set({
        past: newPast,
        future: [],
        layers: previous,
        selectedPolygonId: null,
        selectedLabelId: null,
        selectedLayerId: null,
        pendingPoints: points,
        pendingRedoPoints: lastPoint ? [lastPoint] : [],
        mode: 'polygon',
        activeLayerId: addedLayerId,
      });
      return;
    }

    set({
      layers: previous,
      past: newPast,
      future: [layers, ...future].slice(0, MAX_HISTORY_ENTRIES),
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedPolygonId: null,
      selectedLabelId: null,
      selectedLayerId: null,
    });
  },

  redo: () => {
    const { past, layers, future } = get();
    if (!future.length) return;

    set({
      layers: future[0],
      past: appendHistory(past, layers),
      future: future.slice(1),
      pendingPoints: [],
      pendingRedoPoints: [],
      selectedPolygonId: null,
      selectedLabelId: null,
      selectedLayerId: null,
    });
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
      selectedLabelId: null,
      selectedLayerId: null,
      past: [],
      future: [],
    });

    pathId = 0;
    labelId = 0;
    layerCount = 0;
  },
}));

export { useShallow };

