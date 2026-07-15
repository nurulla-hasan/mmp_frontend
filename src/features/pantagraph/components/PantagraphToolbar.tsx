'use client';

import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import {
  Lock,
  LockOpen,
  AlignStartVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Crosshair,
} from 'lucide-react';

export const PantagraphToolbar = memo(function PantagraphToolbar() {
  const {
    isLocked,
    isAligning,
    matchPoints,
    setIsLocked,
    applyAlignment,
  } = usePantagraphStore(
    useShallow((s) => ({
      isLocked: s.isLocked,
      isAligning: s.isAligning,
      matchPoints: s.matchPoints,
      setIsLocked: s.setIsLocked,
      applyAlignment: s.applyAlignment,
    }))
  );

  // Count fully paired points (both former and current placed)
  const pairedCount = matchPoints.filter((p) => p.current !== null).length;
  const canAlign = pairedCount >= 4;

  const handleAlign = useCallback(async () => {
    if (!canAlign) return;

    // Filter only fully paired points
    const pairedPoints = matchPoints.filter((p) => p.current !== null);

    // Dynamic import to keep initial bundle small
    const { computeSimilarity } = await import('../utils/similarity');

    const former = pairedPoints.map((p) => p.former);
    const current = pairedPoints.map((p) => p.current!); // non-null asserted since filtered

    try {
      const result = computeSimilarity(former, current);
      applyAlignment(result); // syncs store + sidebar values
    } catch (error: unknown) {
      console.error('Alignment failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [canAlign, matchPoints, applyAlignment]);

  const handleToggleAligning = useCallback(() => {
    usePantagraphStore.getState().setIsAligning(!isAligning);
  }, [isAligning]);

  return (
    <div className="absolute top-0 left-0 right-0 md:right-72 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-3 gap-1.5 z-30 shadow-sm">
      {/* Logo / Title */}
      <div className="flex items-center gap-2 mr-3">
        <Logo size="sm" />
        <span className="text-sm font-semibold text-foreground hidden sm:inline font-heading">
          প্যান্টাগ্রাফ
        </span>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alignment mode toggle */}
      <div className="flex items-center gap-1">
        <Button
          variant={isAligning ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleAligning}
        >
          <Crosshair className="w-3.5 h-3.5 mr-1" />
          {isAligning ? 'পয়েন্ট মোড চালু' : 'পয়েন্ট মেলাও'}
        </Button>

        {/* Align button */}
        <Button
          variant={canAlign ? 'default' : 'outline'}
          size="sm"
          disabled={!canAlign}
          onClick={handleAlign}
        >
          <AlignStartVertical className="w-3.5 h-3.5 mr-1" />
          অ্যালাইন ({pairedCount}/৪)
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lock toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsLocked(!isLocked)}
      >
        {isLocked ? (
          <Lock className="w-4 h-4" />
        ) : (
          <LockOpen className="w-4 h-4" />
        )}
      </Button>

      {/* Zoom controls — pushed to right */}
      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            const store = usePantagraphStore.getState();
            store.setStageScale(store.stageScale * 0.8);
          }}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            const store = usePantagraphStore.getState();
            store.setStageScale(store.stageScale * 1.25);
          }}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            usePantagraphStore.getState().setStageScale(1);
            usePantagraphStore.getState().setStagePos({ x: 0, y: 0 });
          }}
        >
          <Maximize className="w-3.5 h-3.5 mr-1" />
          ফিট
        </Button>
      </div>
    </div>
  );
});
