import { create } from 'zustand';

export type StudioStep = 'align' | 'trace' | 'measure' | 'layout';
export type StudioUnit = 'ft' | 'm';
export type StudioSheetMode = 'all' | 'cs' | 'bs';

export type StudioPoint = { x: number; y: number };

export type StudioCalibration = {
  pixelDistance: number;
  realDistance: number;
  unitsPerPixel: number;
  unit: StudioUnit;
};

export type StudioDimension = {
  id: string;
  start: StudioPoint;
  end: StudioPoint;
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

type MouzaMapStudioStore = {
  step: StudioStep;
  compositeMeta: StudioCompositeMeta | null;
  calibration: StudioCalibration | null;
  dimensions: StudioDimension[];
  sheetMode: StudioSheetMode;
  sheetDetails: StudioSheetDetails;
  setStep: (step: StudioStep) => void;
  setCompositeMeta: (meta: StudioCompositeMeta | null) => void;
  setCalibration: (calibration: StudioCalibration | null) => void;
  addDimension: (dimension: StudioDimension) => void;
  removeDimension: (id: string) => void;
  clearDimensions: () => void;
  setSheetMode: (mode: StudioSheetMode) => void;
  updateSheetDetails: (details: Partial<StudioSheetDetails>) => void;
  reset: () => void;
};

const defaultSheetDetails: StudioSheetDetails = {
  title: 'C.S ও B.S মৌজা ম্যাপ তুলনা',
  mouzaName: '',
  sheetNo: '',
  khatianNo: '',
  ownerName: '',
  surveyorName: '',
  preparedBy: '',
  date: new Date().toISOString().slice(0, 10),
};

export const useMouzaMapStudioStore = create<MouzaMapStudioStore>()((set) => ({
  step: 'align',
  compositeMeta: null,
  calibration: null,
  dimensions: [],
  sheetMode: 'all',
  sheetDetails: defaultSheetDetails,
  setStep: (step) => set({ step }),
  setCompositeMeta: (compositeMeta) => set({ compositeMeta }),
  setCalibration: (calibration) => set({ calibration }),
  addDimension: (dimension) => set((state) => ({ dimensions: [...state.dimensions, dimension] })),
  removeDimension: (id) => set((state) => ({ dimensions: state.dimensions.filter((item) => item.id !== id) })),
  clearDimensions: () => set({ dimensions: [] }),
  setSheetMode: (sheetMode) => set({ sheetMode }),
  updateSheetDetails: (details) => set((state) => ({
    sheetDetails: { ...state.sheetDetails, ...details },
  })),
  reset: () => set({
    step: 'align',
    compositeMeta: null,
    calibration: null,
    dimensions: [],
    sheetMode: 'all',
    sheetDetails: { ...defaultSheetDetails, date: new Date().toISOString().slice(0, 10) },
  }),
}));
