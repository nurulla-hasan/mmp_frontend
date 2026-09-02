import { create } from 'zustand';

export type StudioStep = 'align' | 'edit' | 'layout';
export type StudioEditorTool = 'pan' | 'cleanup' | 'text' | 'mark';

export type StudioPoint = { x: number; y: number };

export type StudioEditorStroke = {
  id: string;
  kind: 'cleanup' | 'mark';
  points: StudioPoint[];
  color: string;
  width: number;
};

export type StudioEditorText = {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
};

type StudioEditorSnapshot = {
  strokes: StudioEditorStroke[];
  texts: StudioEditorText[];
};

export type StudioSheetDetails = {
  title: string;
  mouzaName: string;
  sheetNo: string;
  khatianNo: string;
  ownerName: string;
  surveyorName: string;
  preparedBy: string;
  date: string;
};

export type StudioCompositeMeta = {
  width: number;
  height: number;
  outputScale: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
};

export type StudioCompositeCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type MouzaMapStudioStore = {
  step: StudioStep;
  compositeMeta: StudioCompositeMeta | null;
  compositeCrop: StudioCompositeCrop | null;
  editorImage: HTMLImageElement | null;
  editorTool: StudioEditorTool;
  editorStrokes: StudioEditorStroke[];
  editorTexts: StudioEditorText[];
  editorFontSize: number;
  editorPast: StudioEditorSnapshot[];
  editorFuture: StudioEditorSnapshot[];
  sheetDetails: StudioSheetDetails;

  setStep: (step: StudioStep) => void;
  setCompositeMeta: (meta: StudioCompositeMeta | null) => void;
  setCompositeCrop: (crop: StudioCompositeCrop | null) => void;
  setEditorImage: (image: HTMLImageElement | null) => void;
  setEditorTool: (tool: StudioEditorTool) => void;
  startEditorStroke: (stroke: StudioEditorStroke) => void;
  appendEditorStrokePoint: (id: string, point: StudioPoint) => void;
  addEditorText: (text: StudioEditorText) => void;
  updateEditorText: (id: string, text: string) => void;
  setEditorFontSize: (fontSize: number) => void;
  moveEditorText: (id: string, x: number, y: number) => void;
  deleteEditorText: (id: string) => void;
  undoEditor: () => void;
  redoEditor: () => void;
  clearEditor: () => void;
  resetEditorContent: () => void;

  updateSheetDetails: (details: Partial<StudioSheetDetails>) => void;
  reset: () => void;
};

const HISTORY_LIMIT = 60;

const cloneStrokes = (strokes: StudioEditorStroke[]) =>
  strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({ ...point })),
  }));

const cloneTexts = (texts: StudioEditorText[]) =>
  texts.map((text) => ({ ...text }));

const snapshot = (
  strokes: StudioEditorStroke[],
  texts: StudioEditorText[],
): StudioEditorSnapshot => ({
  strokes: cloneStrokes(strokes),
  texts: cloneTexts(texts),
});

const appendHistory = (
  history: StudioEditorSnapshot[],
  value: StudioEditorSnapshot,
) => [...history.slice(-(HISTORY_LIMIT - 1)), value];

const defaultSheetDetails: StudioSheetDetails = {
  title: 'C.S & B.S Mouza Map Comparison',
  mouzaName: '',
  sheetNo: '',
  khatianNo: '',
  ownerName: '',
  surveyorName: '',
  preparedBy: '',
  date: new Date().toISOString().slice(0, 10),
};

export const useMouzaMapStudioStore = create<MouzaMapStudioStore>()((set, get) => ({
  step: 'align',
  compositeMeta: null,
  compositeCrop: null,
  editorImage: null,
  editorTool: 'pan',
  editorStrokes: [],
  editorTexts: [],
  editorFontSize: 14,
  editorPast: [],
  editorFuture: [],
  sheetDetails: defaultSheetDetails,

  setStep: (step) => set({ step }),
  setCompositeMeta: (compositeMeta) => set({ compositeMeta }),
  setCompositeCrop: (compositeCrop) => set({ compositeCrop }),
  setEditorImage: (editorImage) => set({ editorImage }),
  setEditorTool: (editorTool) => set({ editorTool }),

  startEditorStroke: (stroke) => {
    const { editorStrokes, editorTexts, editorPast } = get();
    set({
      editorPast: appendHistory(editorPast, snapshot(editorStrokes, editorTexts)),
      editorFuture: [],
      editorStrokes: [...editorStrokes, stroke],
    });
  },

  appendEditorStrokePoint: (id, point) =>
    set((state) => ({
      editorStrokes: state.editorStrokes.map((stroke) =>
        stroke.id === id
          ? { ...stroke, points: [...stroke.points, point] }
          : stroke,
      ),
    })),

  addEditorText: (text) => {
    const { editorStrokes, editorTexts, editorPast, editorFontSize } = get();
    set({
      editorPast: appendHistory(editorPast, snapshot(editorStrokes, editorTexts)),
      editorFuture: [],
      editorTexts: [...editorTexts, { ...text, fontSize: editorFontSize }],
    });
  },

  updateEditorText: (id, text) =>
    set((state) => ({
      editorTexts: state.editorTexts.map((item) =>
        item.id === id ? { ...item, text } : item,
      ),
    })),

  setEditorFontSize: (value) =>
    set((state) => {
      const editorFontSize = Math.max(10, Math.min(20, value));
      return {
        editorFontSize,
        editorTexts: state.editorTexts.map((item) => ({
          ...item,
          fontSize: editorFontSize,
        })),
      };
    }),

  moveEditorText: (id, x, y) =>
    set((state) => ({
      editorTexts: state.editorTexts.map((item) =>
        item.id === id ? { ...item, x, y } : item,
      ),
    })),

  deleteEditorText: (id) => {
    const { editorStrokes, editorTexts, editorPast } = get();
    set({
      editorPast: appendHistory(editorPast, snapshot(editorStrokes, editorTexts)),
      editorFuture: [],
      editorTexts: editorTexts.filter((item) => item.id !== id),
    });
  },

  undoEditor: () => {
    const { editorPast, editorFuture, editorStrokes, editorTexts } = get();
    const previous = editorPast.at(-1);
    if (!previous) return;

    set({
      editorStrokes: cloneStrokes(previous.strokes),
      editorTexts: cloneTexts(previous.texts).map((item) => ({
        ...item,
        fontSize: get().editorFontSize,
      })),
      editorPast: editorPast.slice(0, -1),
      editorFuture: [
        snapshot(editorStrokes, editorTexts),
        ...editorFuture,
      ].slice(0, HISTORY_LIMIT),
    });
  },

  redoEditor: () => {
    const { editorPast, editorFuture, editorStrokes, editorTexts } = get();
    const next = editorFuture[0];
    if (!next) return;

    set({
      editorStrokes: cloneStrokes(next.strokes),
      editorTexts: cloneTexts(next.texts).map((item) => ({
        ...item,
        fontSize: get().editorFontSize,
      })),
      editorPast: appendHistory(editorPast, snapshot(editorStrokes, editorTexts)),
      editorFuture: editorFuture.slice(1),
    });
  },

  clearEditor: () => {
    const { editorStrokes, editorTexts, editorPast } = get();
    if (editorStrokes.length === 0 && editorTexts.length === 0) return;

    set({
      editorPast: appendHistory(editorPast, snapshot(editorStrokes, editorTexts)),
      editorFuture: [],
      editorStrokes: [],
      editorTexts: [],
    });
  },

  resetEditorContent: () =>
    set({
      editorTool: 'pan',
      editorStrokes: [],
      editorTexts: [],
      editorPast: [],
      editorFuture: [],
    }),

  updateSheetDetails: (details) =>
    set((state) => ({
      sheetDetails: { ...state.sheetDetails, ...details },
    })),

  reset: () =>
    set({
      step: 'align',
      compositeMeta: null,
      compositeCrop: null,
      editorImage: null,
      editorTool: 'pan',
      editorStrokes: [],
      editorTexts: [],
      editorFontSize: 14,
      editorPast: [],
      editorFuture: [],
      sheetDetails: {
        ...defaultSheetDetails,
        date: new Date().toISOString().slice(0, 10),
      },
    }),
}));
