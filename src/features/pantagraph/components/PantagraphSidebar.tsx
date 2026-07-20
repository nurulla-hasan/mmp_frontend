'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { PantagraphCropDialog } from './PantagraphCropDialog';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { extractImageFromPDF } from '@/features/land-measurement/utils/pdfHelper';
import { useMediaQuery } from '@/hooks/useUtilityHooks';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from '@/components/ui/drawer';
import {
  ImageUp,
  Trash2,
  Loader2,
  RotateCw,
  Move,
  ZoomIn,
  X,
} from 'lucide-react';

// ─── Shared slider className ──────────────────────────────────────────────────
const sliderCls = (accent: 'destructive' | 'primary') => {
  const base = "w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm";
  if (accent === 'destructive') {
    return `${base} accent-destructive [&::-webkit-slider-thumb]:bg-destructive`;
  }
  return `${base} accent-primary [&::-webkit-slider-thumb]:bg-primary`;
};

// ─── Sub-component: Map Upload Section ───────────────────────────────────────
const MapUploadSection = memo(function MapUploadSection() {
  const formerInputRef = useRef<HTMLInputElement>(null);
  const currentInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'former' | 'current' | null>(null);

  const { formerMap, currentMap, setFormerMap, setCurrentMap, imageLoading, setImageLoading } = usePantagraphStore(
    useShallow((s) => ({
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      setFormerMap: s.setFormerMap,
      setCurrentMap: s.setCurrentMap,
      imageLoading: s.imageLoading,
      setImageLoading: s.setImageLoading,
    })),
  );

  // ── Load file → data URL → open crop dialog ─────────────────────────────────
  const loadFileForCrop = useCallback(async (
    file: File,
    target: 'former' | 'current',
  ) => {
    setImageLoading(true);
    if (file.type === 'application/pdf') {
      try {
        const img = await extractImageFromPDF(file);
        if (!img) {
          setImageLoading(false);
          return;
        }
        // Convert the HTMLImageElement src to a stable data URL for the cropper
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setCropSrc(dataUrl);
        setCropTarget(target);
      } catch (error) {
        console.error('PDF load error:', error);
      } finally {
        setImageLoading(false);
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setCropSrc(dataUrl);
        setCropTarget(target);
      }
      setImageLoading(false);
    };
    reader.onerror = () => setImageLoading(false);
    reader.readAsDataURL(file);
  }, [setImageLoading]);

  const handleFormerUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFileForCrop(file, 'former');
    e.target.value = '';
  }, [loadFileForCrop]);

  const handleCurrentUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadFileForCrop(file, 'current');
    e.target.value = '';
  }, [loadFileForCrop]);

  // ── When crop is done ────────────────────────────────────────────────────────
  const handleCropDone = useCallback((img: HTMLImageElement) => {
    if (cropTarget === 'former') setFormerMap(img);
    else if (cropTarget === 'current') setCurrentMap(img);
  }, [cropTarget, setFormerMap, setCurrentMap]);

  const handleCropClose = useCallback(() => {
    setCropSrc(null);
    setCropTarget(null);
  }, []);

  return (
    <>
      <div className="space-y-3 mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
          ম্যাপ আপলোড
        </h3>
        {/* Former Map */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            সাবেক ম্যাপ
          </Label>
          <input ref={formerInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFormerUpload} />
          <div className="flex gap-1.5">
            <Button variant="outline" onClick={() => formerInputRef.current?.click()} disabled={imageLoading}>
              <ImageUp className="w-4 h-4 mr-1.5" />
              {imageLoading ? 'লোড হচ্ছে...' : (formerMap ? 'পরিবর্তন' : 'আপলোড')}
            </Button>
            {formerMap && (
              <Button variant="ghost" size="icon" onClick={() => setFormerMap(null)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {/* Current Map */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            হাল ম্যাপ
          </Label>
          <input ref={currentInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleCurrentUpload} />
          <div className="flex gap-1.5">
            <Button variant="outline" onClick={() => currentInputRef.current?.click()} disabled={imageLoading}>
              <ImageUp className="w-4 h-4 mr-1.5" />
              {imageLoading ? 'লোড হচ্ছে...' : (currentMap ? 'পরিবর্তন' : 'আপলোড')}
            </Button>
            {currentMap && (
              <Button variant="ghost" size="icon" onClick={() => setCurrentMap(null)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Crop Dialog — mounts outside the scroll container to avoid z-index issues */}
      {cropSrc && cropTarget && (
        <PantagraphCropDialog
          open={true}
          imageSrc={cropSrc}
          mapLabel={cropTarget === 'former' ? 'সাবেক ম্যাপ' : 'হাল ম্যাপ'}
          onClose={handleCropClose}
          onDone={handleCropDone}
        />
      )}
    </>
  );
});

// ─── Sub-component: Former BG Removal ────────────────────────────────────────
const FormerBgSection = memo(function FormerBgSection() {
  const {
    formerBgRemoved,
    isRemovingFormerBg,
    formerBlackSensitivity,
    toggleFormerBgRemoval,
    setFormerBlackSensitivity,
  } = usePantagraphStore(
    useShallow((state) => ({
      formerBgRemoved: state.formerBgRemoved,
      isRemovingFormerBg: state.isRemovingFormerBg,
      formerBlackSensitivity: state.formerBlackSensitivity,
      toggleFormerBgRemoval: state.toggleFormerBgRemoval,
      setFormerBlackSensitivity: state.setFormerBlackSensitivity,
    })),
  );

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          সাবেক ব্যাকগ্রাউন্ড সরান
        </Label>

        {isRemovingFormerBg ? (
          <div className="flex h-5 w-9 items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={formerBgRemoved}
            onClick={toggleFormerBgRemoval}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              formerBgRemoved ? 'bg-destructive' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                formerBgRemoved ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {formerBgRemoved && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">
              লাইন ধরার মাত্রা
            </Label>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {formerBlackSensitivity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={formerBlackSensitivity}
            onChange={(event) =>
              setFormerBlackSensitivity(Number(event.target.value))
            }
            aria-label="সাবেক ম্যাপের লাইন ধরার মাত্রা"
            className={sliderCls('destructive')}
          />
          <p className="text-[10px] leading-4 text-muted-foreground">
            কমালে শুধু গাঢ় কালো, বাড়ালে ফিকে ও পুরোনো line-ও থাকবে।
            C.S line লাল দেখাবে।
          </p>
        </div>
      )}
    </div>
  );
});

// ─── Sub-component: Current BG Removal ───────────────────────────────────────
const CurrentBgSection = memo(function CurrentBgSection() {
  const {
    currentBgRemoved,
    isRemovingCurrentBg,
    currentBlackSensitivity,
    toggleCurrentBgRemoval,
    setCurrentBlackSensitivity,
  } = usePantagraphStore(
    useShallow((state) => ({
      currentBgRemoved: state.currentBgRemoved,
      isRemovingCurrentBg: state.isRemovingCurrentBg,
      currentBlackSensitivity: state.currentBlackSensitivity,
      toggleCurrentBgRemoval: state.toggleCurrentBgRemoval,
      setCurrentBlackSensitivity: state.setCurrentBlackSensitivity,
    })),
  );

  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          হাল ব্যাকগ্রাউন্ড সরান
        </Label>

        {isRemovingCurrentBg ? (
          <div className="flex h-5 w-9 items-center justify-center">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={currentBgRemoved}
            onClick={toggleCurrentBgRemoval}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              currentBgRemoved ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                currentBgRemoved ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        )}
      </div>

      {currentBgRemoved && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] text-muted-foreground">
              লাইন ধরার মাত্রা
            </Label>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {currentBlackSensitivity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={currentBlackSensitivity}
            onChange={(event) =>
              setCurrentBlackSensitivity(Number(event.target.value))
            }
            aria-label="হাল ম্যাপের লাইন ধরার মাত্রা"
            className={sliderCls('primary')}
          />
          <p className="text-[10px] leading-4 text-muted-foreground">
            কমালে শুধু গাঢ় কালো, বাড়ালে ফিকে ও পুরোনো line-ও থাকবে।
            B.S line সবুজ দেখাবে।
          </p>
        </div>
      )}
    </div>
  );
});

const OpacitySection = memo(function OpacitySection() {
  const {
    formerOpacity,
    currentOpacity,
    setFormerOpacity,
    setCurrentOpacity,
  } = usePantagraphStore(
    useShallow((state) => ({
      formerOpacity: state.formerOpacity,
      currentOpacity: state.currentOpacity,
      setFormerOpacity: state.setFormerOpacity,
      setCurrentOpacity: state.setCurrentOpacity,
    })),
  );

  return (
    <div className="my-4 space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-heading">
        ওপাসিটি
      </h3>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            সাবেক
          </Label>
          <span className="font-mono text-[10px] text-muted-foreground">
            {Math.round(formerOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={formerOpacity}
          onChange={(event) => setFormerOpacity(Number(event.target.value))}
          className={sliderCls('destructive')}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            হাল
          </Label>
          <span className="font-mono text-[10px] text-muted-foreground">
            {Math.round(currentOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentOpacity}
          onChange={(event) => setCurrentOpacity(Number(event.target.value))}
          className={sliderCls('primary')}
        />
      </div>
    </div>
  );
});

// ─── Sub-component: Line Smoothing ───────────────────────────────────────────
const LineSmoothingSection = memo(function LineSmoothingSection() {
  const { lineSmoothing, setLineSmoothing, formerBgRemoved, currentBgRemoved } = usePantagraphStore(
    useShallow((s) => ({
      lineSmoothing: s.lineSmoothing,
      setLineSmoothing: s.setLineSmoothing,
      formerBgRemoved: s.formerBgRemoved,
      currentBgRemoved: s.currentBgRemoved,
    })),
  );

  // Only show when at least one BG has been removed
  if (!formerBgRemoved && !currentBgRemoved) return null;

  return (
    <div className="space-y-2 py-2 border-t border-border">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground font-semibold">
          লাইন মসৃণতা
        </Label>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {lineSmoothing === 0 ? 'বন্ধ' : `${lineSmoothing}/10`}
        </span>
      </div>
      <input
        type="range" min="0" max="10" step="1"
        value={lineSmoothing}
        onChange={(e) => setLineSmoothing(Number(e.target.value))}
        className={sliderCls('primary')}
      />
      <p className="text-[9px] text-muted-foreground/70 leading-tight">
        স্লাইডার পরিবর্তন করলে পুনরায় প্রক্রিয়া হবে
      </p>
    </div>
  );
});

// ─── Sub-component: Active Map Toggle ────────────────────────────────────────
const ActiveMapSection = memo(function ActiveMapSection() {
  const { activeMap, setActiveMap } = usePantagraphStore(
    useShallow((s) => ({ activeMap: s.activeMap, setActiveMap: s.setActiveMap })),
  );

  return (
    <div className="space-y-2 my-4">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold font-heading">
        সক্রিয় ম্যাপ
      </Label>
      <div className="flex gap-2">
        <Button variant={activeMap === 'former' ? 'destructive' : 'outline'} onClick={() => setActiveMap('former')}>
          <span className="w-2.5 h-2.5 rounded-full bg-destructive mr-1.5" />
          সাবেক ম্যাপ
        </Button>
        <Button variant={activeMap === 'current' ? 'default' : 'outline'} onClick={() => setActiveMap('current')}>
          <span className="w-2.5 h-2.5 rounded-full bg-primary mr-1.5" />
          হাল ম্যাপ
        </Button>
      </div>
    </div>
  );
});

// ─── Sub-component: Match Points ─────────────────────────────────────────────
const MatchPointsSection = memo(function MatchPointsSection() {
  const {
    matchPoints,
    removeMatchPoint,
  } = usePantagraphStore(
    useShallow((s) => ({
      matchPoints: s.matchPoints,
      removeMatchPoint: s.removeMatchPoint,
    })),
  );

  if (matchPoints.length === 0) return null;

  return (
    <div className="space-y-2 my-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
          পয়েন্ট ({matchPoints.length})
        </h3>
      </div>
      <div className="space-y-1">
        {matchPoints.map((point, index) => (
          <div key={point.id} className="flex items-center justify-between bg-muted/50 rounded px-2 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">পয়েন্ট #{index + 1}</span>
              {point.current === null && <span className="text-[10px] text-destructive">(অসম্পূর্ণ)</span>}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMatchPoint(point.id)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
});

// ─── Sub-component: Alignment Result ─────────────────────────────────────────
const AlignmentResultSection = memo(function AlignmentResultSection() {
  const { alignmentResult, alignmentType, clearAlignment } = usePantagraphStore(
    useShallow((s) => ({
      alignmentResult: s.alignmentResult,
      alignmentType: s.alignmentType,
      clearAlignment: s.clearAlignment,
    })),
  );

  if (!alignmentResult) return null;

  return (
    <>
      <Separator />
      <div className="space-y-2 my-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
            অ্যালাইনমেন্ট রেজাল্ট
          </h3>
          <Button variant="ghost" onClick={clearAlignment} className="h-7 text-xs">সরান</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
              <RotateCw className="w-3 h-3" />রোটেশন
            </div>
            <p className="text-sm font-semibold text-foreground">
              {(alignmentResult.rotation! * 180 / Math.PI).toFixed(2)}°
            </p>
          </div>
          {alignmentType === 'affine' ? (
            <>
              <div className="bg-muted/50 rounded px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><ZoomIn className="w-3 h-3" />স্কেল X</div>
                <p className="text-sm font-semibold text-foreground">{alignmentResult.a!.toFixed(4)}×</p>
              </div>
              <div className="bg-muted/50 rounded px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><ZoomIn className="w-3 h-3" />স্কেল Y</div>
                <p className="text-sm font-semibold text-foreground">{alignmentResult.d!.toFixed(4)}×</p>
              </div>
              <div className="bg-muted/50 rounded px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><RotateCw className="w-3 h-3" />স্কিউ X</div>
                <p className="text-sm font-semibold text-foreground">{alignmentResult.b!.toFixed(4)}</p>
              </div>
              <div className="bg-muted/50 rounded px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><RotateCw className="w-3 h-3" />স্কিউ Y</div>
                <p className="text-sm font-semibold text-foreground">{alignmentResult.c!.toFixed(4)}</p>
              </div>
            </>
          ) : (
            <div className="bg-muted/50 rounded px-2.5 py-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><ZoomIn className="w-3 h-3" />স্কেল</div>
              <p className="text-sm font-semibold text-foreground">{alignmentResult.scale!.toFixed(4)}×</p>
            </div>
          )}
          <div className="bg-muted/50 rounded px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><Move className="w-3 h-3" />ট্রান্সলেশন X</div>
            <p className="text-sm font-semibold text-foreground">{alignmentResult.tx.toFixed(1)}px</p>
          </div>
          <div className="bg-muted/50 rounded px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5"><Move className="w-3 h-3" />ট্রান্সলেশন Y</div>
            <p className="text-sm font-semibold text-foreground">{alignmentResult.ty.toFixed(1)}px</p>
          </div>
        </div>
      </div>
    </>
  );
});

// ─── Canvas Background section (simple, stays in parent) ─────────────────────
const bgOptions = [
  { label: 'সিস্টেম', key: 'auto' as const, color: '#999999' },
  { label: 'ডার্ক গ্রিড', key: 'dark' as const, color: '#121212' },
  { label: 'সাদা গ্রিড', key: 'white' as const, color: '#ffffff' },
];

// ─── Shared Sidebar Content ───────────────────────────────────────────────────
const SidebarContent = memo(function SidebarContent() {
  const { hasFormerMap, hasCurrentMap, canvasBg, setCanvasBg } = usePantagraphStore(
    useShallow((s) => ({
      hasFormerMap: s.formerMap !== null,
      hasCurrentMap: s.currentMap !== null,
      canvasBg: s.canvasBg,
      setCanvasBg: s.setCanvasBg,
      reset: s.reset,
    })),
  );

  return (
    <div className="p-4 md:p-5 space-y-6">
      {/* Image Upload */}
      <MapUploadSection />

      {/* Former BG Removal */}
      {hasFormerMap && <FormerBgSection />}

      {/* Current BG Removal */}
      {hasCurrentMap && <CurrentBgSection />}

      {/* Line Smoothing (auto-hides if no BG removed) */}
      <LineSmoothingSection />

      <Separator />

      {/* Canvas Background */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold font-heading">
          ক্যানভাস ব্যাকগ্রাউন্ড
        </Label>
        <div className="flex gap-1.5 flex-wrap">
          {bgOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCanvasBg(opt.key)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${canvasBg === opt.key ? 'border-primary scale-110' : 'border-transparent'
                }`}
              style={{ backgroundColor: opt.color }}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Opacity — only when both maps loaded */}
      {hasFormerMap && hasCurrentMap && <OpacitySection />}

      <Separator />

      {/* Active Map Toggle */}
      <ActiveMapSection />

      <Separator />

      {/* Match Points */}
      <MatchPointsSection />

      {/* Alignment Result */}
      <AlignmentResultSection />
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
interface PantagraphSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PantagraphSidebar = memo(function PantagraphSidebar({ isOpen = false, onClose }: PantagraphSidebarProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute left-4 top-16 max-h-[85dvh] w-80 bg-card/95 backdrop-blur-md border border-border flex-col z-20 hidden md:flex overflow-hidden rounded-2xl shadow-2xl">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground font-heading">ম্যাপ ও সেটিংস</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="overflow-y-auto" style={{ minHeight: 0 }}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer — bottom sheet visible on small screens */}
      {isMobile && (
        <div className="md:hidden">
          <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose?.(); }}>
            <DrawerPortal>
              <DrawerOverlay className="md:hidden" />
              <DrawerContent className="max-h-[85dvh] flex flex-col md:hidden">
                {/* Handle + header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                  <h2 className="text-sm font-semibold text-foreground font-heading">ম্যাপ ও সেটিংস</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
                  <SidebarContent />
                </div>
              </DrawerContent>
            </DrawerPortal>
          </Drawer>
        </div>
      )}
    </>
  );
});
