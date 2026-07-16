'use client';

import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import Link from 'next/link';
import {
  MousePointer2, PenLine, Hand, Undo2, Redo2, Trash2,
  CheckSquare, RotateCcw, FileDown, Download, ArrowLeft,
  MoreHorizontal, Settings2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTracerStore } from '../store/useTracerStore';
import { exportAsPDF, exportAsPNG } from '../utils/exportTracer';

const MODES = [
  { id: 'select'  as const, icon: MousePointer2, label: 'নির্বাচন',  title: 'Select mode (V)' },
  { id: 'polygon' as const, icon: PenLine,        label: 'পলিগন',      title: 'Draw polygon (P)' },
  { id: 'pan'     as const, icon: Hand,            label: 'প্যান',       title: 'Pan mode (Space)' },
] as const;

export const TracerToolbar = memo(function TracerToolbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
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

  return (
    <div 
      className="absolute z-40 flex items-center overflow-x-auto whitespace-nowrap shadow-xl md:shadow-sm transition-all
        md:top-0 md:bottom-auto md:left-0 md:right-72 md:translate-x-0 md:w-auto md:h-12 md:bg-background/95 md:border-b md:border-border md:border-t-0 md:border-x-0 md:rounded-none md:px-3 md:gap-2
        bottom-4 top-auto left-1/2 -translate-x-1/2 w-max max-w-[95vw] bg-card/95 border border-border rounded-2xl p-1.5 gap-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Back & Settings */}
      <div className="flex items-center gap-1 shrink-0 mr-1">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/tools" />}
          className="gap-1.5 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">টুলস</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onToggleSidebar}
          className="flex md:hidden px-2 text-muted-foreground"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Mode buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {MODES.map(({ id, icon: Icon, label, title }) => (
          <Button
            key={id}
            variant={mode === id ? 'default' : 'ghost'}
            onClick={() => setMode(id)}
            title={title}
            className={`gap-1.5 px-2.5 ${mode !== id ? 'text-muted-foreground' : ''}`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Drawing actions */}
      {pendingPoints.length >= 3 && (
        <Button
          onClick={commitPolygon}
          className="gap-1.5 bg-green-600 text-white hover:bg-green-700 shrink-0"
        >
          <CheckSquare className="w-4 h-4" />
          বন্ধ করুন
        </Button>
      )}
      {pendingPoints.length > 0 && (
        <Button
          variant="ghost"
          onClick={cancelDrawing}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          বাতিল (Esc)
        </Button>
      )}

      {/* Delete selected */}
      {selectedPolygonId && selectedLayerId && (
        <Button
          variant="ghost"
          onClick={() => deletePolygon(selectedLayerId, selectedPolygonId)}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
        >
          <Trash2 className="w-4 h-4" />
          মুছুন
        </Button>
      )}

      {/* ── Separator before history — only when there's content to separate ── */}
      {(pendingPoints.length > 0 || (selectedPolygonId && selectedLayerId)) && (
        <Separator orientation="vertical" className="h-6 shrink-0" />
      )}

      {/* Undo / redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          onClick={undo}
          disabled={past.length === 0}
          title="আনডু (Ctrl+Z)"
          className="px-2 text-muted-foreground"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={redo}
          disabled={future.length === 0}
          title="রিডু (Ctrl+Y)"
          className="px-2 text-muted-foreground"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      {/* Desktop Export */}
      <div className="hidden md:flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          onClick={() => exportAsPDF(layers, backgroundImage)}
          title="PDF ডাউনলোড করুন"
          className="gap-1.5 text-muted-foreground"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </Button>
        <Button
          variant="ghost"
          onClick={() => exportAsPNG(layers, backgroundImage)}
          title="PNG ডাউনলোড করুন"
          className="gap-1.5 text-muted-foreground"
        >
          <Download className="w-4 h-4" />
          PNG
        </Button>
      </div>

      {/* Desktop Reset */}
      <div className="hidden md:block ml-auto shrink-0">
        <Button
          variant="ghost"
          onClick={reset}
          title="সব মুছুন"
          className="px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Mobile More Actions Dropdown */}
      <div className="flex md:hidden ml-auto shrink-0 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger nativeButton={false} render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
            <Button variant="ghost" className="px-2 text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            alignOffset={-10}
            sideOffset={12}
            className="w-fit p-1"
          >
            <div className="flex flex-row gap-1">
              <Button variant="ghost" onClick={() => exportAsPNG(layers, backgroundImage)} title="PNG ডাউনলোড করুন" className="w-9 h-9 p-0 text-muted-foreground">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={() => exportAsPDF(layers, backgroundImage)} title="PDF ডাউনলোড করুন" className="w-9 h-9 p-0 text-muted-foreground">
                <FileDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={reset} title="সব মুছুন" className="w-9 h-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
