"use client";

import { memo, useCallback, useRef, useState } from "react";
import { PantagraphCropDialog } from "./PantagraphCropDialog";
import { useShallow } from "zustand/shallow";
import { usePantagraphStore } from "../store/usePantagraphStore";
import { extractImageFromPDF } from "@/features/land-measurement/utils/pdfHelper";
import { useMediaQuery } from "@/hooks/useUtilityHooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from "@/components/ui/drawer";
import {
  ImageUp,
  Trash2,
  Loader2,
  RotateCw,
  Move,
  ZoomIn,
  X,
  FileText,
  SlidersHorizontal,
  Palette,
  Sparkles,
  Crosshair,
  HelpCircle,
} from "lucide-react";

// ─── Shared slider className ──────────────────────────────────────────────────
const sliderCls = (accent: "destructive" | "primary") => {
  const base =
    "w-full h-1.5 appearance-none cursor-pointer rounded-full bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-xs transition-all";
  if (accent === "destructive") {
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
  const [cropTarget, setCropTarget] = useState<"former" | "current" | null>(
    null,
  );
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  const {
    formerMap,
    currentMap,
    formerMapName,
    currentMapName,
    setFormerMap,
    setCurrentMap,
    imageLoading,
    setImageLoading,
  } = usePantagraphStore(
    useShallow((s) => ({
      formerMap: s.formerMap,
      currentMap: s.currentMap,
      formerMapName: s.formerMapName,
      currentMapName: s.currentMapName,
      setFormerMap: s.setFormerMap,
      setCurrentMap: s.setCurrentMap,
      imageLoading: s.imageLoading,
      setImageLoading: s.setImageLoading,
    })),
  );

  // ── Load file → data URL → open crop dialog ─────────────────────────────────
  const loadFileForCrop = useCallback(
    async (file: File, target: "former" | "current") => {
      setImageLoading(true);
      setPendingFileName(file.name);
      if (file.type === "application/pdf") {
        try {
          const img = await extractImageFromPDF(file);
          if (!img) {
            setImageLoading(false);
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          setCropSrc(dataUrl);
          setCropTarget(target);
        } catch (error) {
          console.error("PDF load error:", error);
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
    },
    [setImageLoading],
  );

  const handleFormerUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      loadFileForCrop(file, "former");
      e.target.value = "";
    },
    [loadFileForCrop],
  );

  const handleCurrentUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      loadFileForCrop(file, "current");
      e.target.value = "";
    },
    [loadFileForCrop],
  );

  // ── When crop is done ────────────────────────────────────────────────────────
  const handleCropDone = useCallback(
    (img: HTMLImageElement) => {
      if (cropTarget === "former") setFormerMap(img, pendingFileName);
      else if (cropTarget === "current") setCurrentMap(img, pendingFileName);
      setCropSrc(null);
      setCropTarget(null);
      setPendingFileName(null);
    },
    [cropTarget, pendingFileName, setFormerMap, setCurrentMap],
  );

  const handleCropClose = useCallback(() => {
    setCropSrc(null);
    setCropTarget(null);
    setPendingFileName(null);
  }, []);

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ImageUp className="size-3.5 text-primary" />
          <span>ম্যাপ আপলোড ও পেয়ারিং</span>
        </h3>

        {/* Former Map (CS / সাবেক) */}
        <div className="space-y-1.5">
          <input
            ref={formerInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFormerUpload}
          />

          {formerMap ? (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-destructive/30 bg-destructive/5 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex size-7.5 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
                  <FileText className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs text-foreground truncate font-mono"
                    title={formerMapName || "সাবেক_ম্যাপ.png"}
                  >
                    {formerMapName || "সাবেক_ম্যাপ.png"}
                  </p>
                  <p className="text-[10px] text-destructive">
                    সাবেক ম্যাপ (C.S / লাল)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => formerInputRef.current?.click()}
                  disabled={imageLoading}
                  title="সাবেক ম্যাপ পরিবর্তন করুন"
                >
                  <ImageUp className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7.5 border-border/80 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                  onClick={() => setFormerMap(null)}
                  title="সাবেক ম্যাপ মুছে ফেলুন"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => formerInputRef.current?.click()}
              disabled={imageLoading}
              className="w-full gap-1.5 text-xs h-9 border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:border-destructive/60 transition-colors"
            >
              <ImageUp className="size-3.5 text-destructive" />
              {imageLoading ? "লোড হচ্ছে..." : "সাবেক ম্যাপ আপলোড (C.S)"}
            </Button>
          )}
        </div>

        {/* Current Map (BS / হাল) */}
        <div className="space-y-1.5">
          <input
            ref={currentInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleCurrentUpload}
          />

          {currentMap ? (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex size-7.5 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <FileText className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs text-foreground truncate font-mono"
                    title={currentMapName || "হাল_ম্যাপ.png"}
                  >
                    {currentMapName || "হাল_ম্যাপ.png"}
                  </p>
                  <p className="text-[10px] text-primary">
                    হাল ম্যাপ (B.S / সবুজ)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7.5 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => currentInputRef.current?.click()}
                  disabled={imageLoading}
                  title="হাল ম্যাপ পরিবর্তন করুন"
                >
                  <ImageUp className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7.5 border-border/80 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                  onClick={() => setCurrentMap(null)}
                  title="হাল ম্যাপ মুছে ফেলুন"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentInputRef.current?.click()}
              disabled={imageLoading}
              className="w-full gap-1.5 text-xs h-9 border-primary/40 bg-primary/5 text-primary hover:bg-primary/15 hover:border-primary/60 transition-colors"
            >
              <ImageUp className="size-3.5 text-primary" />
              {imageLoading ? "লোড হচ্ছে..." : "হাল ম্যাপ আপলোড (B.S)"}
            </Button>
          )}
        </div>
      </div>

      {/* Crop Dialog */}
      {cropSrc && cropTarget && (
        <PantagraphCropDialog
          open={true}
          imageSrc={cropSrc}
          mapLabel={cropTarget === "former" ? "সাবেক ম্যাপ" : "হাল ম্যাপ"}
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
    <div className="space-y-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5 shadow-xs">
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none"
          onClick={toggleFormerBgRemoval}
        >
          <span className="size-2 rounded-full bg-destructive shrink-0" />
          <span>সাবেক ব্যাকগ্রাউন্ড রিমুভ</span>
        </span>

        {isRemovingFormerBg ? (
          <div className="flex h-5 w-9 items-center justify-center">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={formerBgRemoved}
            onClick={toggleFormerBgRemoval}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              formerBgRemoved ? "bg-destructive" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-xs transition-transform ${
                formerBgRemoved ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>

      {formerBgRemoved && (
        <div className="space-y-2 pt-2 border-t border-destructive/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              লাইন ধরার মাত্রা
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[11px] text-destructive bg-destructive/10 border-destructive/30"
            >
              {formerBlackSensitivity}%
            </Badge>
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
            className={sliderCls("destructive")}
          />
          <p className="text-[11px] leading-4 text-muted-foreground">
            কমালে শুধু গাঢ় কালো, বাড়ালে ফিকে লাইনও থাকবে। C.S লাইন লাল দেখাবে।
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
    <div className="space-y-2 p-3 rounded-xl border border-primary/30 bg-primary/5 shadow-xs">
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none"
          onClick={toggleCurrentBgRemoval}
        >
          <span className="size-2 rounded-full bg-primary shrink-0" />
          <span>হাল ব্যাকগ্রাউন্ড রিমুভ</span>
        </span>

        {isRemovingCurrentBg ? (
          <div className="flex h-5 w-9 items-center justify-center">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={currentBgRemoved}
            onClick={toggleCurrentBgRemoval}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              currentBgRemoved ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-xs transition-transform ${
                currentBgRemoved ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>

      {currentBgRemoved && (
        <div className="space-y-2 pt-2 border-t border-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              লাইন ধরার মাত্রা
            </span>
            <Badge
              variant="outline"
              className="font-mono text-[11px] text-primary bg-primary/10 border-primary/30"
            >
              {currentBlackSensitivity}%
            </Badge>
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
            className={sliderCls("primary")}
          />
          <p className="text-[11px] leading-4 text-muted-foreground">
            কমালে শুধু গাঢ় কালো, বাড়ালে ফিকে লাইনও থাকবে। B.S লাইন সবুজ দেখাবে।
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
    <div className="space-y-3 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <SlidersHorizontal className="size-3.5 text-primary" />
        <span>ওপাসিটি ও ট্রান্সপারেন্সি</span>
      </h3>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-destructive shrink-0" />
            <span>সাবেক (C.S)</span>
          </span>
          <Badge variant="outline" className="font-mono text-[11px]">
            {Math.round(formerOpacity * 100)}%
          </Badge>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={formerOpacity}
          onChange={(event) => setFormerOpacity(Number(event.target.value))}
          className={sliderCls("destructive")}
        />
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary shrink-0" />
            <span>হাল (B.S)</span>
          </span>
          <Badge variant="outline" className="font-mono text-[11px]">
            {Math.round(currentOpacity * 100)}%
          </Badge>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentOpacity}
          onChange={(event) => setCurrentOpacity(Number(event.target.value))}
          className={sliderCls("primary")}
        />
      </div>
    </div>
  );
});

// ─── Sub-component: Line Smoothing ───────────────────────────────────────────
const LineSmoothingSection = memo(function LineSmoothingSection() {
  const {
    lineSmoothing,
    setLineSmoothing,
    formerBgRemoved,
    currentBgRemoved,
  } = usePantagraphStore(
    useShallow((s) => ({
      lineSmoothing: s.lineSmoothing,
      setLineSmoothing: s.setLineSmoothing,
      formerBgRemoved: s.formerBgRemoved,
      currentBgRemoved: s.currentBgRemoved,
    })),
  );

  if (!formerBgRemoved && !currentBgRemoved) return null;

  return (
    <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground">
          লাইন মসৃণতা
        </span>
        <Badge variant="outline" className="font-mono text-[11px]">
          {lineSmoothing === 0 ? "বন্ধ" : `${lineSmoothing}/10`}
        </Badge>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={lineSmoothing}
        onChange={(e) => setLineSmoothing(Number(e.target.value))}
        className={sliderCls("primary")}
      />
      <p className="text-[10px] text-muted-foreground leading-tight">
        স্লাইডার পরিবর্তন করলে লাইনগুলো আরও মসৃণ ও স্পষ্ট হবে
      </p>
    </div>
  );
});

// ─── Sub-component: Active Map Toggle ────────────────────────────────────────
const ActiveMapSection = memo(function ActiveMapSection() {
  const { activeMap, setActiveMap } = usePantagraphStore(
    useShallow((s) => ({
      activeMap: s.activeMap,
      setActiveMap: s.setActiveMap,
    })),
  );

  return (
    <div className="space-y-2.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="size-3.5 text-primary" />
        <span>সক্রিয় ম্যাপ নির্বাচন</span>
      </span>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={activeMap === "former" ? "destructive" : "outline"}
          size="sm"
          className="text-xs h-8.5 gap-1.5"
          onClick={() => setActiveMap("former")}
        >
          <span className="size-2 rounded-full bg-white shrink-0" />
          সাবেক ম্যাপ
        </Button>
        <Button
          variant={activeMap === "current" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8.5 gap-1.5"
          onClick={() => setActiveMap("current")}
        >
          <span className="size-2 rounded-full bg-white shrink-0" />
          হাল ম্যাপ
        </Button>
      </div>
    </div>
  );
});

// ─── Sub-component: Match Points ─────────────────────────────────────────────
const MatchPointsSection = memo(function MatchPointsSection() {
  const { matchPoints, removeMatchPoint } = usePantagraphStore(
    useShallow((s) => ({
      matchPoints: s.matchPoints,
      removeMatchPoint: s.removeMatchPoint,
    })),
  );

  if (matchPoints.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Crosshair className="size-3.5 text-primary" />
          <span>ম্যাচিং পয়েন্ট ({matchPoints.length})</span>
        </h3>
        <Badge variant="outline" className="font-mono text-[10px]">
          {matchPoints.length} pair
        </Badge>
      </div>

      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {matchPoints.map((point, index) => (
          <div
            key={point.id}
            className="flex items-center justify-between bg-muted/40 border border-border/70 rounded-lg px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground">
                পয়েন্ট #{index + 1}
              </span>
              {point.current === null && (
                <span className="text-[10px] text-destructive">
                  (অসম্পূর্ণ)
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeMatchPoint(point.id)}
            >
              <X className="size-3" />
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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wider">
          অ্যালাইনমেন্ট রেজাল্ট
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAlignment}
          className="h-6 text-xs text-destructive hover:bg-destructive/10 px-2"
        >
          রিসেট
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
            <RotateCw className="size-3" />
            রোটেশন
          </div>
          <p className="text-sm text-foreground font-mono">
            {((alignmentResult.rotation! * 180) / Math.PI).toFixed(2)}°
          </p>
        </div>
        {alignmentType === "affine" ? (
          <>
            <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                <ZoomIn className="size-3" />
                স্কেল X
              </div>
              <p className="text-sm text-foreground font-mono">
                {alignmentResult.a!.toFixed(4)}×
              </p>
            </div>
            <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
                <ZoomIn className="size-3" />
                স্কেল Y
              </div>
              <p className="text-sm text-foreground font-mono">
                {alignmentResult.d!.toFixed(4)}×
              </p>
            </div>
          </>
        ) : (
          <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
              <ZoomIn className="size-3" />
              স্কেল
            </div>
            <p className="text-sm text-foreground font-mono">
              {alignmentResult.scale!.toFixed(4)}×
            </p>
          </div>
        )}
        <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
            <Move className="size-3" />
            স্থানান্তর X
          </div>
          <p className="text-sm text-foreground font-mono">
            {alignmentResult.tx.toFixed(1)}px
          </p>
        </div>
        <div className="bg-muted/40 border border-border/70 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-0.5">
            <Move className="size-3" />
            স্থানান্তর Y
          </div>
          <p className="text-sm text-foreground font-mono">
            {alignmentResult.ty.toFixed(1)}px
          </p>
        </div>
      </div>
    </div>
  );
});

// ─── Sub-component: Workflow Guide Card ───────────────────────────────────────
const WorkflowGuideCard = memo(function WorkflowGuideCard() {
  return (
    <div className="space-y-2 p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs">
      <div className="flex items-center gap-1.5 text-primary font-medium">
        <HelpCircle className="size-3.5" />
        <span>তুলনা ও অ্যালাইনমেন্ট গাইড</span>
      </div>
      <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
        <p className="flex items-start gap-1.5">
          <span className="size-1.5 rounded-full bg-destructive shrink-0 mt-1" />
          <span>১. সাবেক (C.S) ও হাল (B.S) ম্যাপ আপলোড করুন।</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1" />
          <span>২. কমন ল্যান্ডমার্কে ম্যাচিং পয়েন্ট পেয়ার করুন।</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
          <span>৩. নিখুঁত মিল দেখতে ব্যাকগ্রাউন্ড রিমুভ ও ওপাসিটি ব্যবহার করুন।</span>
        </p>
      </div>
    </div>
  );
});

// ─── Canvas Background section ────────────────────────────────────────────────
const bgOptions = [
  { label: "সিস্টেম", key: "auto" as const, color: "#71717a" },
  { label: "ডার্ক গ্রিড", key: "dark" as const, color: "#18181b" },
  { label: "সাদা গ্রিড", key: "white" as const, color: "#ffffff" },
];

// ─── Shared Sidebar Content ───────────────────────────────────────────────────
const SidebarContent = memo(function SidebarContent() {
  const { hasFormerMap, hasCurrentMap, canvasBg, setCanvasBg } =
    usePantagraphStore(
      useShallow((s) => ({
        hasFormerMap: s.formerMap !== null,
        hasCurrentMap: s.currentMap !== null,
        canvasBg: s.canvasBg,
        setCanvasBg: s.setCanvasBg,
      })),
    );

  const hasAnyMap = hasFormerMap || hasCurrentMap;

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* 1. Map Upload Section */}
      <MapUploadSection />

      {/* 2. When maps are loaded: show BG removal cards */}
      {hasFormerMap && <FormerBgSection />}
      {hasCurrentMap && <CurrentBgSection />}
      <LineSmoothingSection />

      {/* 3. When both maps are loaded: show Opacity */}
      {hasFormerMap && hasCurrentMap && (
        <>
          <Separator className="bg-border/60" />
          <OpacitySection />
        </>
      )}

      {/* 4. Match Points & Results (Only when points exist) */}
      <MatchPointsSection />
      <AlignmentResultSection />

      <Separator className="bg-border/60" />

      {/* 5. Active Map Selector */}
      <ActiveMapSection />

      <Separator className="bg-border/60" />

      {/* 6. Canvas Background */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="size-3.5 text-primary" />
          <span>ক্যানভাস ব্যাকগ্রাউন্ড</span>
        </span>
        <div className="flex gap-2.5 items-center">
          {bgOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setCanvasBg(opt.key)}
              className={`size-5 rounded-full transition-all border ${
                canvasBg === opt.key
                  ? "ring-2 ring-primary ring-offset-1.5 ring-offset-card scale-110 border-foreground"
                  : "border-border/80 opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: opt.color }}
              title={opt.label}
            />
          ))}
        </div>
      </div>

      {/* 7. Workflow Guide (Shown only before map upload so initial state is clean & informative) */}
      {!hasAnyMap && (
        <>
          <Separator className="bg-border/60" />
          <WorkflowGuideCard />
        </>
      )}
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
interface PantagraphSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const PantagraphSidebar = memo(function PantagraphSidebar({
  isOpen = false,
  onClose,
}: PantagraphSidebarProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (!isOpen) return null;

  return (
    <>
      {/* ── Desktop Floating Panel ── */}
      <div className="absolute left-4 top-16 max-h-[85dvh] w-84 bg-card/95 border border-border/80 flex-col z-20 hidden md:flex overflow-hidden rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 shrink-0 bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Move className="size-3.5" />
            </div>
            <div>
              <h2 className="font-heading text-sm text-foreground">
                ম্যাপ ও অ্যালাইনমেন্ট
              </h2>
              <p className="text-xs text-muted-foreground">
                সাবেক ও হাল ম্যাপ তুলনা → অ্যালাইন
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-3.5" />
          </Button>
        </div>
        <div className="overflow-y-auto" style={{ minHeight: 0 }}>
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Drawer — bottom sheet visible on small screens */}
      {isMobile && (
        <div className="md:hidden">
          <Drawer
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) onClose?.();
            }}
          >
            <DrawerPortal>
              <DrawerOverlay className="md:hidden" />
              <DrawerContent className="max-h-[85dvh] flex flex-col md:hidden">
                {/* Handle + header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Move className="size-3.5" />
                    </div>
                    <div>
                      <h2 className="font-heading text-base text-foreground">
                        ম্যাপ ও অ্যালাইনমেন্ট
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        সাবেক ও হাল ম্যাপ তুলনা → অ্যালাইন
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                {/* Scrollable content */}
                <div
                  className="flex-1 overflow-y-auto"
                  style={{ minHeight: 0 }}
                >
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
