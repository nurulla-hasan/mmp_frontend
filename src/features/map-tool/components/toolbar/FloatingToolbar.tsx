'use client';

import { useRef } from 'react';
import {
  Upload, Ruler, PenTool, Scissors, Eye, EyeOff, Search,
  FileText, HelpCircle,
} from 'lucide-react';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { SaveProjectDialog } from '@/features/map-tool/components/SaveProjectDialog';

// ─── Tooltip wrapper ─────────────────────────────────────────────────────────
function ToolTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md ring-1 ring-border group-hover:block">
        {label}
      </span>
    </div>
  );
}

// ─── Icon button ─────────────────────────────────────────────────────────────
function ToolBtn({
  icon: Icon,
  label,
  onClick,
  active,
  disabled,
  variant = 'default',
  size = 'md',
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  size?: 'md' | 'sm';
}) {
  const dim = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <ToolTip label={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        className={[
          `flex ${dim} items-center justify-center rounded-xl transition-all`,
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          active
            ? 'bg-primary text-primary-foreground shadow-md'
            : variant === 'danger'
              ? 'text-destructive hover:bg-destructive/10'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          disabled ? 'pointer-events-none opacity-40' : '',
        ].join(' ')}
      >
        <Icon className={iconSize} />
      </button>
    </ToolTip>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function VDivider() {
  return <div className="my-1 h-px w-7 self-center bg-border" />;
}
function HDivider() {
  return <div className="mx-0.5 h-6 w-px bg-border" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface FloatingToolbarProps {
  showScratchSheet: boolean;
  setShowScratchSheet: (v: boolean) => void;
}

export function FloatingToolbar({ showScratchSheet, setShowScratchSheet }: FloatingToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedFile,
    handleImageUpload,
    confirmClearMap,
    isProcessingFile,
    mode,
    image,
    scale,
    plots,
    setMode,
    setIsDrawing,
    setCalibrationLine,
    confirmClearPlot,
    startPlotDrawing,
    startManualDivide,
    isShowDiagonals,
    setIsShowDiagonals,
    isMagnifierEnabled,
    setIsMagnifierEnabled,
  } = useMapStore();

  const isDrawing = mode === 'drawing_plot' || mode === 'calibrating' || mode === 'manual_divide_plot';

  const handleUploadClick = () => {
    if (selectedFile) {
      confirmClearMap();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleCalibrateClick = () => {
    if (!image) return;
    confirmClearPlot(() => {
      setMode('calibrating');
      setIsDrawing(false);
      setCalibrationLine([]);
    });
  };

  const commonTools = {
    upload: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Upload}
        label={selectedFile ? `${selectedFile.name} — পরিবর্তন করুন` : 'ম্যাপ আপলোড করুন'}
        active={!!selectedFile}
        onClick={handleUploadClick}
        disabled={isProcessingFile}
        size={size}
      />
    ),
    calibrate: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Ruler}
        label={scale ? `স্কেল: ১ px ≈ ${(1 / scale).toFixed(2)} ft — পরিবর্তন করুন` : 'স্কেল সেট করুন'}
        active={mode === 'calibrating' || !!scale}
        onClick={handleCalibrateClick}
        disabled={!image || mode === 'calibrating'}
        size={size}
      />
    ),
    draw: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={PenTool}
        label={mode === 'drawing_plot' ? 'আঁকা চলছে...' : plots.length > 0 ? 'আরেক প্লট আঁকুন' : 'প্লট আঁকুন'}
        active={mode === 'drawing_plot'}
        onClick={startPlotDrawing}
        disabled={!image || !scale || mode === 'drawing_plot' || mode === 'calibrating'}
        size={size}
      />
    ),
    divide: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Scissors}
        label="জমি ভাগ করুন"
        active={mode === 'manual_divide_plot'}
        onClick={startManualDivide}
        disabled={plots.length === 0 || isDrawing}
        size={size}
      />
    ),
    diagonals: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={isShowDiagonals ? Eye : EyeOff}
        label={isShowDiagonals ? 'কর্ণ লুকান' : 'কর্ণ দেখান'}
        active={isShowDiagonals}
        onClick={() => setIsShowDiagonals(!isShowDiagonals)}
        size={size}
      />
    ),
    magnifier: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={Search}
        label={isMagnifierEnabled ? 'ম্যাগনিফায়ার বন্ধ' : 'ম্যাগনিফায়ার চালু'}
        active={isMagnifierEnabled}
        onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)}
        size={size}
      />
    ),
    scratch: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={FileText}
        label="স্ক্র্যাচ শিট"
        active={showScratchSheet}
        onClick={() => setShowScratchSheet(!showScratchSheet)}
        size={size}
      />
    ),
    help: (size: 'md' | 'sm' = 'md') => (
      <ToolBtn
        icon={HelpCircle}
        label="সাহায্য / টিউটোরিয়াল"
        onClick={() => window.dispatchEvent(new Event('start-tutorial'))}
        size={size}
      />
    ),
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
        disabled={isProcessingFile}
        onChange={handleImageUpload}
      />

      {/* ── Desktop: floating right panel ─────────────────────────────────── */}
      <div
        id="step-toolbar"
        className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl backdrop-blur-sm md:flex"
      >
        {commonTools.upload()}
        <VDivider />
        {commonTools.calibrate()}
        {commonTools.draw()}
        {commonTools.divide()}
        <VDivider />
        {commonTools.diagonals()}
        {commonTools.magnifier()}
        {commonTools.scratch()}
        <VDivider />
        <SaveProjectDialog iconOnly />
        {commonTools.help()}
      </div>

      {/* ── Mobile: floating bottom bar ───────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-2xl border border-border bg-card/95 px-2 py-1.5 shadow-xl backdrop-blur-sm md:hidden">
        {commonTools.upload('sm')}
        {commonTools.calibrate('sm')}
        {commonTools.draw('sm')}
        {commonTools.divide('sm')}
        <HDivider />
        {commonTools.diagonals('sm')}
        {commonTools.magnifier('sm')}
        {commonTools.scratch('sm')}
        {commonTools.help('sm')}
      </div>
    </>
  );
}
