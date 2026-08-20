import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { PLOT_COLOR_PALETTE } from '../../utils/canvas';
import { calculatePolygonData } from '../../utils/calculations';
import { splitPolygonByPolyline } from '../../utils/polygonDivision';
import type { Point, PlotRecord } from '../../types/map';

export interface DivideState {
  manualDividePlotId: string | null;
  manualCutLine: Point[] | null;
}

export interface DivideActions {
  setManualDividePlotId: (id: string | null) => void;
  setManualCutLine: (line: Point[] | null) => void;
  startManualDivide: () => void;
  cancelManualDivide: () => void;
  executeManualDivide: (plots: PlotRecord[], scale: number | null) => PlotRecord[] | null;
}

export type DivideSlice = DivideState & DivideActions;

export const createDivideSlice: StateCreator<DivideSlice, [], [], DivideSlice> = (
  set,
  get,
  _store
) => ({
  // State
  manualDividePlotId: null,
  manualCutLine: null,

  // Actions
  setManualDividePlotId: (id) => set({ manualDividePlotId: id }),
  setManualCutLine: (line) => set({ manualCutLine: line }),

  // These are now handled in main store as they need to set mode
  startManualDivide: () => {},
  cancelManualDivide: () => {},

  executeManualDivide: (plots, scale) => {
    const state = get();
    if (!state.manualDividePlotId || !state.manualCutLine || !scale) return null;

    const plotIndex = plots.findIndex((p) => p.id === state.manualDividePlotId);
    if (plotIndex === -1) return null;
    const plot = plots[plotIndex];

    if (state.manualCutLine.length < 2) return null;

    const polySplits = splitPolygonByPolyline(plot.points, state.manualCutLine);
    if (!polySplits) {
      toast.error('সঠিকভাবে জমি ভাগ করা সম্ভব হয়নি। লাইনটি সম্পূর্ণ জমির উপর দিয়ে টানুন।');
      return null;
    }

    const { poly1: splitA, poly2: splitB } = polySplits;

    if (splitA.length < 3 || splitB.length < 3) {
      toast.error('সঠিকভাবে জমি ভাগ করা সম্ভব হয়নি। লাইনটি সম্পূর্ণ জমির উপর দিয়ে টানুন।');
      return null;
    }

    const resultsA = calculatePolygonData(splitA, scale);
    const resultsB = calculatePolygonData(splitB, scale);

    if (!resultsA || !resultsB) {
      toast.error('ভাগ করা জমির ক্ষেত্রফল হিসাব করা সম্ভব হয়নি।');
      return null;
    }

    const newPlot1: PlotRecord = {
      id: crypto.randomUUID(),
      name: '',
      points: splitA,
      results: resultsA,
      color: plot.color,
    };

    const newPlot2: PlotRecord = {
      id: crypto.randomUUID(),
      name: '',
      points: splitB,
      results: resultsB,
      color: PLOT_COLOR_PALETTE[(plotIndex + 1) % PLOT_COLOR_PALETTE.length],
    };

    const newPlots = [...plots];
    newPlots.splice(plotIndex, 1, newPlot1, newPlot2);

    // Re-index after every split so repeated divisions can never create duplicate names.
    const renamedPlots = newPlots.map((item, index) => ({
      ...item,
      name: `Plot ${index + 1}`,
    }));

    set({ manualDividePlotId: null, manualCutLine: null });
    toast.success('ম্যানুয়াল কাট সফলভাবে সম্পন্ন হয়েছে!');

    return renamedPlots;
  },
});
