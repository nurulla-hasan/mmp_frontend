'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import type { PlotRecord, Point } from '@/features/land-measurement/types/map';
import {
  clearLandMeasurementDraft,
  getDraftMap,
  getLandMeasurementDraft,
  saveDraftMap,
  saveLandMeasurementDraft,
} from '@/features/land-measurement/utils/localMapStorage';

const AUTOSAVE_DELAY_MS = 700;

export function DraftRecovery() {
  const {
    selectedFile,
    imageName,
    plots,
    plotPoints,
    scale,
    processFile,
    setPlots,
    setPlotPoints,
    setScale,
  } = useMapStore(
    useShallow((state) => ({
      selectedFile: state.selectedFile,
      imageName: state.imageName,
      plots: state.plots,
      plotPoints: state.plotPoints,
      scale: state.scale,
      processFile: state.processFile,
      setPlots: state.setPlots,
      setPlotPoints: state.setPlotPoints,
      setScale: state.setScale,
    })),
  );

  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const checkedRef = useRef(false);
  const persistedFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    let active = true;
    void getLandMeasurementDraft()
      .then((draft) => {
        if (!active || !draft) return;
        const hasWork = draft.plots.length > 0 || draft.plotPoints.length > 0;
        if (hasWork) setRecoveryOpen(true);
      })
      .catch((error: unknown) => {
        console.error('Could not inspect land measurement draft:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const hasWork = plots.length > 0 || plotPoints.length > 0;
    if (!selectedFile || !hasWork) {
      if (!hasWork) {
        void clearLandMeasurementDraft().catch((error: unknown) => {
          console.error('Could not clear land measurement draft:', error);
        });
      }
      return;
    }

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          if (persistedFileRef.current !== selectedFile) {
            await saveDraftMap(selectedFile);
            persistedFileRef.current = selectedFile;
          }
          await saveLandMeasurementDraft({
            version: 1,
            savedAt: Date.now(),
            mapName: selectedFile.name || imageName || 'Mouza map',
            scale,
            plots,
            plotPoints,
          });
        } catch (error: unknown) {
          console.error('Could not autosave land measurement draft:', error);
        }
      })();
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [imageName, plotPoints, plots, scale, selectedFile]);

  const discardDraft = async () => {
    setRecoveryOpen(false);
    try {
      await clearLandMeasurementDraft();
    } catch (error: unknown) {
      console.error('Could not discard land measurement draft:', error);
    }
  };

  const recoverDraft = async () => {
    setIsRecovering(true);
    try {
      const [draft, mapFile] = await Promise.all([
        getLandMeasurementDraft(),
        getDraftMap(),
      ]);
      if (!draft || !mapFile) {
        await clearLandMeasurementDraft();
        setRecoveryOpen(false);
        return;
      }

      const loaded = await processFile(mapFile);
      if (!loaded) return;

      setScale(draft.scale);
      setPlots(draft.plots as PlotRecord[]);
      setPlotPoints(draft.plotPoints as Point[]);
      persistedFileRef.current = mapFile;
      setRecoveryOpen(false);
    } catch (error: unknown) {
      console.error('Could not recover land measurement draft:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Dialog open={recoveryOpen} onOpenChange={setRecoveryOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>অসমাপ্ত কাজ পাওয়া গেছে</DialogTitle>
          <DialogDescription>
            আগেরবার Land Measurement শেষ করার আগে ব্রাউজার বন্ধ হয়েছিল। এই ডিভাইসে রাখা draft থেকে map, scale এবং plot আবার চালু করতে পারেন।
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={discardDraft} disabled={isRecovering}>
            <Trash2 />
            বাদ দিন
          </Button>
          <Button onClick={recoverDraft} loading={isRecovering} loadingText="খোলা হচ্ছে...">
            <RotateCcw />
            আগের কাজ চালু করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
