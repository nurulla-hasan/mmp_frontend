'use client';

import { create } from 'zustand';
import type { MatchPoint } from '../types';
import { removeBackground } from '../utils/bgRemover';

type CanvasBg = 'grid' | 'white' | 'yellow' | 'dark';

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
  alignmentResult: {
    tx: number;
    ty: number;
    rotation: number;
    scale: number;
  } | null;

  // Color pick mode
  isPickingColor: boolean;
  pickingTarget: 'former' | 'current' | null;

  // BG removal loading
  isRemovingFormerBg: boolean;
  isRemovingCurrentBg: boolean;
}

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
  updateMatchPoint: (id: string, updates: Partial<Pick<MatchPoint, 'former' | 'current'>>) => void;

  // Alignment
  applyAlignment: (result: { tx: number; ty: number; rotation: number; scale: number }) => void;
  clearAlignment: () => void;

  // Color pick
  startColorPick: (target: 'former' | 'current') => void;
  cancelColorPick: () => void;

  // Reset
  reset: () => void;
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
  activeMap: 'former',
  canvasBg: 'dark',

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

  isPickingColor: false,
  pickingTarget: null,

  isRemovingFormerBg: false,
  isRemovingCurrentBg: false,
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
    const { formerBgRemoved, formerMapOriginal, isRemovingFormerBg } = get();
    set({ formerBgColor });
    // If bg removal is currently on, re-apply with new color (skip if already processing)
    if (formerBgRemoved && formerMapOriginal && !isRemovingFormerBg) {
      set({ isRemovingFormerBg: true });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      removeBackground(formerMapOriginal, formerBgColor, 60, (pct) => {
        // Could update a progress percentage if needed
      })
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
    const { currentBgRemoved, currentMapOriginal, isRemovingCurrentBg } = get();
    set({ currentBgColor });
    if (currentBgRemoved && currentMapOriginal && !isRemovingCurrentBg) {
      set({ isRemovingCurrentBg: true });
      removeBackground(currentMapOriginal, currentBgColor, 60)
        .then((processed) => {
          set({ currentMap: processed, isRemovingCurrentBg: false });
        })
        .catch((e) => {
          console.error('BG re-apply failed (current):', e);
          set({ isRemovingCurrentBg: false });
        });
    }
  },

  toggleFormerBgRemoval: async () => {
    const { formerMapOriginal, formerBgRemoved, formerBgColor, isRemovingFormerBg } = get();
    if (!formerMapOriginal || isRemovingFormerBg) return;

    if (formerBgRemoved) {
      set({ formerMap: formerMapOriginal, formerBgRemoved: false });
    } else {
      set({ isRemovingFormerBg: true });
      try {
        const processed = await removeBackground(formerMapOriginal, formerBgColor);
        set({ formerMap: processed, formerBgRemoved: true, isRemovingFormerBg: false });
      } catch (e) {
        console.error('BG removal failed (former):', e);
        set({ isRemovingFormerBg: false });
      }
    }
  },

  toggleCurrentBgRemoval: async () => {
    const { currentMapOriginal, currentBgRemoved, currentBgColor, isRemovingCurrentBg } = get();
    if (!currentMapOriginal || isRemovingCurrentBg) return;

    if (currentBgRemoved) {
      set({ currentMap: currentMapOriginal, currentBgRemoved: false });
    } else {
      set({ isRemovingCurrentBg: true });
      try {
        const processed = await removeBackground(currentMapOriginal, currentBgColor);
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
    })),
  removeMatchPoint: (id) =>
    set((state) => ({
      matchPoints: state.matchPoints.filter((p) => p.id !== id),
    })),
  updateMatchPoint: (id, updates) =>
    set((state) => ({
      matchPoints: state.matchPoints.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // Apply alignment result AND sync store values so sidebar stays in sync
  applyAlignment: (result) =>
    set((state) => {
      // result is T_sim: maps former intrinsic -> current intrinsic
      const r1 = result.rotation; // in radians
      const t1x = result.tx;
      const t1y = result.ty;

      // state is T_current: maps current intrinsic -> stage
      const r2 = (state.currentRotation * Math.PI) / 180; // in radians
      const t2x = state.currentPosition.x;
      const t2y = state.currentPosition.y;

      // Final rotation & translation
      const finalRotation = (r1 + r2) * 180 / Math.PI;

      // Final translation: R2 * t1 + t2 (no scale)
      const cos2 = Math.cos(r2);
      const sin2 = Math.sin(r2);
      
      const finalTx = (t1x * cos2 - t1y * sin2) + t2x;
      const finalTy = (t1x * sin2 + t1y * cos2) + t2y;

      return {
        alignmentResult: result,
        formerPosition: { x: finalTx, y: finalTy },
        formerRotation: finalRotation,
        isLocked: true,
      };
    }),

  clearAlignment: () =>
    set({
      alignmentResult: null,
      isLocked: false,
    }),

  startColorPick: (target) => set({ isPickingColor: true, pickingTarget: target }),
  cancelColorPick: () => set({ isPickingColor: false, pickingTarget: null }),

  reset: () => set({ ...initialState }),
}));
