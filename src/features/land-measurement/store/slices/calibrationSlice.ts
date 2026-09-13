import { StateCreator } from 'zustand';
import { SuccessToast, ErrorToast } from '@/lib/utils';

export interface CalibrationState {
  scale: number | null;
  manualScale: string;
  showManualScale: boolean;
  calibrationLine: number[];
  isDrawing: boolean;
}

export interface CalibrationActions {
  setScale: (scale: number | null) => void;
  setManualScale: (val: string) => void;
  setShowManualScale: (show: boolean) => void;
  setCalibrationLine: (line: number[]) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  handleManualScaleSubmit: (e: React.FormEvent) => void;
  _handleModalSubmit: (realDistance: number) => void;
}

export type CalibrationSlice = CalibrationState & CalibrationActions;

export const createCalibrationSlice: StateCreator<
  CalibrationSlice,
  [],
  [],
  CalibrationSlice
> = (set, get) => ({
  // Scale belongs to one exact raster. Saved calculations explicitly restore
  // their own value; a new browser session or map upload starts uncalibrated.
  scale: null,
  manualScale: '',
  showManualScale: false,
  calibrationLine: [],
  isDrawing: false,

  setScale: (scale) => set({ scale }),
  setManualScale: (manualScale) => set({ manualScale }),
  setShowManualScale: (showManualScale) => set({ showManualScale }),
  setCalibrationLine: (calibrationLine) => set({ calibrationLine }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  handleManualScaleSubmit: (e) => {
    e.preventDefault();
    const state = get();
    const ftPerPx = Number(state.manualScale);
    if (Number.isFinite(ftPerPx) && ftPerPx > 0) {
      const scaleValue = 1 / ftPerPx;
      set({ scale: scaleValue, showManualScale: false, calibrationLine: [], isDrawing: false });
      SuccessToast(`Scale calibrated: 1 px = ${ftPerPx.toFixed(6)} ft`);
    } else {
      ErrorToast('Please enter a value greater than 0');
    }
  },

  _handleModalSubmit: (realDistance: number) => {
    const state = get();
    if (!Number.isFinite(realDistance) || realDistance <= 0) {
      ErrorToast('Please provide a distance greater than 0');
      return;
    }
    if (state.calibrationLine.length < 4) {
      ErrorToast('Scale calibration line is incomplete');
      return;
    }

    let pixelDistance = 0;
    for (let i = 0; i < state.calibrationLine.length - 2; i += 2) {
      const x1 = state.calibrationLine[i];
      const y1 = state.calibrationLine[i + 1];
      const x2 = state.calibrationLine[i + 2];
      const y2 = state.calibrationLine[i + 3];
      pixelDistance += Math.hypot(x2 - x1, y2 - y1);
    }

    if (!Number.isFinite(pixelDistance) || pixelDistance <= 0) {
      ErrorToast('Invalid calibration line length');
      return;
    }

    const newScale = pixelDistance / realDistance;
    set({ scale: newScale, calibrationLine: [], isDrawing: false });
    SuccessToast(`Scale calibrated (1 px = ${(1 / newScale).toFixed(6)} ft)`);
  },
});
