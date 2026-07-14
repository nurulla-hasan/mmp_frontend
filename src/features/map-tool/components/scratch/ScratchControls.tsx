import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Check, Trash2, Scissors, FileDown, X } from 'lucide-react';
import type { Point, ScratchLine } from '@/features/map-tool/types/map';

type ScratchControlsProps = {
  lines: ScratchLine[];
  draft: Point | null;
  hasSelectedPlots: boolean;
  isDrawingActive: boolean;
  addCenterPoint: () => void;
  undoScratchPoint: () => void;
  redoScratchPoint: () => void;
  canRedoScratch: boolean;
  finishScratchChain: () => void;
  clearAll: () => void;
  downloadPdf: () => void;
  isMobileSheet?: boolean;
  onCloseMobilePanel?: () => void;
};

export const ScratchControls = ({
  lines,
  draft,
  hasSelectedPlots,
  isDrawingActive,
  addCenterPoint,
  undoScratchPoint,
  redoScratchPoint,
  canRedoScratch,
  finishScratchChain,
  clearAll,
  downloadPdf,
  isMobileSheet = false,
  onCloseMobilePanel,
}: ScratchControlsProps) => {
  const handleAdd = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addCenterPoint();
  };
  const handleUndo = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    undoScratchPoint();
  };
  const handleRedo = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    redoScratchPoint();
  };
  const handleFinish = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    finishScratchChain();
  };
  const handleClear = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearAll();
  };
  const handleDownload = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    downloadPdf();
  };

  const addButtonText = (draft || isDrawingActive)
    ? 'পয়েন্ট যোগ করুন'
    : 'কাটা শুরু করুন';

  if (isMobileSheet) {
    if (!isDrawingActive && lines.length === 0 && !canRedoScratch) return null;
    return (
      <div className="fixed bottom-14 md:bottom-4 left-1/2 z-50 flex w-[93%] -translate-x-1/2 flex-wrap justify-center gap-2 rounded-lg border border-border bg-background p-3 shadow-xl md:w-auto">
        <Button size="icon-sm" className="shrink-0" variant="destructive" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCloseMobilePanel?.(); }} title="বন্ধ করুন">
          <X className="h-4 w-4" />
        </Button>
        <Button size="icon-sm" className="shrink-0" variant="outline" onClick={handleClear} onTouchEnd={handleClear} disabled={lines.length === 0 && !draft} title="সব মুছুন">
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button size="icon-sm" className="shrink-0" variant="secondary" onClick={handleUndo} onTouchEnd={handleUndo} disabled={lines.length === 0 && !draft} title="পূর্বাবস্থায় ফেরান">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button size="icon-sm" className="shrink-0" variant="outline" onClick={handleRedo} onTouchEnd={handleRedo} disabled={!canRedoScratch} title="পুনরায় ফেরান">
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button size="icon-sm" className="shrink-0" variant="outline" onClick={handleFinish} onTouchEnd={handleFinish} disabled={!isDrawingActive} title="কাটা শেষ">
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="default" onClick={handleAdd} onTouchEnd={handleAdd} disabled={!hasSelectedPlots} className="grow">{addButtonText}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isDrawingActive && (
        <Button size="icon" className="shrink-0" variant="default" onClick={handleAdd} onTouchEnd={handleAdd} disabled={!hasSelectedPlots} title="কাটা শুরু করুন">
          <Scissors className="w-4 h-4" />
        </Button>
      )}

      <Button size="icon" className="shrink-0" onClick={handleDownload} disabled={!hasSelectedPlots} title="পিডিএফ নিন">
        <FileDown className="w-4 h-4" />
      </Button>
    </div>
  );
};
