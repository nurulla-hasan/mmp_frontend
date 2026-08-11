'use client';

import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  MousePointer2,
  PenLine,
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  FileDown,
  Download,
  MoreHorizontal,
  Settings2,
  Type,
  Check,
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

const ToolTip = memo(function ToolTip({
  label,
  children,
  side = 'left',
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'top' | 'right' | 'bottom';
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="inline-flex" />}
        className="focus:outline-none focus-visible:outline-none"
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
});

const ToolBtn = memo(function ToolBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  size = 'md',
  id,
  variant = 'ghost',
  className = '',
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
  const actualVariant = active ? 'default' : variant;
  const sizeClass = size === 'md' ? 'icon-lg' : 'icon';

  return (
    <ToolTip label={label} side={size === 'md' ? 'left' : 'top'}>
      <Button
        id={id}
        variant={actualVariant}
        size={sizeClass}
        onClick={onClick}
        disabled={disabled}
        className={`${active ? '' : 'text-muted-foreground'} ${className}`}
      >
        <Icon className={size === 'md' ? 'size-5' : 'size-4'} />
      </Button>
    </ToolTip>
  );
});

const VDivider = () => <div className="my-0.5 h-px w-6 shrink-0 bg-border/60" />;
const HDivider = () => <div className="mx-0.5 h-6 w-px shrink-0 bg-border/60" />;

export const TracerToolbar = memo(function TracerToolbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const {
    mode,
    setMode,
    pendingPoints,
    commitPolygon,
    selectedPolygonId,
    selectedLabelId,
    selectedLayerId,
    deletePolygon,
    deleteLabel,
    past,
    future,
    undo,
    redo,
    undoPendingPoint,
    redoPendingPoint,
    pendingRedoPoints,
    backgroundImage,
    layers,
    reset,
  } = useTracerStore(
    useShallow((s) => ({
      mode: s.mode,
      setMode: s.setMode,
      pendingPoints: s.pendingPoints,
      commitPolygon: s.commitPolygon,
      selectedPolygonId: s.selectedPolygonId,
      selectedLabelId: s.selectedLabelId,
      selectedLayerId: s.selectedLayerId,
      deletePolygon: s.deletePolygon,
      deleteLabel: s.deleteLabel,
      past: s.past,
      future: s.future,
      undo: s.undo,
      redo: s.redo,
      undoPendingPoint: s.undoPendingPoint,
      redoPendingPoint: s.redoPendingPoint,
      pendingRedoPoints: s.pendingRedoPoints,
      backgroundImage: s.backgroundImage,
      layers: s.layers,
      reset: s.reset,
    })),
  );

  const tools = {
    settings: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Settings2}
        label="ট্রেসার সেটিংস"
        onClick={() => onToggleSidebar?.()}
        size={size}
      />
    ),
    select: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={MousePointer2}
        label="নির্বাচন (V)"
        active={mode === 'select'}
        onClick={() => setMode('select')}
        size={size}
      />
    ),
    polygon: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={PenLine}
        label="বাউন্ডারি লাইন (P)"
        active={mode === 'polygon'}
        onClick={() => setMode('polygon')}
        size={size}
      />
    ),
    label: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Type}
        label="দাগ নম্বর বসান (T)"
        active={mode === 'label'}
        onClick={() => setMode('label')}
        size={size}
      />
    ),
    finish: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Check}
        label="লাইন শেষ করুন (Enter)"
        onClick={commitPolygon}
        disabled={mode !== 'polygon' || pendingPoints.length < 2}
        size={size}
        className={mode === 'polygon' && pendingPoints.length >= 2 ? 'text-emerald-600' : ''}
      />
    ),
    delete: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Trash2}
        label="মুছুন"
        onClick={() => {
          if (!selectedLayerId) return;
          if (selectedLabelId) deleteLabel(selectedLayerId, selectedLabelId);
          else if (selectedPolygonId) deletePolygon(selectedLayerId, selectedPolygonId);
        }}
        disabled={(!selectedPolygonId && !selectedLabelId) || !selectedLayerId}
        size={size}
        className={
          (selectedPolygonId || selectedLabelId) && selectedLayerId
            ? 'text-destructive hover:bg-destructive/10 hover:text-destructive'
            : ''
        }
      />
    ),
    undo: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Undo2}
        label="আনডু (Ctrl+Z)"
        disabled={pendingPoints.length === 0 && past.length === 0}
        onClick={pendingPoints.length > 0 ? undoPendingPoint : undo}
        size={size}
      />
    ),
    redo: (size: 'md' | 'sm' = 'md') => {
      const canRedoPoint = pendingRedoPoints.length > 0;
      const canRedoGlobal = future.length > 0;
      return (
        <ToolBtn
          icon={Redo2}
          label="রিডু (Ctrl+Y)"
          disabled={!canRedoPoint && !canRedoGlobal}
          onClick={canRedoPoint ? redoPendingPoint : redo}
          size={size}
        />
      );
    },
    png: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Download}
        label="PNG ডাউনলোড করুন"
        onClick={() => exportAsPNG(layers, backgroundImage)}
        size={size}
      />
    ),
    pdf: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={FileDown}
        label="PDF ডাউনলোড করুন"
        onClick={() => exportAsPDF(layers, backgroundImage)}
        size={size}
      />
    ),
    reset: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={RotateCcw}
        label="সব মুছুন"
        onClick={reset}
        size={size}
        className="hover:bg-destructive/10 hover:text-destructive"
      />
    ),
  };

  return (
    <>
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        {tools.settings()}
        <VDivider />
        {tools.select()}
        {tools.polygon()}
        {tools.label()}
        {tools.finish()}
        {tools.delete()}
        <VDivider />
        {tools.undo()}
        {tools.redo()}
        <VDivider />
        {tools.png()}
        {tools.pdf()}
        <VDivider />
        {tools.reset()}
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-40 flex w-max max-w-[95vw] -translate-x-1/2 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl md:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tools.settings('sm')}
        <HDivider />
        {tools.select('sm')}
        {tools.polygon('sm')}
        {tools.label('sm')}
        {tools.finish('sm')}
        {tools.delete('sm')}
        <HDivider />
        {tools.undo('sm')}
        {tools.redo('sm')}
        <HDivider />
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={<div className="inline-flex" />}
            className="focus:outline-none focus-visible:outline-none"
          >
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreHorizontal className="size-4" />
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => exportAsPNG(layers, backgroundImage)}
                title="PNG ডাউনলোড করুন"
                className="text-muted-foreground"
              >
                <Download className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => exportAsPDF(layers, backgroundImage)}
                title="PDF ডাউনলোড করুন"
                className="text-muted-foreground"
              >
                <FileDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                title="সব মুছুন"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
});
