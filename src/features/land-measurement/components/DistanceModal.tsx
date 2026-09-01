import React, { useState, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { SCALE_PRESETS, validateCalibration } from '@/features/land-measurement/utils/mouzaScale';

export const DistanceModal = () => {
  const {
    isModalOpen,
    setCalibrationLine,
    setIsDrawing,
    setIsModalOpen,
    _handleModalSubmit,
    calibrationLine,
  } = useMapStore(
    useShallow((s) => ({
      isModalOpen: s.isModalOpen,
      setCalibrationLine: s.setCalibrationLine,
      setIsDrawing: s.setIsDrawing,
      setIsModalOpen: s.setIsModalOpen,
      _handleModalSubmit: s._handleModalSubmit,
      calibrationLine: s.calibrationLine,
    })),
  );
  const [distance, setDistance] = useState('');
  const [error, setError] = useState('');

  const handlePresetClick = useCallback((valueFt: number) => {
    setDistance(String(valueFt));
    setError('');

    // Optional: validate pixel distance against preset
    let pixelDistance = 0;
    for (let i = 0; i < calibrationLine.length - 2; i += 2) {
      const x1 = calibrationLine[i];
      const y1 = calibrationLine[i+1];
      const x2 = calibrationLine[i+2];
      const y2 = calibrationLine[i+3];
      pixelDistance += Math.hypot(x2 - x1, y2 - y1);
    }
    if (pixelDistance > 0) {
      const warning = validateCalibration(pixelDistance, valueFt);
      if (warning) {
        setError(warning);
      }
    }
  }, [calibrationLine]);

  if (!isModalOpen) return null;

  const handleSubmit = () => {
    const num = Number(distance);
    if (Number.isFinite(num) && num > 0) {
      _handleModalSubmit(num);
      setDistance('');
      setError('');
    } else {
      setError('দূরত্ব অবশ্যই ০ এর চেয়ে বড় একটি সংখ্যা হতে হবে');
    }
  };

  const handleClose = () => {
    setDistance('');
    setError('');
    setCalibrationLine([]);
    setIsDrawing(false);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 print:hidden">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-11/12 md:w-1/3 border border-border">
        <h3 className="text-lg font-semibold mb-1">স্কেল নির্ধারণ করুন</h3>
        <p className="text-xs text-muted-foreground mb-4">ম্যাপের স্কেল বার অনুযায়ী দূরত্ব নির্বাচন করুন</p>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SCALE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant={Number(distance) === preset.valueFt ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset.valueFt)}
              title={preset.description}
            >
              <span>{preset.label}</span>
              {preset.recommended && (
                <span className="opacity-70 font-bold">&#9733;</span>
              )}
            </Button>
          ))}
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs text-muted-foreground">
            <span className="bg-card px-2">অথবা নিজে লিখুন</span>
          </div>
        </div>

        <Input
          type="number"
          value={distance}
          onChange={(e) => { setDistance(e.target.value); setError(''); }}
          placeholder="যেমন: ৬৬০ (ফুট)"
          className="mb-1"
          min="0"
          step="any"
        />
        {error && <p className="text-sm text-destructive mb-2">{error}</p>}
        <div className="flex justify-end gap-4">
          <Button size="sm" variant="outline" onClick={handleClose}>বাতিল করুন</Button>
          <Button size="sm" onClick={handleSubmit}>জমা দিন</Button>
        </div>
      </div>
    </div>
  );
};
