'use client';

import { create } from 'zustand';
import type Konva from 'konva';
import type { MatchPoint } from '../types';
import { keepBlackOnly } from '../utils/bgRemover';
import { colorizeImage } from '../utils/colorizeImage';
import { SuccessToast, ErrorToast } from '@/lib/utils';

type CanvasBg = 'auto' | 'grid' | 'white' | 'yellow' | 'dark';

export interface PantagraphState {
  // Images
  formerMap: HTMLImageElement | null;
  currentMap: HTMLImageElement | null;
  formerMapName: string | null;
  currentMapName: string | null;
  formerMapOriginal: HTMLImageElement | null;
  currentMapOriginal: HTMLImageElement | null;
  formerBgRemoved: boolean;
  currentBgRemoved: boolean;
  formerBgColor: string;
  currentBgColor: string;
  /** Clean (non-colorized) version — used to re-apply line color */
  formerMapClean: HTMLImageElement | null;
  currentMapClean: HTMLImageElement | null;
  activeMap: 'former' | 'current';
  canvasBg: CanvasBg;

  // Stage
  stageScale: number;
  stagePos: { x: number; y: number };

  // Former map transform (current = baseline)
  formerRotation: number;
  formerPosition: { x: number; y: number };

  // Current map transform
  currentRotation: number;
  currentPosition: { x: number; y: number };

  // Interaction mode
  isLocked: boolean;
  isAligning: boolean;

  // Match points
  matchPoints: MatchPoint[];

  // Alignment result
  alignmentResult: Record<string, number> | null;
  alignmentType: 'similarity' | 'affine' | null;

  // Affine former image transform props (applied after alignment)
  formerScaleX: number;
  formerScaleY: number;
  formerSkewX: number;
  formerSkewY: number;

  // Color pick mode
  isPickingColor: boolean;
  pickingTarget: 'former' | 'current' | null;

  // Line colorization (replace dark pixels with chosen color)
  formerLineColor: string;
  currentLineColor: string;
  lineColorizeThreshold: number;

  // Line smoothing after BG removal (0 = none, 5 = max)
  lineSmoothing: number;

  // Automatic black-line detection sensitivity (0 = darkest only, 100 = faint lines)
  formerBlackSensitivity: number;
  currentBlackSensitivity: number;

  // BG removal tolerance (0-255, how wide a color range to remove)
  formerBgTolerance: number;
  currentBgTolerance: number;

  // Opacity (0-1)
  formerOpacity: number;
  currentOpacity: number;

  // BG removal loading
  isRemovingFormerBg: boolean;
  isRemovingCurrentBg: boolean;

  // General loading (map processing etc)
  imageLoading: boolean;

  // Redo stack
  redoStack: MatchPoint[];

  // PDF export
  stageRef: Konva.Stage | null;
}

type AlignmentParams =
  | { type: 'similarity'; tx: number; ty: number; rotation: number; scale: number }
  | { type: 'affine'; a: number; b: number; c: number; d: number; tx: number; ty: number };

export interface PantagraphActions {
  // Image actions
  setFormerMap: (img: HTMLImageElement | null, name?: string | null) => void;
  setCurrentMap: (img: HTMLImageElement | null, name?: string | null) => void;
  setFormerMapName: (name: string | null) => void;
  setCurrentMapName: (name: string | null) => void;
  applyCroppedMap: (
    target: 'former' | 'current',
    img: HTMLImageElement,
    crop: { x: number; y: number; width: number; height: number },
  ) => void;
  setActiveMap: (map: 'former' | 'current') => void;
  setCanvasBg: (bg: CanvasBg) => void;
  toggleFormerBgRemoval: () => Promise<void>;
  toggleCurrentBgRemoval: () => Promise<void>;
  setFormerBgColor: (color: string) => void;
  setCurrentBgColor: (color: string) => void;
  setImageLoading: (loading: boolean) => void;
  // Line colorization
  setFormerLineColor: (color: string) => void;
  setCurrentLineColor: (color: string) => void;
  setLineColorizeThreshold: (threshold: number) => void;

  setFormerBgTolerance: (tolerance: number) => void;
  setCurrentBgTolerance: (tolerance: number) => void;
  setLineSmoothing: (smoothing: number) => void;
  setFormerBlackSensitivity: (sensitivity: number) => void;
  setCurrentBlackSensitivity: (sensitivity: number) => void;
  setFormerOpacity: (opacity: number) => void;
  setCurrentOpacity: (opacity: number) => void;

  // Stage actions
  setStageScale: (scale: number | ((prev: number) => number)) => void;
  setStagePos: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setStageViewport: (scale: number, pos: { x: number; y: number }) => void;

  // Former transform
  setFormerRotation: (rotation: number) => void;
  setFormerPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Current transform
  setCurrentRotation: (rotation: number) => void;
  setCurrentPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Mode actions
  setIsLocked: (locked: boolean) => void;
  setIsAligning: (aligning: boolean) => void;

  // Match points
  setMatchPoints: (points: MatchPoint[] | ((prev: MatchPoint[]) => MatchPoint[])) => void;
  addMatchPoint: (point: MatchPoint) => void;
  removeMatchPoint: (id: string) => void;
  removeLastMatchPoint: () => void;
  restoreLastMatchPoint: () => void;
  updateMatchPoint: (id: string, updates: Partial<Pick<MatchPoint, 'former' | 'current'>>) => void;

  // Alignment
  applyAlignment: (result: AlignmentParams) => void;
  clearAlignment: () => void;

  // Color pick
  startColorPick: (target: 'former' | 'current') => void;
  cancelColorPick: () => void;

  // Reset
  reset: () => void;

  // PDF/PNG export
  setStageRef: (ref: Konva.Stage | null) => void;
  exportMap: (format: 'pdf' | 'png') => Promise<void>;
}

export type PantagraphStore = PantagraphState & PantagraphActions;

const initialState: PantagraphState = {
  formerMap: null,
  currentMap: null,
  formerMapName: null,
  currentMapName: null,
  formerMapOriginal: null,
  currentMapOriginal: null,
  formerBgRemoved: false,
  currentBgRemoved: false,
  formerBgColor: '#ffffff',
  currentBgColor: '#ffffff',

  formerMapClean: null,
  currentMapClean: null,

  formerLineColor: '#DC2626',
  currentLineColor: '#16A34A',
  lineColorizeThreshold: 200,

  lineSmoothing: 2,

  formerBlackSensitivity: 75,
  currentBlackSensitivity: 75,

  formerBgTolerance: 60,
  currentBgTolerance: 60,
  formerOpacity: 1,
  currentOpacity: 1,
  activeMap: 'former',
  canvasBg: 'auto',

  stageScale: 1,
  stagePos: { x: 0, y: 0 },

  formerRotation: 0,
  formerPosition: { x: 0, y: 0 },

  currentRotation: 0,
  currentPosition: { x: 0, y: 0 },

  isLocked: false,
  isAligning: false,

  matchPoints: [],

  alignmentResult: null,
  alignmentType: null,

  formerScaleX: 1,
  formerScaleY: 1,
  formerSkewX: 0,
  formerSkewY: 0,

  isPickingColor: false,
  pickingTarget: null,

  isRemovingFormerBg: false,
  isRemovingCurrentBg: false,

  imageLoading: false,

  redoStack: [],
  
  stageRef: null,
};

/** Helper: apply line colorization on top of a clean (bg-removed) map. */
async function applyLineToCleanMap(
  cleanMap: HTMLImageElement | null,
  lineColor: string,
  threshold: number,
): Promise<HTMLImageElement | null> {
  if (!cleanMap) return null;
  if (lineColor === '#000000') return cleanMap;
  try {
    return await colorizeImage(cleanMap, lineColor, threshold);
  } catch {
    return cleanMap;
  }
}

type MapTarget = 'former' | 'current';

type ProcessingController = {
  version: number;
  timer: ReturnType<typeof setTimeout> | null;
  running: boolean;
  queued: boolean;
};

const SLIDER_DEBOUNCE_MS = 300;
const processingControllers: Record<MapTarget, ProcessingController> = {
  former: { version: 0, timer: null, running: false, queued: false },
  current: { version: 0, timer: null, running: false, queued: false },
};
const MAX_EXPORT_DIMENSION = 4096;
const MAX_EXPORT_PIXELS = 10_000_000;
let exportInProgress = false;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode export'));
    }, type, quality);
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const usePantagraphStore = create<PantagraphStore>()((set, get) => {
  const setProcessingState = (target: MapTarget, loading: boolean) => {
    set(target === 'former'
      ? { isRemovingFormerBg: loading }
      : { isRemovingCurrentBg: loading });
  };

  const drainProcessingQueue = async (target: MapTarget): Promise<void> => {
    const controller = processingControllers[target];
    if (controller.running) return;
    controller.running = true;

    try {
      while (controller.queued) {
        controller.queued = false;
        const requestedVersion = controller.version;
        const state = get();
        const original = target === 'former'
          ? state.formerMapOriginal
          : state.currentMapOriginal;

        if (!original) {
          if (requestedVersion === controller.version) setProcessingState(target, false);
          continue;
        }

        const bgRemoved = target === 'former'
          ? state.formerBgRemoved
          : state.currentBgRemoved;
        const lineColor = target === 'former' ? '#DC2626' : '#16A34A';
        const blackSensitivity = target === 'former'
          ? state.formerBlackSensitivity
          : state.currentBlackSensitivity;

        setProcessingState(target, true);
        try {
          const cleanMap = bgRemoved
            ? await keepBlackOnly(
                original,
                state.lineSmoothing,
                blackSensitivity,
              )
            : original;
          const finalMap = bgRemoved
            ? await applyLineToCleanMap(
                cleanMap,
                lineColor,
                state.lineColorizeThreshold,
              )
            : original;

          if (requestedVersion !== controller.version) continue;
          set(target === 'former'
            ? {
                formerMapClean: cleanMap,
                formerMap: finalMap ?? cleanMap,
                isRemovingFormerBg: false,
              }
            : {
                currentMapClean: cleanMap,
                currentMap: finalMap ?? cleanMap,
                isRemovingCurrentBg: false,
              });
        } catch (error) {
          console.error(`Map processing failed (${target}):`, error);
          if (requestedVersion === controller.version) setProcessingState(target, false);
        }
      }
    } finally {
      controller.running = false;
    }
  };

  const scheduleMapProcessing = (
    target: MapTarget,
    delay = SLIDER_DEBOUNCE_MS,
  ): void => {
    const controller = processingControllers[target];
    controller.version++;
    if (controller.timer) clearTimeout(controller.timer);
    controller.timer = setTimeout(() => {
      controller.timer = null;
      controller.queued = true;
      void drainProcessingQueue(target);
    }, delay);
  };

  const invalidateMapProcessing = (target: MapTarget): void => {
    const controller = processingControllers[target];
    controller.version++;
    controller.queued = false;
    if (controller.timer) clearTimeout(controller.timer);
    controller.timer = null;
  };

  return {
    ...initialState,

  setFormerMap: (formerMap, name) => {
    invalidateMapProcessing('former');
    set((state) => ({
      formerMap,
      formerMapOriginal: formerMap,
      formerMapClean: formerMap,
      formerMapName: formerMap ? (name !== undefined ? name : state.formerMapName) : null,
      formerBgRemoved: false,
      isRemovingFormerBg: false,
    }));
  },
  setCurrentMap: (currentMap, name) => {
    invalidateMapProcessing('current');
    set((state) => ({
      currentMap,
      currentMapOriginal: currentMap,
      currentMapClean: currentMap,
      currentMapName: currentMap ? (name !== undefined ? name : state.currentMapName) : null,
      currentBgRemoved: false,
      isRemovingCurrentBg: false,
    }));
  },
  setFormerMapName: (formerMapName) => set({ formerMapName }),
  setCurrentMapName: (currentMapName) => set({ currentMapName }),
  applyCroppedMap: (target, img, crop) => {
    invalidateMapProcessing(target);
    set((state) => {
      const rad = ((target === 'former' ? state.formerRotation : state.currentRotation) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const scaleX = target === 'former' ? state.formerScaleX : 1;
      const scaleY = target === 'former' ? state.formerScaleY : 1;
      const skewX = target === 'former' ? state.formerSkewX : 0;
      const skewY = target === 'former' ? state.formerSkewY : 0;
      const transformedX = scaleX * crop.x + skewX * crop.y;
      const transformedY = skewY * crop.x + scaleY * crop.y;
      const offset = {
        x: transformedX * cos - transformedY * sin,
        y: transformedX * sin + transformedY * cos,
      };
      const adjustPoint = (point: { x: number; y: number } | null) => {
        if (!point) return null;
        if (
          point.x < crop.x || point.y < crop.y ||
          point.x > crop.x + crop.width || point.y > crop.y + crop.height
        ) return null;
        return { x: point.x - crop.x, y: point.y - crop.y };
      };
      const matchPoints = state.matchPoints.flatMap((point) => {
        if (target === 'former') {
          const former = adjustPoint(point.former);
          return former ? [{ ...point, former }] : [];
        }
        const current = adjustPoint(point.current);
        return current ? [{ ...point, current }] : [];
      });

      if (target === 'former') {
        return {
          formerMap: img,
          formerMapOriginal: img,
          formerMapClean: img,
          formerBgRemoved: false,
          isRemovingFormerBg: false,
          formerPosition: {
            x: state.formerPosition.x + offset.x,
            y: state.formerPosition.y + offset.y,
          },
          matchPoints,
          redoStack: [],
        };
      }

      return {
        currentMap: img,
        currentMapOriginal: img,
        currentMapClean: img,
        currentBgRemoved: false,
        isRemovingCurrentBg: false,
        currentPosition: {
          x: state.currentPosition.x + offset.x,
          y: state.currentPosition.y + offset.y,
        },
        matchPoints,
        redoStack: [],
      };
    });
  },
  setActiveMap: (activeMap) => set({ activeMap }),
  setCanvasBg: (canvasBg) => set({ canvasBg }),
  setImageLoading: (imageLoading) => set({ imageLoading }),

  setFormerBgColor: (formerBgColor) => {
    set({ formerBgColor });
    if (get().formerBgRemoved) scheduleMapProcessing('former');
  },
  setCurrentBgColor: (currentBgColor) => {
    set({ currentBgColor });
    if (get().currentBgRemoved) scheduleMapProcessing('current');
  },

  setFormerLineColor: (formerLineColor) => {
    set({ formerLineColor });
    scheduleMapProcessing('former', 0);
  },
  setCurrentLineColor: (currentLineColor) => {
    set({ currentLineColor });
    scheduleMapProcessing('current', 0);
  },
  setLineColorizeThreshold: (lineColorizeThreshold) => {
    set({ lineColorizeThreshold });
    if (get().formerMapOriginal) scheduleMapProcessing('former');
    if (get().currentMapOriginal) scheduleMapProcessing('current');
  },

  setFormerBgTolerance: (formerBgTolerance) => {
    set({ formerBgTolerance });
    if (get().formerBgRemoved) scheduleMapProcessing('former');
  },
  setCurrentBgTolerance: (currentBgTolerance) => {
    set({ currentBgTolerance });
    if (get().currentBgRemoved) scheduleMapProcessing('current');
  },

  setLineSmoothing: (lineSmoothing) => {
    set({ lineSmoothing });
    if (get().formerBgRemoved) scheduleMapProcessing('former');
    if (get().currentBgRemoved) scheduleMapProcessing('current');
  },

  setFormerBlackSensitivity: (sensitivity) => {
    const formerBlackSensitivity = Math.max(0, Math.min(100, sensitivity));
    set({ formerBlackSensitivity });
    if (get().formerBgRemoved) scheduleMapProcessing('former');
  },
  setCurrentBlackSensitivity: (sensitivity) => {
    const currentBlackSensitivity = Math.max(0, Math.min(100, sensitivity));
    set({ currentBlackSensitivity });
    if (get().currentBgRemoved) scheduleMapProcessing('current');
  },

  setFormerOpacity: (formerOpacity) => set({ formerOpacity }),
  setCurrentOpacity: (currentOpacity) => set({ currentOpacity }),

  toggleFormerBgRemoval: async () => {
    const { formerMapOriginal, formerBgRemoved } = get();
    if (!formerMapOriginal) return;
    set({
      formerBgRemoved: !formerBgRemoved,
      formerLineColor: '#DC2626',
    });
    scheduleMapProcessing('former', 0);
  },

  toggleCurrentBgRemoval: async () => {
    const { currentMapOriginal, currentBgRemoved } = get();
    if (!currentMapOriginal) return;
    set({
      currentBgRemoved: !currentBgRemoved,
      currentLineColor: '#16A34A',
    });
    scheduleMapProcessing('current', 0);
  },

  setStageScale: (scale) =>
    set((state) => ({
      stageScale: typeof scale === 'function' ? scale(state.stageScale) : scale,
    })),
  setStagePos: (pos) =>
    set((state) => ({
      stagePos: typeof pos === 'function' ? pos(state.stagePos) : pos,
    })),
  setStageViewport: (stageScale, stagePos) => set({ stageScale, stagePos }),

  setFormerRotation: (formerRotation) => set({ formerRotation }),
  setFormerPosition: (pos) =>
    set((state) => ({
      formerPosition: typeof pos === 'function' ? pos(state.formerPosition) : pos,
    })),

  setCurrentRotation: (currentRotation) => set({ currentRotation }),
  setCurrentPosition: (pos) =>
    set((state) => ({
      currentPosition: typeof pos === 'function' ? pos(state.currentPosition) : pos,
    })),

  setIsLocked: (isLocked) => set({ isLocked }),
  setIsAligning: (isAligning) => set({ isAligning }),

  setMatchPoints: (points) =>
    set((state) => ({
      matchPoints: typeof points === 'function' ? points(state.matchPoints) : points,
    })),
  addMatchPoint: (point) =>
    set((state) => ({
      matchPoints: [...state.matchPoints, point],
      redoStack: [],
    })),
  removeMatchPoint: (id) =>
    set((state) => ({
      matchPoints: state.matchPoints.filter((p) => p.id !== id),
    })),
  removeLastMatchPoint: () =>
    set((state) => {
      if (state.matchPoints.length === 0) return state;
      const removed = state.matchPoints[state.matchPoints.length - 1];
      return {
        matchPoints: state.matchPoints.slice(0, -1),
        redoStack: [...state.redoStack, removed],
      };
    }),
  restoreLastMatchPoint: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const restored = state.redoStack[state.redoStack.length - 1];
      return {
        matchPoints: [...state.matchPoints, restored],
        redoStack: state.redoStack.slice(0, -1),
      };
    }),
  updateMatchPoint: (id, updates) =>
    set((state) => ({
      matchPoints: state.matchPoints.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // Apply alignment result AND sync store values so sidebar stays in sync
  applyAlignment: (result) =>
    set((state) => {
      const { type: alignType, ...alignRest } = result;
      const r2 = (state.currentRotation * Math.PI) / 180;
      const cos2 = Math.cos(r2);
      const sin2 = Math.sin(r2);
      const t2x = state.currentPosition.x;
      const t2y = state.currentPosition.y;

      if (alignType === 'affine') {
        // result is M_affine: maps former intrinsic -> current intrinsic
        // Chain with current map transform: total = T_current * M_affine
        const t11 = result.a * cos2 - result.c * sin2;
        const t12 = result.b * cos2 - result.d * sin2;
        const ttx = result.tx * cos2 - result.ty * sin2 + t2x;

        const t21 = result.a * sin2 + result.c * cos2;
        const t22 = result.b * sin2 + result.d * cos2;
        const tty = result.tx * sin2 + result.ty * cos2 + t2y;

        // Decompose [t11, t12; t21, t22] into Konva properties
        const sx = Math.sqrt(t11 * t11 + t21 * t21);
        const rotation = Math.atan2(t21, t11);
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const sy = t22 * cosR - t12 * sinR;

        let skewX = 0;
        const denom = sy * cosR;
        if (Math.abs(denom) > 1e-10) {
          skewX = (t12 + sy * sinR) / denom;
        } else if (Math.abs(sy * sinR) > 1e-10) {
          skewX = (t22 - sy * cosR) / (sy * sinR);
        }

        return {
          alignmentResult: alignRest,
          alignmentType: 'affine' as const,
          formerPosition: { x: ttx, y: tty },
          formerRotation: (rotation * 180) / Math.PI,
          formerScaleX: sx,
          formerScaleY: sy,
          formerSkewX: skewX,
          formerSkewY: 0,
          isLocked: true,
        };
      } else {
        // Similarity: result maps former intrinsic -> current intrinsic
        const r1 = result.rotation;
        const t1x = result.tx;
        const t1y = result.ty;

        const finalRotation = (r1 + r2) * 180 / Math.PI;
        const finalTx = (t1x * cos2 - t1y * sin2) + t2x;
        const finalTy = (t1x * sin2 + t1y * cos2) + t2y;

        return {
          alignmentResult: alignRest,
          alignmentType: 'similarity' as const,
          formerPosition: { x: finalTx, y: finalTy },
          formerRotation: finalRotation,
          formerScaleX: 1,
          formerScaleY: 1,
          formerSkewX: 0,
          formerSkewY: 0,
          isLocked: true,
        };
      }
    }),

  clearAlignment: () =>
    set({
      alignmentResult: null,
      alignmentType: null,
      formerScaleX: 1,
      formerScaleY: 1,
      formerSkewX: 0,
      formerSkewY: 0,
      isLocked: false,
    }),

  startColorPick: (target) => set({ isPickingColor: true, pickingTarget: target }),
  cancelColorPick: () => set({ isPickingColor: false, pickingTarget: null }),

  // ── PDF / PNG export ──

  setStageRef: (ref) => set({ stageRef: ref }),

  exportMap: async (format: 'pdf' | 'png') => {
    if (exportInProgress) return;

    const s = get();
    const { formerMap, currentMap } = s;

    if (!formerMap && !currentMap) {
      ErrorToast('No map loaded');
      return;
    }

    exportInProgress = true;
    let canvas: HTMLCanvasElement | null = null;
    try {
      // ── 1. Draw both maps onto an offscreen canvas ──────────────────────────
      //  We render at 1:1 pixel scale (stageScale is irrelevant for export).
      //  Each image is placed at its store position with rotation & opacity.

      // First pass: figure out the bounding box of all content
      function getTransformedCorners(
        img: HTMLImageElement,
        pos: { x: number; y: number },
        rotDeg: number,
        scaleX: number,
        scaleY: number,
        skewX: number,
        skewY: number,
      ) {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const rad = (rotDeg * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        const corners = [
          { x: 0, y: 0 },
          { x: w, y: 0 },
          { x: w, y: h },
          { x: 0, y: h },
        ];
        
        return corners.map(({ x, y }) => {
          // 1. Scale & Skew
          const x1 = scaleX * x + skewX * y;
          const y1 = skewY * x + scaleY * y;
          // 2. Rotate
          const x2 = x1 * cos - y1 * sin;
          const y2 = x1 * sin + y1 * cos;
          // 3. Translate
          return {
            x: x2 + pos.x,
            y: y2 + pos.y,
          };
        });
      }

      const allCorners: { x: number; y: number }[] = [];

      if (currentMap) {
        allCorners.push(
          ...getTransformedCorners(currentMap, s.currentPosition, s.currentRotation, 1, 1, 0, 0),
        );
      }
      if (formerMap) {
        allCorners.push(
          ...getTransformedCorners(
            formerMap,
            s.formerPosition,
            s.formerRotation,
            s.formerScaleX,
            s.formerScaleY,
            s.formerSkewX,
            s.formerSkewY,
          ),
        );
      }

      const minX = Math.min(...allCorners.map((c) => c.x));
      const minY = Math.min(...allCorners.map((c) => c.y));
      const maxX = Math.max(...allCorners.map((c) => c.x));
      const maxY = Math.max(...allCorners.map((c) => c.y));

      const contentW = Math.ceil(maxX - minX);
      const contentH = Math.ceil(maxY - minY);
      if (contentW <= 0 || contentH <= 0) {
        throw new Error('Map dimensions are invalid');
      }

      // ── 2. Create offscreen canvas ──────────────────────────────────────────
      const dimensionScale = MAX_EXPORT_DIMENSION / Math.max(contentW, contentH);
      const pixelScale = Math.sqrt(MAX_EXPORT_PIXELS / (contentW * contentH));
      const SCALE = Math.min(2, dimensionScale, pixelScale);
      canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(contentW * SCALE));
      canvas.height = Math.max(1, Math.round(contentH * SCALE));
      const ctx = canvas.getContext('2d')!;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(SCALE, SCALE);

      // Helper: draw one image with transform
      function drawMapImage(
        img: HTMLImageElement,
        pos: { x: number; y: number },
        rotDeg: number,
        opacity: number,
        scaleX: number,
        scaleY: number,
        skewX: number,
        skewY: number,
      ) {
        ctx.save();
        ctx.globalAlpha = opacity;
        // Translate so content starts at (0,0) in canvas space
        ctx.translate(pos.x - minX, pos.y - minY);
        ctx.rotate((rotDeg * Math.PI) / 180);
        ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      }

      // Draw inactive map first (behind), then active on top
      const drawFormer = () =>
        formerMap &&
        drawMapImage(
          formerMap,
          s.formerPosition,
          s.formerRotation,
          s.formerOpacity,
          s.formerScaleX,
          s.formerScaleY,
          s.formerSkewX,
          s.formerSkewY,
        );

      const drawCurrent = () =>
        currentMap &&
        drawMapImage(currentMap, s.currentPosition, s.currentRotation, s.currentOpacity, 1, 1, 0, 0);

      if (s.activeMap === 'former') {
        drawCurrent();
        drawFormer();
      } else {
        drawFormer();
        drawCurrent();
      }

      if (format === 'png') {
        downloadBlob(await canvasToBlob(canvas, 'image/png'), 'pantagraph-alignment.png');
        SuccessToast('PNG downloaded successfully!');
      } else {
        // ── 3. Fit into A4 and save PDF ─────────────────────────────────────────
        const A4_W = 210;
        const A4_H = 297;
        const MARGIN = 8;

        const orientation = contentW > contentH ? 'landscape' : 'portrait';
        // Swap A4 dims for landscape
        const pdfW = orientation === 'landscape' ? A4_H : A4_W;
        const pdfH = orientation === 'landscape' ? A4_W : A4_H;
        const printMaxW = pdfW - MARGIN * 2;
        const printMaxH = pdfH - MARGIN * 2;

        const fitScale = Math.min(printMaxW / contentW, printMaxH / contentH);
        const imgW = contentW * fitScale;
        const imgH = contentH * fitScale;
        const offsetX = (pdfW - imgW) / 2;
        const offsetY = (pdfH - imgH) / 2;

        const imageBlob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
        const imageBytes = new Uint8Array(await imageBlob.arrayBuffer());
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        pdf.addImage(imageBytes, 'JPEG', offsetX, offsetY, imgW, imgH);
        pdf.save('pantagraph-alignment.pdf');
        SuccessToast('PDF downloaded successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      ErrorToast('Failed to generate export file');
    } finally {
      if (canvas) {
        canvas.width = 1;
        canvas.height = 1;
      }
      exportInProgress = false;
    }
  },

    reset: () => {
      invalidateMapProcessing('former');
      invalidateMapProcessing('current');
      set({ ...initialState });
    },
  };
});
