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
  RotateCcw,
  RotateCw,
  Droplets,
  Loader2,
} from 'lucide-react';

export const PantagraphSidebar = memo(function PantagraphSidebar() {
  const formerInputRef = useRef<HTMLInputElement>(null);
  const currentInputRef = useRef<HTMLInputElement>(null);

  const {
    formerMap,
    currentMap,
    activeMap,
    canvasBg,
    formerRotation,
    currentRotation,
    matchPoints,
    formerBgRemoved,
    currentBgRemoved,
    formerBgColor,
    currentBgColor,
    isPickingColor,
    pickingTarget,
    isRemovingFormerBg,
    isRemovingCurrentBg,
    setFormerMap,
    setCurrentMap,
    setActiveMap,
    setCanvasBg,
    setFormerRotation,
    setCurrentRotation,
    removeMatchPoint,
    setMatchPoints,
    toggleFormerBgRemoval,
    toggleCurrentBgRemoval,
    setFormerBgColor,
    setCurrentBgColor,
    startColorPick,
    cancelColorPick,
    reset,
  } = usePantagraphStore(
    useShallow((s) => ({
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      activeMap: s.activeMap,
      canvasBg: s.canvasBg,
      formerRotation: s.formerRotation,
      currentRotation: s.currentRotation,
      matchPoints: s.matchPoints,
      formerBgRemoved: s.formerBgRemoved,
      currentBgRemoved: s.currentBgRemoved,
      formerBgColor: s.formerBgColor,
      currentBgColor: s.currentBgColor,
      isPickingColor: s.isPickingColor,
      pickingTarget: s.pickingTarget,
      isRemovingFormerBg: s.isRemovingFormerBg,
      isRemovingCurrentBg: s.isRemovingCurrentBg,
      setFormerMap: s.setFormerMap,
      setCurrentMap: s.setCurrentMap,
      setActiveMap: s.setActiveMap,
      setCanvasBg: s.setCanvasBg,
      setFormerRotation: s.setFormerRotation,
      setCurrentRotation: s.setCurrentRotation,
      removeMatchPoint: s.removeMatchPoint,
      setMatchPoints: s.setMatchPoints,
      toggleFormerBgRemoval: s.toggleFormerBgRemoval,
      toggleCurrentBgRemoval: s.toggleCurrentBgRemoval,
      setFormerBgColor: s.setFormerBgColor,
      setCurrentBgColor: s.setCurrentBgColor,
      startColorPick: s.startColorPick,
      cancelColorPick: s.cancelColorPick,
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
                {/* Hidden native color picker triggered by swatch click */}
                <input
                  type="color"
                  value={formerBgColor}
                  onChange={(e) => setFormerBgColor(e.target.value)}
                  id="former-bg-color"
                  className="sr-only"
                />
                {/* Color swatch */}
                <label
                  htmlFor="former-bg-color"
                  className="w-5 h-5 rounded border border-border cursor-pointer"
                  style={{ backgroundColor: formerBgColor }}
                  title="কালার পিকার"
                />
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
                <input
                  type="color"
                  value={currentBgColor}
                  onChange={(e) => setCurrentBgColor(e.target.value)}
                  id="current-bg-color"
                  className="sr-only"
                />
                <label
                  htmlFor="current-bg-color"
                  className="w-5 h-5 rounded border border-border cursor-pointer"
                  style={{ backgroundColor: currentBgColor }}
                  title="কালার পিকার"
                />
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
            </div>
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

        {/* Former Map Controls */}
        {formerMap && (
          <div className="space-y-3 my-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <span className="w-2 h-2 rounded-full bg-destructive" />
              সাবেক ম্যাপ কন্ট্রোল
            </h3>

            {/* Rotation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <Label>রোটেশন</Label>
                <span>{formerRotation.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={0.1}
                value={formerRotation}
                onChange={(e) => setFormerRotation(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-destructive"
              />
              <div className="flex gap-1 mt-1">
                <Button variant="outline" size="xs" onClick={() => setFormerRotation(formerRotation - 90)}>
                  <RotateCcw className="w-3 h-3 mr-0.5" />-৯০°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setFormerRotation(formerRotation - 0.1)}>
                  -০.১°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setFormerRotation(formerRotation + 0.1)}>
                  +০.১°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setFormerRotation(formerRotation + 90)}>
                  <RotateCw className="w-3 h-3 mr-0.5" />+৯০°
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Current Map Controls */}
        {currentMap && (
          <div className="space-y-3 my-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <span className="w-2 h-2 rounded-full bg-primary" />
              হাল ম্যাপ কন্ট্রোল
            </h3>

            {/* Rotation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <Label>রোটেশন</Label>
                <span>{currentRotation.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                step={0.1}
                value={currentRotation}
                onChange={(e) => setCurrentRotation(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex gap-1 mt-1">
                <Button variant="outline" size="xs" onClick={() => setCurrentRotation(currentRotation - 90)}>
                  <RotateCcw className="w-3 h-3 mr-0.5" />-৯০°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setCurrentRotation(currentRotation - 0.1)}>
                  -০.১°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setCurrentRotation(currentRotation + 0.1)}>
                  +০.১°
                </Button>
                <Button variant="outline" size="xs" onClick={() => setCurrentRotation(currentRotation + 90)}>
                  <RotateCw className="w-3 h-3 mr-0.5" />+৯০°
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Match Points List */}
        {matchPoints.length > 0 && (
          <div className="space-y-2 my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-heading">
                পয়েন্ট ({matchPoints.length})
              </h3>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setMatchPoints([])}
              >
                সব মুছুন
              </Button>
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
