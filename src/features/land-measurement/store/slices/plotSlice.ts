import { StateCreator } from 'zustand';
import { ErrorToast } from '@/lib/utils';
import { PLOT_COLOR_PALETTE } from '../../utils/canvas';
import { calculatePolygonData } from '../../utils/calculations';
import { normalizePolygonPoints } from '../../utils/geometry';
import { incrementPlotCountAction } from '../../actions/calculation.action';
import type { Point, PolygonResults, PlotRecord } from '../../types/map';

const MAX_PLOT_HISTORY = 50;

function appendBoundedHistory(history: PlotRecord[][], snapshot: PlotRecord[]): PlotRecord[][] {
  const next = [...history, snapshot];
  return next.length > MAX_PLOT_HISTORY ? next.slice(next.length - MAX_PLOT_HISTORY) : next;
}

export interface PlotState {
  plotPoints: Point[];
  plotPointsFuture: Point[];
  plots: PlotRecord[];
  plotsHistory: PlotRecord[][];
  plotsFuture: PlotRecord[][];
  results: PolygonResults | null;
  isPlotFinished: boolean;
}

export interface PlotActions {
  setPlotPoints: (points: Point[] | ((prev: Point[]) => Point[])) => void;
  setPlots: (plots: PlotRecord[] | ((prev: PlotRecord[]) => PlotRecord[])) => void;
  setResults: (results: PolygonResults | null) => void;
  setIsPlotFinished: (finished: boolean) => void;
  startPlotDrawing: () => void;
  finishPlot: (scale: number | null, plots: PlotRecord[]) => void;
  clearPlot: () => void;
  undoPlotAction: () => void;
  redoPlotAction: () => void;
  undoLastPlot: () => void;
  handlePointDragEnd: (
    e: { target: { x(): number; y(): number } },
    index: number,
  ) => void;
}

export type PlotSlice = PlotState & PlotActions;

export const createPlotSlice: StateCreator<PlotSlice, [], [], PlotSlice> = (set, get) => ({
  plotPoints: [],
  plotPointsFuture: [],
  plots: [],
  plotsHistory: [],
  plotsFuture: [],
  results: null,
  isPlotFinished: false,

  setPlotPoints: (points) =>
    set((state) => ({
      plotPoints: typeof points === 'function' ? points(state.plotPoints) : points,
      plotPointsFuture: [],
    })),

  setPlots: (plots) =>
    set((state) => {
      const nextPlots = typeof plots === 'function' ? plots(state.plots) : plots;
      return {
        plots: nextPlots,
        plotsHistory: [],
        plotsFuture: [],
        results: nextPlots.length > 0 ? nextPlots[nextPlots.length - 1].results : null,
      };
    }),

  setResults: (results) => set({ results }),
  setIsPlotFinished: (isPlotFinished) => set({ isPlotFinished }),

  startPlotDrawing: () =>
    set({ plotPoints: [], plotPointsFuture: [], isPlotFinished: false }),

  finishPlot: (scale, currentPlots) => {
    const state = get();
    const normalizedPoints = normalizePolygonPoints(state.plotPoints);
    if (normalizedPoints.length < 3) return;

    const nextResults = calculatePolygonData(normalizedPoints, scale);
    if (!nextResults) {
      ErrorToast('Invalid plot shape. Please draw a measurable area with at least 3 points.');
      return;
    }

    const nextPlot: PlotRecord = {
      id: `${Date.now()}-${currentPlots.length}`,
      name: `Plot ${currentPlots.length + 1}`,
      points: normalizedPoints,
      results: nextResults,
      color: PLOT_COLOR_PALETTE[currentPlots.length % PLOT_COLOR_PALETTE.length],
    };

    set({
      plotsHistory: appendBoundedHistory(state.plotsHistory, currentPlots),
      plotsFuture: [],
      plots: [...currentPlots, nextPlot],
      plotPoints: [],
      plotPointsFuture: [],
      results: nextResults,
      isPlotFinished: true,
    });

    incrementPlotCountAction().catch(() => {});
  },

  clearPlot: () =>
    set({ plotPoints: [], plotPointsFuture: [], plots: [], plotsHistory: [], plotsFuture: [], results: null, isPlotFinished: false }),

  undoPlotAction: () => {
    const state = get();
    if (state.plotPoints.length > 0) {
      const nextPoints = state.plotPoints.slice(0, -1);
      const undonePoint = state.plotPoints[state.plotPoints.length - 1];
      set({
        plotPoints: nextPoints,
        plotPointsFuture: [...state.plotPointsFuture, undonePoint].slice(-MAX_PLOT_HISTORY),
      });
      return;
    }

    if (state.plotsHistory.length > 0) {
      const nextHistory = [...state.plotsHistory];
      const previousPlots = nextHistory.pop()!;
      const currentPlots = state.plots;
      const lastPlot = previousPlots.length > 0 ? previousPlots[previousPlots.length - 1] : null;
      set({
        plots: previousPlots,
        plotsHistory: nextHistory,
        plotsFuture: appendBoundedHistory(state.plotsFuture, currentPlots),
        results: lastPlot ? lastPlot.results : null,
      });
    }
  },

  redoPlotAction: () => {
    const state = get();
    if (state.plotPointsFuture.length > 0) {
      const nextFuture = [...state.plotPointsFuture];
      const nextPoint = nextFuture.pop()!;
      set({
        plotPoints: [...state.plotPoints, nextPoint],
        plotPointsFuture: nextFuture,
      });
      return;
    }

    if (state.plotPoints.length > 0 || state.plotsFuture.length === 0) return;

    const nextFuture = [...state.plotsFuture];
    const nextPlots = nextFuture.pop()!;
    const lastPlot = nextPlots.length > 0 ? nextPlots[nextPlots.length - 1] : null;

    set({
      plots: nextPlots,
      plotsHistory: appendBoundedHistory(state.plotsHistory, state.plots),
      plotsFuture: nextFuture,
      results: lastPlot ? lastPlot.results : null,
    });
  },

  undoLastPlot: () => {
    get().undoPlotAction();
  },

  handlePointDragEnd: (e: { target: { x(): number; y(): number } }, index: number) => {
    const fullState = get();
    const snapThreshold = 20 / ((fullState as { stageScale?: number }).stageScale ?? 1);
    const state = get();
    const newPoints = [...state.plotPoints];
    let x = e.target.x();
    let y = e.target.y();

    if (index !== 0 && newPoints.length > 0) {
      const first = newPoints[0];
      if (Math.hypot(x - first.x, y - first.y) <= snapThreshold) {
        x = first.x;
        y = first.y;
      }
    }

    newPoints[index] = { x, y };
    set({ plotPoints: newPoints });
  },
});
