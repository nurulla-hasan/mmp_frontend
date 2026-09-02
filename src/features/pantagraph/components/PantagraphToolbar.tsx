'use client';

import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  Lock,
  LockOpen,
  AlignStartVertical,
  Wand2,
  Crosshair,
  ImageDown,
  Settings2,
  FileDown,
  MoreHorizontal,
  RotateCcw,
  Undo2,
  Redo2,
} from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePantagraphStore } from '../store/usePantagraphStore';

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
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: 'md' | 'sm';
  id?: string;
}) {
  return (
    <ToolTip label={label} side={size === 'md' ? 'left' : 'top'}>
      <Button
        id={id}
        variant={active ? 'default' : 'ghost'}
        size={size === 'md' ? 'icon-lg' : 'icon'}
        onClick={onClick}
        disabled={disabled}
        className={active ? '' : 'text-muted-foreground'}
      >
        <Icon className={size === 'md' ? 'size-5' : 'size-4'} />
      </Button>
    </ToolTip>
  );
});

const VDivider = () => <div className="my-0.5 h-px w-6 bg-border/60" />;
const HDivider = () => <div className="mx-0.5 h-6 w-px bg-border/60" />;

interface PantagraphToolbarProps {
  onToggleSidebar?: () => void;
}

export const PantagraphToolbar = memo(function PantagraphToolbar({
  onToggleSidebar,
}: PantagraphToolbarProps) {
  const {
    isLocked,
    isAligning,
    matchPoints,
    formerMap,
    currentMap,
    setIsLocked,
    applyAlignment,
    redoStack,
    removeLastMatchPoint,
    restoreLastMatchPoint,
  } = usePantagraphStore(
    useShallow((s) => ({
      isLocked: s.isLocked,
      isAligning: s.isAligning,
      matchPoints: s.matchPoints,
      redoStack: s.redoStack,
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      setIsLocked: s.setIsLocked,
      applyAlignment: s.applyAlignment,
      removeLastMatchPoint: s.removeLastMatchPoint,
      restoreLastMatchPoint: s.restoreLastMatchPoint,
    })),
  );

  const hasAnyMap = !!formerMap || !!currentMap;
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
      console.error(
        'Similarity alignment failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
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
      console.error(
        'Affine alignment failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }, [canAffine, matchPoints, applyAlignment]);

  const handleToggleAligning = useCallback(() => {
    usePantagraphStore.getState().setIsAligning(!isAligning);
  }, [isAligning]);

  const tools = {
    settings: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Settings2}
        label="Maps & Settings"
        onClick={() => onToggleSidebar?.()}
        size={size}
      />
    ),
    align: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Crosshair}
        label={isAligning ? 'Exit Point Mode' : 'Match Points'}
        active={isAligning}
        onClick={handleToggleAligning}
        size={size}
      />
    ),
    similarity: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={AlignStartVertical}
        label={`Similarity (${pairedCount}/2)`}
        disabled={!canSimilarity}
        onClick={handleSimilarity}
        size={size}
      />
    ),
    affine: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Wand2}
        label={`Affine (${pairedCount}/3)`}
        disabled={!canAffine}
        onClick={handleAffine}
        size={size}
      />
    ),
    lock: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={isLocked ? Lock : LockOpen}
        label={isLocked ? 'Unlock' : 'Lock'}
        onClick={() => setIsLocked(!isLocked)}
        size={size}
      />
    ),
    png: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={ImageDown}
        label="Save PNG"
        disabled={!hasAnyMap}
        onClick={() => usePantagraphStore.getState().exportMap('png')}
        size={size}
      />
    ),
    pdf: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={FileDown}
        label="Save PDF"
        disabled={!hasAnyMap}
        onClick={() => usePantagraphStore.getState().exportMap('pdf')}
        size={size}
      />
    ),
    undo: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Undo2}
        label="Undo"
        disabled={matchPoints.length === 0}
        onClick={removeLastMatchPoint}
        size={size}
      />
    ),
    redo: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Redo2}
        label="Redo"
        disabled={redoStack.length === 0}
        onClick={restoreLastMatchPoint}
        size={size}
      />
    ),
    reset: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={RotateCcw}
        label="Clear All"
        onClick={() => usePantagraphStore.getState().reset()}
        size={size}
      />
    ),
  };

  return (
    <>
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        {tools.settings()}
        <VDivider />
        {tools.align()}
        {tools.similarity()}
        {tools.affine()}
        <VDivider />
        {tools.undo()}
        {tools.redo()}
        <VDivider />
        {tools.lock()}
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
        {tools.align('sm')}
        {tools.similarity('sm')}
        {tools.affine('sm')}
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
            <Button variant="ghost" className="px-2 text-muted-foreground">
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
              {tools.lock('sm')}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => usePantagraphStore.getState().exportMap('png')}
                disabled={!hasAnyMap}
                title="Download PNG"
                className="text-muted-foreground"
              >
                <ImageDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => usePantagraphStore.getState().exportMap('pdf')}
                disabled={!hasAnyMap}
                title="Download PDF"
                className="text-muted-foreground"
              >
                <FileDown className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => usePantagraphStore.getState().reset()}
                title="Clear All"
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
