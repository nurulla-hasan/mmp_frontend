'use client';

import { create } from 'zustand';
import type Konva from 'konva';
import type { MatchPoint } from '../types';
import { removeBackground, parseHex } from '../utils/bgRemover';

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

  // BG removal tolerance (0-255, how wide a color range to remove)
  formerBgTolerance: number;
  currentBgTolerance: number;

  // Opacity (0-1)
  formerOpacity: number;
  currentOpacity: number;

  // BG removal loading
  isRemovingFormerBg: boolean;
  isRemovingCurrentBg: boolean;

  // Redo stack
  redoStack: MatchPoint[];

  // Duster (brush eraser)
  isDusting: boolean;
  dustingTarget: 'former' | 'current' | null;
  dusterSize: number;
  eraserUndoStack: HTMLImageElement[];
  eraserRedoStack: HTMLImageElement[];

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
  setFormerBgTolerance: (tolerance: number) => void;
  setCurrentBgTolerance: (tolerance: number) => void;
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

  // Duster (brush eraser)
  setDusting: (target: 'former' | 'current' | null) => void;
  setDusterSize: (size: number) => void;
  applyDusterStroke: (
    target: 'former' | 'current',
    points: Array<{ x: number; y: number }>,
    radius: number
  ) => Promise<void>;
  undoEraser: () => void;
  redoEraser: () => void;

  // PDF export
  setStageRef: (ref: Konva.Stage | null) => void;
  saveAsPDF: () => Promise<void>;
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
  redoStack: [],
  
  isDusting: false,
  dustingTarget: null,
  dusterSize: 20,
  eraserUndoStack: [],
  eraserRedoStack: [],
  stageRef: null,
};

export const usePantagraphStore = create<PantagraphStore>()((set, get) => ({
  ...initialState,

  setFormerMap: (formerMap) =>
    set({
      formerMap,
      formerMapOriginal: formerMap,
      formerBgRemoved: false,
    }),
  setCurrentMap: (currentMap) =>
    set({
      currentMap,
      currentMapOriginal: currentMap,
      currentBgRemoved: false,
    }),
  setActiveMap: (activeMap) => set({ activeMap }),
  setCanvasBg: (canvasBg) => set({ canvasBg }),

  setFormerBgColor: (formerBgColor) => {
    const { formerBgRemoved, formerMapOriginal, isRemovingFormerBg, formerBgTolerance } = get();
    set({ formerBgColor });
    if (formerBgRemoved && formerMapOriginal && !isRemovingFormerBg) {
      set({ isRemovingFormerBg: true });
      const parsed = parseHex(formerBgColor);
      removeBackground(formerMapOriginal, [parsed], formerBgTolerance)
        .then((processed) => {
          set({ formerMap: processed, isRemovingFormerBg: false });
        })
        .catch((e) => {
          console.error('BG re-apply failed (former):', e);
          set({ isRemovingFormerBg: false });
        });
    }
  },
  setCurrentBgColor: (currentBgColor) => {
    const { currentBgRemoved, currentMapOriginal, isRemovingCurrentBg, currentBgTolerance } = get();
    set({ currentBgColor });
    if (currentBgRemoved && currentMapOriginal && !isRemovingCurrentBg) {
      set({ isRemovingCurrentBg: true });
      const parsed = parseHex(currentBgColor);
      removeBackground(currentMapOriginal, [parsed], currentBgTolerance)
        .then((processed) => {
          set({ currentMap: processed, isRemovingCurrentBg: false });
        })
        .catch((e) => {
          console.error('BG re-apply failed (current):', e);
          set({ isRemovingCurrentBg: false });
        });
    }
  },

  setFormerBgTolerance: (formerBgTolerance) => {
    const { formerBgRemoved, formerMapOriginal, isRemovingFormerBg, formerBgColor } = get();
    set({ formerBgTolerance });
    if (formerBgRemoved && formerMapOriginal && !isRemovingFormerBg) {
      set({ isRemovingFormerBg: true });
      const parsed = parseHex(formerBgColor);
      removeBackground(formerMapOriginal, [parsed], formerBgTolerance)
        .then((processed) => {
          set({ formerMap: processed, isRemovingFormerBg: false });
        })
        .catch((e) => {
          console.error('BG re-apply failed (former):', e);
          set({ isRemovingFormerBg: false });
        });
    }
  },
  setCurrentBgTolerance: (currentBgTolerance) => {
    const { currentBgRemoved, currentMapOriginal, isRemovingCurrentBg, currentBgColor } = get();
    set({ currentBgTolerance });
    if (currentBgRemoved && currentMapOriginal && !isRemovingCurrentBg) {
      set({ isRemovingCurrentBg: true });
      const parsed = parseHex(currentBgColor);
      removeBackground(currentMapOriginal, [parsed], currentBgTolerance)
        .then((processed) => {
          set({ currentMap: processed, isRemovingCurrentBg: false });
        })
        .catch((e) => {
          console.error('BG re-apply failed (current):', e);
          set({ isRemovingCurrentBg: false });
        });
    }
  },

  setFormerOpacity: (formerOpacity) => set({ formerOpacity }),
  setCurrentOpacity: (currentOpacity) => set({ currentOpacity }),

  toggleFormerBgRemoval: async () => {
    const { formerMapOriginal, formerBgRemoved, formerBgColor, formerBgTolerance, isRemovingFormerBg } = get();
    if (!formerMapOriginal || isRemovingFormerBg) return;

    if (formerBgRemoved) {
      set({ formerMap: formerMapOriginal, formerBgRemoved: false });
    } else {
      set({ isRemovingFormerBg: true });
      try {
        const parsed = parseHex(formerBgColor);
        const processed = await removeBackground(formerMapOriginal, [parsed], formerBgTolerance);
        set({ formerMap: processed, formerBgRemoved: true, isRemovingFormerBg: false });
      } catch (e) {
        console.error('BG removal failed (former):', e);
        set({ isRemovingFormerBg: false });
      }
    }
  },

  toggleCurrentBgRemoval: async () => {
    const { currentMapOriginal, currentBgRemoved, currentBgColor, currentBgTolerance, isRemovingCurrentBg } = get();
    if (!currentMapOriginal || isRemovingCurrentBg) return;

    if (currentBgRemoved) {
      set({ currentMap: currentMapOriginal, currentBgRemoved: false });
    } else {
      set({ isRemovingCurrentBg: true });
      try {
        const parsed = parseHex(currentBgColor);
        const processed = await removeBackground(currentMapOriginal, [parsed], currentBgTolerance);
        set({ currentMap: processed, currentBgRemoved: true, isRemovingCurrentBg: false });
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

  // ── Duster actions ──

  setDusting: (target) => set({ isDusting: target !== null, dustingTarget: target }),
  setDusterSize: (dusterSize) => set({ dusterSize }),

  applyDusterStroke: async (target, points, radius) => {
    if (points.length === 0) return;
    const state = get();
    const mapKey = target === 'former' ? 'formerMap' : 'currentMap';
    const img = state[mapKey];
    if (!img) return;
    const loadKey = target === 'former' ? 'isRemovingFormerBg' : 'isRemovingCurrentBg';
    if (state[loadKey]) return;

    // Save current image onto undo stack before modifying
    set({
      eraserUndoStack: [...state.eraserUndoStack, img],
      eraserRedoStack: [], // clear redo stack on new stroke
      [loadKey]: true,
    } as unknown as Partial<PantagraphStore>);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = radius * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Also draw circles at each point for single clicks
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('toBlob failed'));
        }, 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const outImg = new window.Image();
      await new Promise<void>((resolve, reject) => {
        outImg.onload = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        outImg.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Image decode failed'));
        };
        outImg.src = url;
      });

      set({ [mapKey]: outImg, [loadKey]: false } as unknown as Partial<PantagraphStore>);
    } catch (e) {
      console.error('Duster apply failed:', e);
      set({ [loadKey]: false } as Partial<PantagraphStore>);
    }
  },

  // ── PDF export ──

  setStageRef: (ref) => set({ stageRef: ref }),

  saveAsPDF: async () => {
    const state = get();
    if (!state.formerMap && !state.currentMap) return;

    try {
      const { default: jsPDF } = await import('jspdf');

      // Determine content bounds across all visible elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      const maps: Array<{
        img: HTMLImageElement;
        x: number; y: number;
        w: number; h: number;
        rot: number;
        sx: number; sy: number;
        skewX: number;
        opacity: number;
      }> = [];

      if (state.formerMap && state.formerOpacity > 0) {
        maps.push({
          img: state.formerMap,
          x: state.formerPosition.x,
          y: state.formerPosition.y,
          w: state.formerMap.width,
          h: state.formerMap.height,
          rot: state.formerRotation,
          sx: state.formerScaleX,
          sy: state.formerScaleY,
          skewX: state.formerSkewX,
          opacity: state.formerOpacity,
        });
      }
      if (state.currentMap && state.currentOpacity > 0) {
        maps.push({
          img: state.currentMap,
          x: state.currentPosition.x,
          y: state.currentPosition.y,
          w: state.currentMap.width,
          h: state.currentMap.height,
          rot: state.currentRotation,
          sx: 1,
          sy: 1,
          skewX: 0,
          opacity: state.currentOpacity,
        });
      }

      // Compute bounding box of all maps
      for (const m of maps) {
        // Apply transform to get all 4 corners
        const rad = (m.rot * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const corners = [
          { x: 0, y: 0 },
          { x: m.w * m.sx, y: 0 },
          { x: 0, y: m.h * m.sy },
          { x: m.w * m.sx, y: m.h * m.sy },
        ];
        for (const c of corners) {
          // Apply skew
          const skX = c.y * Math.tan(m.skewX * Math.PI / 180);
          // Apply rotation
          const rx = c.x * cos - c.y * sin;
          const ry = c.x * sin + c.y * cos;
          // Apply translation
          const gx = rx + skX + m.x;
          const gy = ry + m.y;
          if (gx < minX) minX = gx;
          if (gy < minY) minY = gy;
          if (gx > maxX) maxX = gx;
          if (gy > maxY) maxY = gy;
        }
      }

      if (!isFinite(minX)) return;

      const contentW = maxX - minX;
      const contentH = maxY - minY;
      if (contentW <= 0 || contentH <= 0) return;

      // 300 DPI government standard
      const targetDPI = 300;

      // Render offscreen canvas at 300 DPI
      const renderScale = targetDPI / 72;
      const canvasW = Math.round(contentW * renderScale);
      const canvasH = Math.round(contentH * renderScale);

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d')!;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Draw each map with full transform
      for (const m of maps) {
        ctx.save();
        ctx.globalAlpha = m.opacity;
        ctx.translate(
          (m.x - minX) * renderScale,
          (m.y - minY) * renderScale
        );
        ctx.rotate((m.rot * Math.PI) / 180);
        ctx.scale(m.sx * renderScale, m.sy * renderScale);
        if (m.skewX !== 0) {
          ctx.transform(1, 0, Math.tan(m.skewX * Math.PI / 180), 1, 0, 0);
        }
        ctx.drawImage(m.img, 0, 0, m.w, m.h);
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Page size in mm matching content at 300 DPI
      const pxPerMm = targetDPI / 25.4;
      const pageW = Math.round(contentW / pxPerMm);
      const pageH = Math.round(contentH / pxPerMm);

      const pdf = new jsPDF({
        orientation: pageW > pageH ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pageW, pageH],
      });

      // Image fills the page exactly since canvas = exact content at 300 DPI
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH);
      pdf.save('pantagraph-alignment.pdf');
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  },

  undoEraser: () => {
    const { eraserUndoStack, dustingTarget } = get();
    if (eraserUndoStack.length === 0) return;
    const mapKey = dustingTarget === 'former' ? 'formerMap' : 'currentMap';
    const img = get()[mapKey];
    if (!img) return;

    const prev = eraserUndoStack[eraserUndoStack.length - 1];
    set({
      [mapKey]: prev,
      eraserUndoStack: eraserUndoStack.slice(0, -1),
      eraserRedoStack: [...get().eraserRedoStack, img],
    } as unknown as Partial<PantagraphStore>);
  },

  redoEraser: () => {
    const { eraserRedoStack, dustingTarget } = get();
    if (eraserRedoStack.length === 0) return;
    const mapKey = dustingTarget === 'former' ? 'formerMap' : 'currentMap';
    const img = get()[mapKey];
    if (!img) return;

    const next = eraserRedoStack[eraserRedoStack.length - 1];
    set({
      [mapKey]: next,
      eraserRedoStack: eraserRedoStack.slice(0, -1),
      eraserUndoStack: [...get().eraserUndoStack, img],
    } as unknown as Partial<PantagraphStore>);
  },

  reset: () => set({ ...initialState }),
}));
