'use client';

import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Lock,
  LockOpen,
  AlignStartVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Crosshair,
  ArrowLeft,
  Menu,
} from 'lucide-react';

interface PantagraphToolbarProps {
  onOpenSidebar?: () => void;
}

export const PantagraphToolbar = memo(function PantagraphToolbar({ onOpenSidebar }: PantagraphToolbarProps) {
  const {
    isLocked,
    isAligning,
    matchPoints,
    formerMap,
    currentMap,
    setIsLocked,
    applyAlignment,
  } = usePantagraphStore(
    useShallow((s) => ({
      isLocked: s.isLocked,
      isAligning: s.isAligning,
      matchPoints: s.matchPoints,
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      setIsLocked: s.setIsLocked,
      applyAlignment: s.applyAlignment,
    }))
  );

  const hasAnyMap = !!formerMap || !!currentMap;

  // Count fully paired points (both former and current placed)
  const pairedCount = matchPoints.filter((p) => p.current !== null).length;
  const canSimilarity = pairedCount >= 2;
  const canAffine = pairedCount >= 3;

  const handleSimilarity = useCallback(async () => {
    if (!canSimilarity) return;

    const pairedPoints = matchPoints.filter((p) => p.current !== null);
    const { computeSimilarity } = await import('../utils/similarity');

    const former = pairedPoints.map((p) => p.former);
    const current = pairedPoints.map((p) => p.current!);

    try {
      const result = computeSimilarity(former, current);
      applyAlignment({ ...result, type: 'similarity' });
    } catch (error: unknown) {
      console.error('Similarity alignment failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [canSimilarity, matchPoints, applyAlignment]);

  const handleAffine = useCallback(async () => {
    if (!canAffine) return;

    const pairedPoints = matchPoints.filter((p) => p.current !== null);
    const { computeAffine } = await import('../utils/affine');

    const former = pairedPoints.map((p) => p.former);
    const current = pairedPoints.map((p) => p.current!);

    try {
      const result = computeAffine(former, current);
      applyAlignment({ ...result, type: 'affine' });
    } catch (error: unknown) {
      console.error('Affine alignment failed:', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [canAffine, matchPoints, applyAlignment]);

  const handleToggleAligning = useCallback(() => {
    usePantagraphStore.getState().setIsAligning(!isAligning);
  }, [isAligning]);

  return (
    <div className="absolute top-0 left-0 right-0 md:right-72 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-3 gap-1.5 z-30 shadow-sm overflow-x-auto no-scrollbar whitespace-nowrap">
      {/* Back */}
      <Link
        href="/tools"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs shrink-0 mr-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        টুলস
      </Link>

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

        {/* Similarity align button — 2+ points */}
        <Button
          variant={!canSimilarity ? 'outline' : 'default'}
          size="sm"
          disabled={!canSimilarity}
          onClick={handleSimilarity}
        >
          <AlignStartVertical className="w-3.5 h-3.5 mr-1" />
          সিমিলারিটি ({pairedCount}/২)
        </Button>

        {/* Affine align button — 3+ points */}
        <Button
          variant={!canAffine ? 'outline' : 'default'}
          size="sm"
          disabled={!canAffine}
          onClick={handleAffine}
        >
          <AlignStartVertical className="w-3.5 h-3.5 mr-1" />
          আফাইন ({pairedCount}/৩)
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
        {/* Save as PDF */}
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasAnyMap}
          onClick={() => usePantagraphStore.getState().saveAsPDF()}
          title="PDF হিসেবে সংরক্ষণ করুন"
        >
          <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          PDF
        </Button>
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

      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onOpenSidebar}
      >
        <Menu className="w-4 h-4" />
      </Button>
    </div>
  );
});
