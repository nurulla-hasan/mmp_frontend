import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { isPointInPolygon, clipLineToPolygon } from '../../utils/geometry';
import type { MeasurementLine, Point, PlotRecord } from '../../types/map';

export interface MeasurementState {
  measurementLines: MeasurementLine[];
  measurementDraft: number[];
  measurementDashed: boolean;
}

export interface MeasurementActions {
  setMeasurementLines: (lines: MeasurementLine[] | ((prev: MeasurementLine[]) => MeasurementLine[])) => void;
  setMeasurementDraft: (draft: number[]) => void;
  setMeasurementDashed: (dashed: boolean) => void;
  undoMeasurementLine: () => void;
  clearMeasurementLines: () => void;
  addMeasurementPoint: (pt: Point, scale: number | null, plots: PlotRecord[]) => void;
}

export type MeasurementSlice = MeasurementState & MeasurementActions;

export const createMeasurementSlice: StateCreator<
  MeasurementSlice,
  [],
  [],
  MeasurementSlice
> = (set, get, _store) => ({
  // State
  measurementLines: [],
  measurementDraft: [],
  measurementDashed: true,

  // Actions
  setMeasurementLines: (lines) =>
    set((state) => ({
      measurementLines: typeof lines === 'function' ? lines(state.measurementLines) : lines,
    })),

  setMeasurementDraft: (measurementDraft) => set({ measurementDraft }),
  setMeasurementDashed: (measurementDashed) => set({ measurementDashed }),

  undoMeasurementLine: () => {
    const state = get();
    if (state.measurementDraft.length > 0) {
      set({ measurementDraft: [] });
    } else if (state.measurementLines.length > 0) {
      set({ measurementLines: state.measurementLines.slice(0, -1) });
    }
  },

  clearMeasurementLines: () => set({ measurementDraft: [], measurementLines: [] }),

  addMeasurementPoint: (pt: Point, scale: number | null, plots: PlotRecord[]) => {
    const state = get();
    
    if (!scale) {
      toast.warning('দাগ মাপার আগে দয়া করে স্কেল সেট করে নিন');
      return;
    }

    if (state.measurementDraft.length < 2) {
      set({ measurementDraft: [pt.x, pt.y] });
      return;
    }

    const [x1, y1] = state.measurementDraft;
    const startPt = { x: x1, y: y1 };
    let finalPt = pt;

    // Clip to polygon if starting inside one
    for (const plot of plots) {
      if (isPointInPolygon(startPt, plot.points)) {
        finalPt = clipLineToPolygon(startPt, pt, plot.points);
        break;
      }
    }

    const dist = Math.hypot(finalPt.x - x1, finalPt.y - y1);
    if (dist < 1e-3) return;

    set({
      measurementLines: [
        ...state.measurementLines,
        {
          id: `${Date.now()}-${state.measurementLines.length}`,
          start: startPt,
          end: finalPt,
          dashed: state.measurementDashed,
        },
      ],
      measurementDraft: [],
    });
  },
});
