'use client';

import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useRouter } from 'next/navigation';
import {
  MousePointer2, PenLine, Hand, Undo2, Redo2, Trash2,
  CheckSquare, RotateCcw, FileDown, Download, ArrowLeft,
  MoreHorizontal, Settings2, Ban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTracerStore } from '../store/useTracerStore';
import { exportAsPDF, exportAsPNG } from '../utils/exportTracer';

// --- Tooltip wrapper ---------------------------------------------------------
const ToolTip = memo(function ToolTip({ label, children, side = "left" }: { label: React.ReactNode; children: React.ReactNode; side?: "left" | "top" | "right" | "bottom" }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
});

// --- Floating Tool Button ----------------------------------------------------
const ToolBtn = memo(function ToolBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  size = 'md',
  id,
  variant = 'ghost',
  className = ''
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  id?: string;
  variant?: 'default' | 'ghost' | 'destructive';
  className?: string;
}) {
  const actualVariant = active ? "default" : variant;
  const sizeClass = size === 'md' ? "icon-lg" : "icon";
  return (
    <ToolTip label={label} side={size === 'md' ? 'left' : 'top'}>
      <Button
        id={id}
        variant={actualVariant}
        size={sizeClass}
        onClick={onClick}
        disabled={disabled}
        className={`${active ? "" : "text-muted-foreground"} ${className}`}
      >
        <Icon className={size === 'md' ? "w-5 h-5" : "w-4 h-4"} />
      </Button>
    </ToolTip>
  );
});

// --- Divider -----------------------------------------------------------------
const VDivider = () => <div className="h-px w-6 bg-border/60 my-0.5 shrink-0" />;
const HDivider = () => <div className="w-px h-6 bg-border/60 mx-0.5 shrink-0" />;

export const TracerToolbar = memo(function TracerToolbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter();
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

  const tools = {
    back: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={ArrowLeft} label="টুলস" onClick={() => router.push('/tools')} size={size} />
    ),
    settings: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Settings2} label="ট্রেসার সেটিংস" onClick={() => onToggleSidebar?.()} size={size} />
    ),
    select: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={MousePointer2} label="নির্বাচন (V)" active={mode === 'select'} onClick={() => setMode('select')} size={size} />
    ),
    polygon: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={PenLine} label="পলিগন (P)" active={mode === 'polygon'} onClick={() => setMode('polygon')} size={size} />
    ),
    pan: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Hand} label="প্যান (Space)" active={mode === 'pan'} onClick={() => setMode('pan')} size={size} />
    ),
    commit: (size: 'md' | 'sm' = 'md') => pendingPoints.length >= 3 ? (
      <ToolBtn icon={CheckSquare} label="বন্ধ করুন" onClick={commitPolygon} size={size} className="text-green-600 hover:text-green-700 hover:bg-green-600/10" />
    ) : null,
    cancel: (size: 'md' | 'sm' = 'md') => pendingPoints.length > 0 ? (
      <ToolBtn icon={Ban} label="বাতিল (Esc)" onClick={cancelDrawing} size={size} className="text-destructive hover:text-destructive hover:bg-destructive/10" />
    ) : null,
    delete: (size: 'md' | 'sm' = 'md') => (selectedPolygonId && selectedLayerId) ? (
      <ToolBtn icon={Trash2} label="মুছুন" onClick={() => deletePolygon(selectedLayerId, selectedPolygonId)} size={size} className="text-destructive hover:text-destructive hover:bg-destructive/10" />
    ) : null,
    undo: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Undo2} label="আনডু (Ctrl+Z)" disabled={past.length === 0} onClick={undo} size={size} />
    ),
    redo: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Redo2} label="রিডু (Ctrl+Y)" disabled={future.length === 0} onClick={redo} size={size} />
    ),
    png: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Download} label="PNG ডাউনলোড করুন" onClick={() => exportAsPNG(layers, backgroundImage)} size={size} />
    ),
    pdf: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={FileDown} label="PDF ডাউনলোড করুন" onClick={() => exportAsPDF(layers, backgroundImage)} size={size} />
    ),
    reset: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={RotateCcw} label="সব মুছুন" onClick={reset} size={size} className="hover:text-destructive hover:bg-destructive/10" />
    ),
  };

  return (
    <>
      {/* -- Desktop: floating right panel ------------------------------------ */}
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        {tools.back()}
        {tools.settings()}
        <VDivider />
        {tools.select()}
        {tools.polygon()}
        {tools.pan()}
        {pendingPoints.length > 0 && <VDivider />}
        {tools.commit()}
        {tools.cancel()}
        {(selectedPolygonId && selectedLayerId) && (
          <>
            <VDivider />
            {tools.delete()}
          </>
        )}
        <VDivider />
        {tools.undo()}
        {tools.redo()}
        <VDivider />
        {tools.png()}
        {tools.pdf()}
        <VDivider />
        {tools.reset()}
      </div>

      {/* -- Mobile: floating bottom bar ------------------------------------- */}
      <div 
        className="absolute bottom-4 left-1/2 z-40 w-max max-w-[95vw] flex md:hidden -translate-x-1/2 overflow-x-auto whitespace-nowrap items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tools.back('sm')}
        {tools.settings('sm')}
        <HDivider />
        {tools.select('sm')}
        {tools.polygon('sm')}
        {tools.pan('sm')}
        
        {pendingPoints.length > 0 && <HDivider />}
        {tools.commit('sm')}
        {tools.cancel('sm')}
        
        {(selectedPolygonId && selectedLayerId) && (
          <>
            <HDivider />
            {tools.delete('sm')}
          </>
        )}
        
        <HDivider />
        {tools.undo('sm')}
        {tools.redo('sm')}

        <HDivider />
        <DropdownMenu>
          <DropdownMenuTrigger nativeButton={false} render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" alignOffset={-10} sideOffset={12} className="w-fit p-1">
            <div className="flex flex-row gap-1">
              <Button variant="ghost" size="icon" onClick={() => exportAsPNG(layers, backgroundImage)} title="PNG ডাউনলোড করুন" className="text-muted-foreground">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => exportAsPDF(layers, backgroundImage)} title="PDF ডাউনলোড করুন" className="text-muted-foreground">
                <FileDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={reset} title="সব মুছুন" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
});
