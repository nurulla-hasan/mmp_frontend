'use client';

import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import Link from 'next/link';
import {
  MousePointer2, PenLine, Hand, Undo2, Redo2, Trash2,
  CheckSquare, RotateCcw, FileDown, Download, ArrowLeft,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTracerStore } from '../store/useTracerStore';
import { exportAsPDF, exportAsPNG } from '../utils/exportTracer';

const MODES = [
  { id: 'select'  as const, icon: MousePointer2, label: 'নির্বাচন',  title: 'Select mode (V)' },
  { id: 'polygon' as const, icon: PenLine,        label: 'পলিগন',      title: 'Draw polygon (P)' },
  { id: 'pan'     as const, icon: Hand,            label: 'প্যান',       title: 'Pan mode (Space)' },
] as const;

export const TracerToolbar = memo(function TracerToolbar() {
  const {
    mode, setMode,
    pendingPoints, commitPolygon, cancelDrawing,
    selectedPolygonId, selectedLayerId, deletePolygon,
    past, future, undo, redo,
    backgroundImage, layers,
    reset,
  } = useTracerStore(useShallow(s => ({
    mode: s.mode,
    setMode: s.setMode,
    pendingPoints: s.pendingPoints,
    commitPolygon: s.commitPolygon,
    cancelDrawing: s.cancelDrawing,
    selectedPolygonId: s.selectedPolygonId,
    selectedLayerId: s.selectedLayerId,
    deletePolygon: s.deletePolygon,
    past: s.past,
    future: s.future,
    undo: s.undo,
    redo: s.redo,
    backgroundImage: s.backgroundImage,
    layers: s.layers,
    reset: s.reset,
  })));

  // Status bar text
  const statusText = mode === 'polygon' && pendingPoints.length > 0
    ? `${pendingPoints.length} পয়েন্ট`
    : null;

  return (
    <div className="absolute top-0 left-0 right-0 md:right-72 h-12 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-3 gap-2 z-30 shadow-sm overflow-x-auto">
      {/* Back */}
      <Link
        href="/tools"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs shrink-0 mr-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        টুলস
      </Link>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Mode buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {MODES.map(({ id, icon: Icon, label, title }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            title={title}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              mode === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Drawing actions */}
      {pendingPoints.length >= 3 && (
        <button
          onClick={commitPolygon}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          বন্ধ করুন
        </button>
      )}
      {pendingPoints.length > 0 && (
        <button
          onClick={cancelDrawing}
          className="text-xs px-2 py-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          বাতিল (Esc)
        </button>
      )}

      {/* Delete selected */}
      {selectedPolygonId && selectedLayerId && (
        <button
          onClick={() => deletePolygon(selectedLayerId, selectedPolygonId)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          মুছুন
        </button>
      )}

      {/* ── Separator before history — only when there's content to separate ── */}
      {(pendingPoints.length > 0 || (selectedPolygonId && selectedLayerId)) && (
        <Separator orientation="vertical" className="h-6 shrink-0" />
      )}

      {/* Undo / redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={undo}
          disabled={past.length === 0}
          title="আনডু (Ctrl+Z)"
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          title="রিডু (Ctrl+Y)"
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Export */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => exportAsPDF(layers, backgroundImage)}
          title="PDF ডাউনলোড করুন"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <FileDown className="w-3.5 h-3.5" />
          PDF
        </button>
        <button
          onClick={() => exportAsPNG(layers, backgroundImage)}
          title="PNG ডাউনলোড করুন"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          PNG
        </button>
      </div>

      {/* Reset */}
      <div className="ml-auto shrink-0">
        <button
          onClick={reset}
          title="সব মুছুন"
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
