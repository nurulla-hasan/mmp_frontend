'use client';

import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import {
  Lock,
  LockOpen,
  AlignStartVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Crosshair,
  ArrowLeft,
  ImageDown,
  Settings2,
  FileDown,
  MoreHorizontal
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// ─── Tooltip wrapper ─────────────────────────────────────────────────────────
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

// ─── Floating Tool Button ────────────────────────────────────────────────────
const ToolBtn = memo(function ToolBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  size = 'md',
  id
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
        variant={active ? "default" : "ghost"}
        size={size === 'md' ? "icon-lg" : "icon"}
        onClick={onClick}
        disabled={disabled}
        className={active ? "" : "text-muted-foreground"}
      >
        <Icon className={size === 'md' ? "w-5 h-5" : "w-4 h-4"} />
      </Button>
    </ToolTip>
  );
});

// ─── Divider ─────────────────────────────────────────────────────────────────
const VDivider = () => <div className="h-px w-6 bg-border/60 my-0.5" />;
const HDivider = () => <div className="w-px h-6 bg-border/60 mx-0.5" />;

interface PantagraphToolbarProps {
  onToggleSidebar?: () => void;
}

export const PantagraphToolbar = memo(function PantagraphToolbar({ onToggleSidebar }: PantagraphToolbarProps) {
  const router = useRouter();
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

  const tools = {
    back: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={ArrowLeft} label="টুলস" onClick={() => router.push('/tools')} size={size} />
    ),
    settings: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Settings2} label="ম্যাপ ও সেটিংস" onClick={() => onToggleSidebar?.()} size={size} />
    ),
    align: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Crosshair} label={isAligning ? 'পয়েন্ট মোড বন্ধ' : 'পয়েন্ট মেলাও'} active={isAligning} onClick={handleToggleAligning} size={size} />
    ),
    similarity: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={AlignStartVertical} label={`সিমিলারিটি (${pairedCount}/২)`} disabled={!canSimilarity} onClick={handleSimilarity} size={size} />
    ),
    affine: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={AlignStartVertical} label={`আফাইন (${pairedCount}/৩)`} disabled={!canAffine} onClick={handleAffine} size={size} />
    ),
    lock: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={isLocked ? Lock : LockOpen} label={isLocked ? 'আনলক' : 'লক'} onClick={() => setIsLocked(!isLocked)} size={size} />
    ),
    png: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={ImageDown} label="PNG সেভ করুন" disabled={!hasAnyMap} onClick={() => usePantagraphStore.getState().exportMap('png')} size={size} />
    ),
    pdf: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={FileDown} label="PDF সেভ করুন" disabled={!hasAnyMap} onClick={() => usePantagraphStore.getState().exportMap('pdf')} size={size} />
    ),
    zoomIn: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={ZoomIn} label="জুম ইন" onClick={() => usePantagraphStore.getState().setStageScale(s => Math.min(10, s * 1.25))} size={size} />
    ),
    zoomOut: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={ZoomOut} label="জুম আউট" onClick={() => usePantagraphStore.getState().setStageScale(s => Math.max(0.01, s * 0.8))} size={size} />
    ),
    fit: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn icon={Maximize} label="ফিট" onClick={() => { usePantagraphStore.getState().setStageScale(1); usePantagraphStore.getState().setStagePos({ x: 0, y: 0 }); }} size={size} />
    ),
  };

  return (
    <>
      {/* ── Desktop: floating right panel ─────────────────────────────────── */}
      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        {tools.back()}
        {tools.settings()}
        <VDivider />
        {tools.align()}
        {tools.similarity()}
        {tools.affine()}
        <VDivider />
        {tools.zoomIn()}
        {tools.zoomOut()}
        {tools.fit()}
        <VDivider />
        {tools.lock()}
        {tools.png()}
        {tools.pdf()}
      </div>

      {/* ── Mobile: floating bottom bar ───────────────────────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 z-40 w-max max-w-[95vw] flex md:hidden -translate-x-1/2 overflow-x-auto whitespace-nowrap items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tools.back('sm')}
        {tools.settings('sm')}
        <HDivider />
        {tools.align('sm')}
        {tools.similarity('sm')}
        {tools.affine('sm')}
        <HDivider />
        {tools.zoomIn('sm')}
        {tools.zoomOut('sm')}

        <HDivider />
        <DropdownMenu>
          <DropdownMenuTrigger nativeButton={false} render={<div className="inline-flex" />} className="focus-visible:outline-none focus:outline-none">
            <Button variant="ghost" className="px-2 text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" alignOffset={-10} sideOffset={12} className="w-fit p-1">
            <div className="flex flex-row gap-1">
              <Button variant="ghost" size="icon" onClick={() => { usePantagraphStore.getState().setStageScale(1); usePantagraphStore.getState().setStagePos({ x: 0, y: 0 }); }} title="ফিট" className="text-muted-foreground">
                <Maximize className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsLocked(!isLocked)} title={isLocked ? "আনলক করুন" : "লক করুন"} className="text-muted-foreground">
                {isLocked ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => usePantagraphStore.getState().exportMap('png')} disabled={!hasAnyMap} title="PNG ডাউনলোড করুন" className="text-muted-foreground">
                <ImageDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => usePantagraphStore.getState().exportMap('pdf')} disabled={!hasAnyMap} title="PDF ডাউনলোড করুন" className="text-muted-foreground">
                <FileDown className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
});
