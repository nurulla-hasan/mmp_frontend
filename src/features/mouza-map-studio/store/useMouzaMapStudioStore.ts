import { create } from 'zustand';

export type StudioStep = 'align' | 'trace' | 'measure' | 'layout';

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
  setStep: (step: StudioStep) => void;
  setCompositeMeta: (meta: StudioCompositeMeta | null) => void;
  reset: () => void;
};

export const useMouzaMapStudioStore = create<MouzaMapStudioStore>()((set) => ({
  step: 'align',
  compositeMeta: null,
  setStep: (step) => set({ step }),
  setCompositeMeta: (compositeMeta) => set({ compositeMeta }),
  reset: () => set({ step: 'align', compositeMeta: null }),
}));
