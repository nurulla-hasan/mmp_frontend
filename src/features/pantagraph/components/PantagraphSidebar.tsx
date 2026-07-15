'use client';

import { memo, useCallback, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { extractImageFromPDF } from '@/features/map-tool/utils/pdfHelper';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  ImageUp,
  Trash2,
  Droplets,
  Loader2,
  Undo2,
  RotateCw,
  Move,
  ZoomIn,
} from 'lucide-react';

export const PantagraphSidebar = memo(function PantagraphSidebar() {
  const formerInputRef = useRef<HTMLInputElement>(null);
  const currentInputRef = useRef<HTMLInputElement>(null);

  const {
    formerMap,
    currentMap,
    activeMap,
    canvasBg,
    matchPoints,
    formerBgRemoved,
    currentBgRemoved,
    alignmentResult,
    alignmentType,
    redoStack,
    isPickingColor,
    pickingTarget,
    isRemovingFormerBg,
    isRemovingCurrentBg,
    formerBgTolerance,
    currentBgTolerance,
    formerOpacity,
    currentOpacity,
    formerLineColor,
    currentLineColor,
    lineColorizeThreshold,
    setFormerMap,
    setCurrentMap,
    setActiveMap,
    setCanvasBg,
    removeMatchPoint,
    removeLastMatchPoint,
    restoreLastMatchPoint,
    setMatchPoints,
    toggleFormerBgRemoval,
    toggleCurrentBgRemoval,
    setFormerBgTolerance,
    setCurrentBgTolerance,
    setFormerOpacity,
    setCurrentOpacity,
    setFormerLineColor,
    setCurrentLineColor,
    setLineColorizeThreshold,
    startColorPick,
    cancelColorPick,
    clearAlignment,
    reset,
  } = usePantagraphStore(
    useShallow((s) => ({
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      activeMap: s.activeMap,
      canvasBg: s.canvasBg,
      matchPoints: s.matchPoints,
      formerBgRemoved: s.formerBgRemoved,
      currentBgRemoved: s.currentBgRemoved,
      alignmentResult: s.alignmentResult,
      alignmentType: s.alignmentType,
      isPickingColor: s.isPickingColor,
      pickingTarget: s.pickingTarget,
      isRemovingFormerBg: s.isRemovingFormerBg,
      isRemovingCurrentBg: s.isRemovingCurrentBg,
      formerBgTolerance: s.formerBgTolerance,
      currentBgTolerance: s.currentBgTolerance,
      formerOpacity: s.formerOpacity,
      currentOpacity: s.currentOpacity,
      formerLineColor: s.formerLineColor,
      currentLineColor: s.currentLineColor,
      lineColorizeThreshold: s.lineColorizeThreshold,
      setFormerMap: s.setFormerMap,
      setCurrentMap: s.setCurrentMap,
      setActiveMap: s.setActiveMap,
      setCanvasBg: s.setCanvasBg,
      redoStack: s.redoStack,
      removeMatchPoint: s.removeMatchPoint,
      removeLastMatchPoint: s.removeLastMatchPoint,
      restoreLastMatchPoint: s.restoreLastMatchPoint,
      setMatchPoints: s.setMatchPoints,
      toggleFormerBgRemoval: s.toggleFormerBgRemoval,
      toggleCurrentBgRemoval: s.toggleCurrentBgRemoval,
      setFormerBgTolerance: s.setFormerBgTolerance,
      setCurrentBgTolerance: s.setCurrentBgTolerance,
      setFormerOpacity: s.setFormerOpacity,
      setCurrentOpacity: s.setCurrentOpacity,
      setFormerLineColor: s.setFormerLineColor,
      setCurrentLineColor: s.setCurrentLineColor,
      setLineColorizeThreshold: s.setLineColorizeThreshold,
      startColorPick: s.startColorPick,
      cancelColorPick: s.cancelColorPick,
      clearAlignment: s.clearAlignment,
      reset: s.reset,
    }))
  );

  const loadImage = useCallback(
    async (file: File, setter: (img: HTMLImageElement | null) => void) => {
      if (file.type === 'application/pdf') {
        try {
          const img = await extractImageFromPDF(file);
          setter(img);
        } catch (error) {
          console.error('PDF upload error:', error);
        }
        return;
      }

      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url); // ← memory leak fix!
        setter(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
      };
    },
    []
  );

  const handleFormerUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      loadImage(file, setFormerMap);
      e.target.value = ''; // allow re-upload of same file
    },
    [loadImage, setFormerMap]
  );

  const handleCurrentUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      loadImage(file, setCurrentMap);
      e.target.value = '';
    },
    [loadImage, setCurrentMap]
  );

  const bgOptions = [
    { label: 'সিস্টেম', key: 'auto' as const, color: '#999999' },
    { label: 'ডার্ক গ্রিড', key: 'dark' as const, color: '#121212' },
    { label: 'সাদা গ্রিড', key: 'white' as const, color: '#ffffff' },
  ];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-border flex-col z-20 hidden md:flex">
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Image uploads */}
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
            <input
              ref={formerInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFormerUpload}
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => formerInputRef.current?.click()}
              >
                <ImageUp className="w-3.5 h-3.5 mr-1" />
                {formerMap ? 'পরিবর্তন' : 'আপলোড'}
              </Button>
              {formerMap && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setFormerMap(null)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
            <input
              ref={currentInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleCurrentUpload}
            />
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => currentInputRef.current?.click()}
              >
                <ImageUp className="w-3.5 h-3.5 mr-1" />
                {currentMap ? 'পরিবর্তন' : 'আপলোড'}
              </Button>
              {currentMap && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setCurrentMap(null)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Background Removal */}
        {formerMap && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                সাবেক ব্যাকগ্রাউন্ড সরান
              </Label>
              <div className="flex items-center gap-1.5">
                {/* Eyedropper — pick color from map */}
                <button
                  type="button"
                  onClick={() =>
                    isPickingColor && pickingTarget === 'former'
                      ? cancelColorPick()
                      : startColorPick('former')
                  }
                  disabled={isRemovingFormerBg}
                  className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${
                    isPickingColor && pickingTarget === 'former'
                      ? 'bg-destructive text-destructive-foreground border-destructive'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  } ${isRemovingFormerBg ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title="ম্যাপ থেকে কালার নিন"
                >
                  <Droplets className="w-3.5 h-3.5" />
                </button>

                {/* Toggle switch */}
                {isRemovingFormerBg ? (
                  <div className="flex items-center justify-center w-9 h-5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
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
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                        formerBgRemoved ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
            {/* Tolerance slider */}
            {formerBgRemoved && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    টলারেন্স
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formerBgTolerance}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={formerBgTolerance}
                  onChange={(e) => setFormerBgTolerance(Number(e.target.value))}
                  className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted accent-destructive [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-destructive [&::-webkit-slider-thumb]:shadow-sm"
                />
              </div>
            )}
            {/* Line color picker — shown when bg is removed */}
            {formerBgRemoved && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-muted-foreground">
                  দাগের রং
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormerLineColor('#000000')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      formerLineColor === '#000000'
                        ? 'border-foreground bg-foreground/5 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    মূল
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormerLineColor('#DC2626')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      formerLineColor === '#DC2626'
                        ? 'border-red-500 bg-red-500/10 text-red-600'
                        : 'border-border text-muted-foreground hover:text-red-600 hover:border-red-300'
                    }`}
                  >
                    লাল
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormerLineColor('#16A34A')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      formerLineColor === '#16A34A'
                        ? 'border-green-500 bg-green-500/10 text-green-600'
                        : 'border-border text-muted-foreground hover:text-green-600 hover:border-green-300'
                    }`}
                  >
                    সবুজ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {currentMap && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                হাল ব্যাকগ্রাউন্ড সরান
              </Label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    isPickingColor && pickingTarget === 'current'
                      ? cancelColorPick()
                      : startColorPick('current')
                  }
                  disabled={isRemovingCurrentBg}
                  className={`w-6 h-6 flex items-center justify-center rounded border transition-colors ${
                    isPickingColor && pickingTarget === 'current'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  } ${isRemovingCurrentBg ? 'opacity-40 cursor-not-allowed' : ''}`}
                  title="ম্যাপ থেকে কালার নিন"
                >
                  <Droplets className="w-3.5 h-3.5" />
                </button>

                {isRemovingCurrentBg ? (
                  <div className="flex items-center justify-center w-9 h-5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
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
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                        currentBgRemoved ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>            {/* Tolerance slider */}
            {currentBgRemoved && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    টলারেন্স
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {currentBgTolerance}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentBgTolerance}
                  onChange={(e) => setCurrentBgTolerance(Number(e.target.value))}
                  className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
                />
              </div>
            )}
            {/* Line color picker — shown when bg is removed */}
            {currentBgRemoved && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-muted-foreground">
                  দাগের রং
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentLineColor('#000000')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      currentLineColor === '#000000'
                        ? 'border-foreground bg-foreground/5 text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    মূল
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentLineColor('#DC2626')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      currentLineColor === '#DC2626'
                        ? 'border-red-500 bg-red-500/10 text-red-600'
                        : 'border-border text-muted-foreground hover:text-red-600 hover:border-red-300'
                    }`}
                  >
                    লাল
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentLineColor('#16A34A')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                      currentLineColor === '#16A34A'
                        ? 'border-green-500 bg-green-500/10 text-green-600'
                        : 'border-border text-muted-foreground hover:text-green-600 hover:border-green-300'
                    }`}
                  >
                    সবুজ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Canvas Background */}
        <div className="space-y-2 my-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold font-heading">
            ক্যানভাস ব্যাকগ্রাউন্ড
          </Label>
          <div className="flex gap-1.5 flex-wrap">
            {bgOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setCanvasBg(opt.key)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  canvasBg === opt.key
                    ? 'border-primary scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: opt.color }}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Opacity Controls */}
        {formerMap && currentMap && (
          <div className="space-y-3 my-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
              ওপাসিটি
            </h3>
            {/* Former opacity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-destructive" />
                  সাবেক
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {Math.round(formerOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={formerOpacity}
                onChange={(e) => setFormerOpacity(Number(e.target.value))}
                className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted accent-destructive [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-destructive [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>
            {/* Current opacity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  হাল
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {Math.round(currentOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentOpacity}
                onChange={(e) => setCurrentOpacity(Number(e.target.value))}
                className="w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
              />
            </div>
          </div>
        )}

        <Separator />

        {/* Active Map Toggle */}
        <div className="space-y-2 my-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold font-heading">
            সক্রিয় ম্যাপ
          </Label>
          <div className="flex gap-1">
            <Button
              variant={activeMap === 'former' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setActiveMap('former')}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeMap === 'former' ? 'bg-current' : 'bg-destructive'}`} />
              সাবেক
            </Button>
            <Button
              variant={activeMap === 'current' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveMap('current')}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${activeMap === 'current' ? 'bg-current' : 'bg-primary'}`} />
              হাল
            </Button>
          </div>
        </div>

        <Separator />

        {/* Match Points List */}
        {matchPoints.length > 0 && (
          <div className="space-y-2 my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
                পয়েন্ট ({matchPoints.length})
              </h3>
              <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => removeLastMatchPoint()}
                    title="শেষ পয়েন্ট আনডু"
                    disabled={matchPoints.length === 0}
                  >
                    <Undo2 className="w-3 h-3 mr-1" />
                    আনডু
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => restoreLastMatchPoint()}
                    title="শেষ পয়েন্ট রিডু"
                    disabled={redoStack.length === 0}
                  >
                    <Undo2 className="w-3 h-3 mr-1 rotate-180" />
                    রিডু
                  </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setMatchPoints([])}
                >
                  সব মুছুন
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {matchPoints.map((point, index) => (
                <div
                  key={point.id}
                  className="flex items-center justify-between bg-muted/50 rounded px-2 py-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">পয়েন্ট #{index + 1}</span>
                    {point.current === null && (
                      <span className="text-[10px] text-destructive">(অসম্পূর্ণ)</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeMatchPoint(point.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alignment Result */}
        {alignmentResult && (
          <>
            <Separator />
            <div className="space-y-2 my-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
                  অ্যালাইনমেন্ট রেজাল্ট
                </h3>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => clearAlignment()}
                >
                  সরান
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/50 rounded px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <RotateCw className="w-3 h-3" />
                    রোটেশন
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {(alignmentResult.rotation! * 180 / Math.PI).toFixed(2)}°
                  </p>
                </div>
                {alignmentType === 'affine' ? (
                  <>
                    <div className="bg-muted/50 rounded px-2.5 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                        <ZoomIn className="w-3 h-3" />
                        স্কেল X
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {alignmentResult.a!.toFixed(4)}×
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded px-2.5 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                        <ZoomIn className="w-3 h-3" />
                        স্কেল Y
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {alignmentResult.d!.toFixed(4)}×
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded px-2.5 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                        <RotateCw className="w-3 h-3" />
                        স্কিউ X
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {alignmentResult.b!.toFixed(4)}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded px-2.5 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                        <RotateCw className="w-3 h-3" />
                        স্কিউ Y
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {alignmentResult.c!.toFixed(4)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-muted/50 rounded px-2.5 py-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                      <ZoomIn className="w-3 h-3" />
                      স্কেল
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {alignmentResult.scale!.toFixed(4)}×
                    </p>
                  </div>
                )}
                <div className="bg-muted/50 rounded px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <Move className="w-3 h-3" />
                    ট্রান্সলেশন X
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {alignmentResult.tx.toFixed(1)}px
                  </p>
                </div>
                <div className="bg-muted/50 rounded px-2.5 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-0.5">
                    <Move className="w-3 h-3" />
                    ট্রান্সলেশন Y
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {alignmentResult.ty.toFixed(1)}px
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reset */}
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="destructive"
            size="sm"
            onClick={reset}
          >
            রিসেট
          </Button>
        </div>
      </div>
    </div>
  );
});
