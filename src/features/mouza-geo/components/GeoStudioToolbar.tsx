import {
  Crosshair,
  Download,
  FileText,
  Globe2,
  LocateFixed,
  Redo2,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Undo2,
} from "lucide-react";

import type { AlignmentMode } from "../types";
import FloatingToolButton from "./FloatingToolButton";

type GeoStudioToolbarProps = {
  settingsOpen: boolean;
  activeView: "source" | "world";
  transform: unknown;
  alignmentMode: AlignmentMode;
  controlPairsCount: number;
  pointMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canExport: boolean;
  locating?: boolean;
  onToggleSettings: () => void;
  onTogglePointMode: () => void;
  onSelectView: (view: "source" | "world") => void;
  onLocateUser?: () => void;
  onSimilarityClick: () => void;
  onAffineClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onResetAlignment: () => void;
  mobile: boolean;
};

export default function GeoStudioToolbar({
  settingsOpen,
  activeView,
  transform,
  alignmentMode,
  controlPairsCount,
  pointMode,
  canUndo,
  canRedo,
  canExport,
  locating = false,
  onToggleSettings,
  onTogglePointMode,
  onSelectView,
  onLocateUser,
  onSimilarityClick,
  onAffineClick,
  onUndo,
  onRedo,
  onExport,
  onResetAlignment,
  mobile,
}: GeoStudioToolbarProps) {
  const divider = mobile ? (
    <div className="mx-0.5 h-6 w-px bg-border/60" />
  ) : (
    <div className="my-0.5 h-px w-6 bg-border/60" />
  );

  return (
    <>
      {/* 1. Settings Drawer Toggle */}
      <FloatingToolButton
        icon={Settings2}
        label="ম্যাপ ও সেটিংস"
        active={settingsOpen}
        onClick={onToggleSettings}
        mobile={mobile}
      />

      {divider}

      {/* 2. Point Mode Toggle (Crosshair) */}
      <FloatingToolButton
        icon={Crosshair}
        label={
          pointMode
            ? "পয়েন্ট মোড চালু (ক্লিক করলে পয়েন্ট বসবে)"
            : "প্যান মোড (ক্লিক করলে পয়েন্ট বসবে না)"
        }
        active={pointMode}
        onClick={onTogglePointMode}
        mobile={mobile}
      />

      {divider}

      {/* 3. View Switchers */}
      <FloatingToolButton
        icon={FileText}
        label="মৌজা PDF ভিউ"
        active={activeView === "source"}
        onClick={() => onSelectView("source")}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={Globe2}
        label="World Map স্যাটেলাইট ভিউ"
        active={activeView === "world"}
        onClick={() => onSelectView("world")}
        mobile={mobile}
      />

      {/* GPS Location Button */}
      {onLocateUser && (
        <FloatingToolButton
          icon={LocateFixed}
          label="আমার বর্তমান লোকেশন (GPS)"
          active={locating}
          onClick={onLocateUser}
          mobile={mobile}
        />
      )}

      {divider}

      {/* 4. Quick Alignment Methods */}
      <FloatingToolButton
        icon={SlidersHorizontal}
        label="Similarity অ্যালাইনমেন্ট (২+ পয়েন্ট)"
        active={alignmentMode === "similarity" && Boolean(transform)}
        disabled={controlPairsCount < 2}
        onClick={onSimilarityClick}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={Sparkles}
        label="Affine রিফাইনমেন্ট (৩+ পয়েন্ট)"
        active={alignmentMode === "affine" && Boolean(transform)}
        disabled={controlPairsCount < 3}
        onClick={onAffineClick}
        mobile={mobile}
      />

      {divider}

      {/* 5. Undo / Redo */}
      <FloatingToolButton
        icon={Undo2}
        label="শেষ পয়েন্ট বাতিল (Undo)"
        disabled={!canUndo}
        onClick={onUndo}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={Redo2}
        label="পয়েন্ট ফিরিয়ে আনুন (Redo)"
        disabled={!canRedo}
        onClick={onRedo}
        mobile={mobile}
      />

      {divider}

      {/* 6. KMZ Export & Reset */}
      <FloatingToolButton
        icon={Download}
        label="KMZ ফাইল ডাউনলোড"
        disabled={!transform || !canExport}
        onClick={onExport}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCcw}
        label="অ্যালাইনমেন্ট রিসেট"
        disabled={controlPairsCount === 0 && !transform}
        onClick={onResetAlignment}
        mobile={mobile}
      />
    </>
  );
}
