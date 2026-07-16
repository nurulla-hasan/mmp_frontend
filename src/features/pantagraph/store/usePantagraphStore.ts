'use client';

import { create } from 'zustand';
import type Konva from 'konva';
import type { MatchPoint } from '../types';
import { removeBackground, parseHex } from '../utils/bgRemover';
import { colorizeImage } from '../utils/colorizeImage';
import { SuccessToast, ErrorToast } from '@/lib/utils';

type CanvasBg = 'auto' | 'grid' | 'white' | 'yellow' | 'dark';

export interface PantagraphState {
  // Images
  formerMap: HTMLImageElement | null;
  currentMap: HTMLImageElement | null;
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
  isPanning: boolean;

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
  setFormerMap: (img: HTMLImageElement | null) => void;
  setCurrentMap: (img: HTMLImageElement | null) => void;
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
  setFormerOpacity: (opacity: number) => void;
  setCurrentOpacity: (opacity: number) => void;

  // Stage actions
  setStageScale: (scale: number | ((prev: number) => number)) => void;
  setStagePos: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Former transform
  setFormerRotation: (rotation: number) => void;
  setFormerPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Current transform
  setCurrentRotation: (rotation: number) => void;
  setCurrentPosition: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;

  // Mode actions
  setIsLocked: (locked: boolean) => void;
  setIsAligning: (aligning: boolean) => void;
  setIsPanning: (panning: boolean) => void;

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
  formerMapOriginal: null,
  currentMapOriginal: null,
  formerBgRemoved: false,
  currentBgRemoved: false,
  formerBgColor: '#ffffff',
  currentBgColor: '#ffffff',

  formerMapClean: null,
  currentMapClean: null,

  formerLineColor: '#000000',
  currentLineColor: '#000000',
  lineColorizeThreshold: 200,

  lineSmoothing: 2,

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
  isPanning: false,

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

// ── Slider debounce timers (module-level, NOT reactive Zustand state) ──────
// Prevents running heavy pixel processing on every slider tick during drag.
const SLIDER_DEBOUNCE_MS = 300;
const _bgTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debounceBg(key: string, fn: () => void) {
  clearTimeout(_bgTimers[key]);
  _bgTimers[key] = setTimeout(fn, SLIDER_DEBOUNCE_MS);
}

export const usePantagraphStore = create<PantagraphStore>()((set, get) => ({
  ...initialState,

  setFormerMap: (formerMap) =>
    set({
      formerMap,
      formerMapOriginal: formerMap,
      formerMapClean: formerMap,
      formerBgRemoved: false,
    }),
  setCurrentMap: (currentMap) =>
    set({
      currentMap,
      currentMapOriginal: currentMap,
      currentMapClean: currentMap,
      currentBgRemoved: false,
    }),
  setActiveMap: (activeMap) => set({ activeMap }),
  setCanvasBg: (canvasBg) => set({ canvasBg }),
  setImageLoading: (imageLoading) => set({ imageLoading }),

  setFormerBgColor: (formerBgColor) => {
    set({ formerBgColor });
    debounceBg('formerBgColor', async () => {
      const { formerBgRemoved, formerMapOriginal, isRemovingFormerBg, formerBgTolerance, lineSmoothing, formerLineColor, lineColorizeThreshold } = get();
      if (!formerBgRemoved || !formerMapOriginal || isRemovingFormerBg) return;
      set({ isRemovingFormerBg: true });
      try {
        const parsed = parseHex(formerBgColor);
        const processed = await removeBackground(formerMapOriginal, [parsed], formerBgTolerance, lineSmoothing);
        set({ formerMapClean: processed });
        const final = await applyLineToCleanMap(processed, formerLineColor, lineColorizeThreshold);
        set({ formerMap: final ?? processed, isRemovingFormerBg: false });
      } catch (e) {
        console.error('BG re-apply failed (former):', e);
        set({ isRemovingFormerBg: false });
      }
    });
  },
  setCurrentBgColor: (currentBgColor) => {
    set({ currentBgColor });
    debounceBg('currentBgColor', async () => {
      const { currentBgRemoved, currentMapOriginal, isRemovingCurrentBg, currentBgTolerance, lineSmoothing, currentLineColor, lineColorizeThreshold } = get();
      if (!currentBgRemoved || !currentMapOriginal || isRemovingCurrentBg) return;
      set({ isRemovingCurrentBg: true });
      try {
        const parsed = parseHex(currentBgColor);
        const processed = await removeBackground(currentMapOriginal, [parsed], currentBgTolerance, lineSmoothing);
        set({ currentMapClean: processed });
        const final = await applyLineToCleanMap(processed, currentLineColor, lineColorizeThreshold);
        set({ currentMap: final ?? processed, isRemovingCurrentBg: false });
      } catch (e) {
        console.error('BG re-apply failed (current):', e);
        set({ isRemovingCurrentBg: false });
      }
    });
  },

  setFormerLineColor: async (formerLineColor) => {
    const { formerMapClean, lineColorizeThreshold } = get();
    set({ formerLineColor });
    if (!formerMapClean) return;
    if (formerLineColor === '#000000') {
      set({ formerMap: formerMapClean });
      return;
    }
    try {
      const processed = await colorizeImage(formerMapClean, formerLineColor, lineColorizeThreshold);
      set({ formerMap: processed });
    } catch (e) {
      console.error('Line colorize failed (former):', e);
    }
  },
  setCurrentLineColor: async (currentLineColor) => {
    const { currentMapClean, lineColorizeThreshold } = get();
    set({ currentLineColor });
    if (!currentMapClean) return;
    if (currentLineColor === '#000000') {
      set({ currentMap: currentMapClean });
      return;
    }
    try {
      const processed = await colorizeImage(currentMapClean, currentLineColor, lineColorizeThreshold);
      set({ currentMap: processed });
    } catch (e) {
      console.error('Line colorize failed (current):', e);
    }
  },
  // Debounced so heavy colorize only fires after slider settles
  setLineColorizeThreshold: (lineColorizeThreshold) => {
    set({ lineColorizeThreshold });
    debounceBg('lineColorizeThreshold', async () => {
      const { formerMapClean, formerLineColor, currentMapClean, currentLineColor } = get();
      const tasks: Promise<void>[] = [];
      if (formerMapClean && formerLineColor !== '#000000') {
        tasks.push(
          colorizeImage(formerMapClean, formerLineColor, lineColorizeThreshold)
            .then((img) => set({ formerMap: img }))
            .catch((e) => console.error('Threshold re-colorize failed (former):', e))
        );
      }
      if (currentMapClean && currentLineColor !== '#000000') {
        tasks.push(
          colorizeImage(currentMapClean, currentLineColor, lineColorizeThreshold)
            .then((img) => set({ currentMap: img }))
            .catch((e) => console.error('Threshold re-colorize failed (current):', e))
        );
      }
      await Promise.all(tasks);
    });
  },

  setFormerBgTolerance: (formerBgTolerance) => {
    set({ formerBgTolerance });
    debounceBg('formerBgTolerance', async () => {
      const { formerBgRemoved, formerMapOriginal, isRemovingFormerBg, formerBgColor, lineSmoothing, formerLineColor, lineColorizeThreshold } = get();
      if (!formerBgRemoved || !formerMapOriginal || isRemovingFormerBg) return;
      set({ isRemovingFormerBg: true });
      try {
        const parsed = parseHex(formerBgColor);
        const processed = await removeBackground(formerMapOriginal, [parsed], formerBgTolerance, lineSmoothing);
        set({ formerMapClean: processed });
        const final = await applyLineToCleanMap(processed, formerLineColor, lineColorizeThreshold);
        set({ formerMap: final ?? processed, isRemovingFormerBg: false });
      } catch (e) {
        console.error('BG re-apply failed (former):', e);
        set({ isRemovingFormerBg: false });
      }
    });
  },
  setCurrentBgTolerance: (currentBgTolerance) => {
    set({ currentBgTolerance });
    debounceBg('currentBgTolerance', async () => {
      const { currentBgRemoved, currentMapOriginal, isRemovingCurrentBg, currentBgColor, lineSmoothing, currentLineColor, lineColorizeThreshold } = get();
      if (!currentBgRemoved || !currentMapOriginal || isRemovingCurrentBg) return;
      set({ isRemovingCurrentBg: true });
      try {
        const parsed = parseHex(currentBgColor);
        const processed = await removeBackground(currentMapOriginal, [parsed], currentBgTolerance, lineSmoothing);
        set({ currentMapClean: processed });
        const final = await applyLineToCleanMap(processed, currentLineColor, lineColorizeThreshold);
        set({ currentMap: final ?? processed, isRemovingCurrentBg: false });
      } catch (e) {
        console.error('BG re-apply failed (current):', e);
        set({ isRemovingCurrentBg: false });
      }
    });
  },

  setLineSmoothing: (lineSmoothing) => {
    set({ lineSmoothing });
    // Re-apply BG removal for both maps with new smoothing level
    debounceBg('lineSmoothing', async () => {
      const s = get();
      const tasks: Promise<void>[] = [];

      if (s.formerBgRemoved && s.formerMapOriginal && !s.isRemovingFormerBg) {
        set({ isRemovingFormerBg: true });
        tasks.push(
          removeBackground(s.formerMapOriginal, [parseHex(s.formerBgColor)], s.formerBgTolerance, lineSmoothing)
            .then(async (processed) => {
              set({ formerMapClean: processed });
              const final = await applyLineToCleanMap(processed, s.formerLineColor, s.lineColorizeThreshold);
              set({ formerMap: final ?? processed, isRemovingFormerBg: false });
            })
            .catch((e) => { console.error(e); set({ isRemovingFormerBg: false }); })
        );
      }

      if (s.currentBgRemoved && s.currentMapOriginal && !s.isRemovingCurrentBg) {
        set({ isRemovingCurrentBg: true });
        tasks.push(
          removeBackground(s.currentMapOriginal, [parseHex(s.currentBgColor)], s.currentBgTolerance, lineSmoothing)
            .then(async (processed) => {
              set({ currentMapClean: processed });
              const final = await applyLineToCleanMap(processed, s.currentLineColor, s.lineColorizeThreshold);
              set({ currentMap: final ?? processed, isRemovingCurrentBg: false });
            })
            .catch((e) => { console.error(e); set({ isRemovingCurrentBg: false }); })
        );
      }

      await Promise.all(tasks);
    });
  },

  setFormerOpacity: (formerOpacity) => set({ formerOpacity }),
  setCurrentOpacity: (currentOpacity) => set({ currentOpacity }),

  toggleFormerBgRemoval: async () => {
    const { formerMapOriginal, formerBgRemoved, formerBgColor, formerBgTolerance, lineSmoothing, isRemovingFormerBg, formerLineColor, lineColorizeThreshold } = get();
    if (!formerMapOriginal || isRemovingFormerBg) return;

    if (formerBgRemoved) {
      // Turn bg removal OFF
      set({ formerBgRemoved: false, formerMapClean: formerMapOriginal });
      const final = await applyLineToCleanMap(formerMapOriginal, formerLineColor, lineColorizeThreshold);
      set({ formerMap: final ?? formerMapOriginal });
    } else {
      set({ isRemovingFormerBg: true });
      try {
        const parsed = parseHex(formerBgColor);
        const processed = await removeBackground(formerMapOriginal, [parsed], formerBgTolerance, lineSmoothing);
        set({ formerMapClean: processed });
        const final = await applyLineToCleanMap(processed, formerLineColor, lineColorizeThreshold);
        set({ formerMap: final ?? processed, formerBgRemoved: true, isRemovingFormerBg: false });
      } catch (e) {
        console.error('BG removal failed (former):', e);
        set({ isRemovingFormerBg: false });
      }
    }
  },

  toggleCurrentBgRemoval: async () => {
    const { currentMapOriginal, currentBgRemoved, currentBgColor, currentBgTolerance, lineSmoothing, isRemovingCurrentBg, currentLineColor, lineColorizeThreshold } = get();
    if (!currentMapOriginal || isRemovingCurrentBg) return;

    if (currentBgRemoved) {
      // Turn bg removal OFF
      set({ currentBgRemoved: false, currentMapClean: currentMapOriginal });
      const final = await applyLineToCleanMap(currentMapOriginal, currentLineColor, lineColorizeThreshold);
      set({ currentMap: final ?? currentMapOriginal });
    } else {
      set({ isRemovingCurrentBg: true });
      try {
        const parsed = parseHex(currentBgColor);
        const processed = await removeBackground(currentMapOriginal, [parsed], currentBgTolerance, lineSmoothing);
        set({ currentMapClean: processed });
        const final = await applyLineToCleanMap(processed, currentLineColor, lineColorizeThreshold);
        set({ currentMap: final ?? processed, currentBgRemoved: true, isRemovingCurrentBg: false });
      } catch (e) {
        console.error('BG removal failed (current):', e);
        set({ isRemovingCurrentBg: false });
      }
    }
  },

  setStageScale: (scale) =>
    set((state) => ({
      stageScale: typeof scale === 'function' ? scale(state.stageScale) : scale,
    })),
  setStagePos: (pos) =>
    set((state) => ({
      stagePos: typeof pos === 'function' ? pos(state.stagePos) : pos,
    })),

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
  setIsAligning: (isAligning) => set({ isAligning, ...(isAligning ? { isPanning: false } : {}) }),
  setIsPanning: (isPanning) => set({ isPanning, ...(isPanning ? { isAligning: false } : {}) }),

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
    const s = get();
    const { formerMap, currentMap } = s;

    if (!formerMap && !currentMap) {
      ErrorToast('কোনো ম্যাপ লোড নেই');
      return;
    }

    try {
      const { default: jsPDF } = await import('jspdf');

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
        const w = img.width;
        const h = img.height;
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

      // ── 2. Create offscreen canvas ──────────────────────────────────────────
      // Higher scale = better resolution, but capped to avoid browser OOM crash.
      const MAX_CANVAS_DIM = 8192; // safe limit for most browsers (8K)
      const SCALE = Math.min(4, MAX_CANVAS_DIM / Math.max(contentW, contentH, 1));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(contentW * SCALE);
      canvas.height = Math.round(contentH * SCALE);
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
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'pantagraph-alignment.png';
        link.href = dataUrl;
        link.click();
        SuccessToast('PNG সফলভাবে ডাউনলোড হয়েছে!');
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

        // Use JPEG for PDF to keep size manageable, but high quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
        pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, imgW, imgH);
        pdf.save('pantagraph-alignment.pdf');
        SuccessToast('PDF সফলভাবে ডাউনলোড হয়েছে!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      ErrorToast('ফাইল জেনারেট করতে ব্যর্থ হয়েছে');
    }
  },

  reset: () => set({ ...initialState }),
}));
