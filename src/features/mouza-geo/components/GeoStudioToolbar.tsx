import {
  Crosshair,
  FileText,
  Globe2,
  LocateFixed,
  MoreHorizontal,
  Redo2,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  locating?: boolean;
  onToggleSettings: () => void;
  onTogglePointMode: () => void;
  onSelectView: (view: "source" | "world") => void;
  onLocateUser?: () => void;
  onSimilarityClick: () => void;
  onAffineClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
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
  locating = false,
  onToggleSettings,
  onTogglePointMode,
  onSelectView,
  onLocateUser,
  onSimilarityClick,
  onAffineClick,
  onUndo,
  onRedo,
  onResetAlignment,
  mobile,
}: GeoStudioToolbarProps) {
  if (mobile) {
    return (
      <>
        {/* 1. Settings Drawer */}
        <FloatingToolButton
          icon={Settings2}
          label="ম্যাপ ও সেটিংস"
          active={settingsOpen}
          onClick={onToggleSettings}
          mobile={true}
        />

        <div className="mx-0.5 h-6 w-px bg-border/60" />

        {/* 2. Point Mode */}
        <FloatingToolButton
          icon={Crosshair}
          label={
            pointMode
              ? "পয়েন্ট মোড চালু (ক্লিক করলে পয়েন্ট বসবে)"
              : "প্যান মোড (ক্লিক করলে পয়েন্ট বসবে না)"
          }
          active={pointMode}
          onClick={onTogglePointMode}
          mobile={true}
        />

        <div className="mx-0.5 h-6 w-px bg-border/60" />

        {/* 3. View Switchers */}
        <FloatingToolButton
          icon={FileText}
          label="মৌজা PDF ভিউ"
          active={activeView === "source"}
          onClick={() => onSelectView("source")}
          mobile={true}
        />
        <FloatingToolButton
          icon={Globe2}
          label="World Map স্যাটেলাইট ভিউ"
          active={activeView === "world"}
          onClick={() => onSelectView("world")}
          mobile={true}
        />

        {/* 4. GPS Location Button */}
        {onLocateUser && (
          <FloatingToolButton
            icon={LocateFixed}
            label="আমার বর্তমান লোকেশন (GPS)"
            active={locating}
            onClick={onLocateUser}
            mobile={true}
          />
        )}

        <div className="mx-0.5 h-6 w-px bg-border/60" />

        {/* 5. Similarity Alignment Button (6th tool button) */}
        <FloatingToolButton
          icon={SlidersHorizontal}
          label="Similarity অ্যালাইনমেন্ট (২+ পয়েন্ট)"
          active={alignmentMode === "similarity" && Boolean(transform)}
          disabled={controlPairsCount < 2}
          onClick={onSimilarityClick}
          mobile={true}
        />

        {/* 6. 3-Dot More Tools Dropdown (7th button) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            nativeButton={false}
            render={<div className="inline-flex" />}
            className="focus:outline-none focus-visible:outline-none"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              title="অতিরিক্ত টুলস"
              aria-label="অতিরিক্ত টুলস"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={12}
            className="w-fit p-1 rounded-2xl border border-border bg-card/95 shadow-xl"
          >
            <div className="flex items-center gap-1">
              <FloatingToolButton
                icon={Sparkles}
                label="Affine রিফাইনমেন্ট (৩+ পয়েন্ট)"
                active={alignmentMode === "affine" && Boolean(transform)}
                disabled={controlPairsCount < 3}
                onClick={onAffineClick}
                mobile={true}
              />
              <div className="mx-0.5 h-6 w-px bg-border/60" />
              <FloatingToolButton
                icon={Undo2}
                label="শেষ পয়েন্ট বাতিল (Undo)"
                disabled={!canUndo}
                onClick={onUndo}
                mobile={true}
              />
              <FloatingToolButton
                icon={Redo2}
                label="পয়েন্ট ফিরিয়ে আনুন (Redo)"
                disabled={!canRedo}
                onClick={onRedo}
                mobile={true}
              />
              <div className="mx-0.5 h-6 w-px bg-border/60" />
              <FloatingToolButton
                icon={RotateCcw}
                label="অ্যালাইনমেন্ট রিসেট"
                disabled={controlPairsCount === 0 && !transform}
                onClick={onResetAlignment}
                mobile={true}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  // Desktop Vertical Toolbar
  return (
    <>
      {/* 1. Settings Drawer Toggle */}
      <FloatingToolButton
        icon={Settings2}
        label="ম্যাপ ও সেটিংস"
        active={settingsOpen}
        onClick={onToggleSettings}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

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
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 3. View Switchers & GPS */}
      <FloatingToolButton
        icon={FileText}
        label="মৌজা PDF ভিউ"
        active={activeView === "source"}
        onClick={() => onSelectView("source")}
        mobile={false}
      />
      <FloatingToolButton
        icon={Globe2}
        label="World Map স্যাটেলাইট ভিউ"
        active={activeView === "world"}
        onClick={() => onSelectView("world")}
        mobile={false}
      />

      {/* GPS Location Button */}
      {onLocateUser && (
        <FloatingToolButton
          icon={LocateFixed}
          label="আমার বর্তমান লোকেশন (GPS)"
          active={locating}
          onClick={onLocateUser}
          mobile={false}
        />
      )}

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 4. Quick Alignment Methods */}
      <FloatingToolButton
        icon={SlidersHorizontal}
        label="Similarity অ্যালাইনমেন্ট (২+ পয়েন্ট)"
        active={alignmentMode === "similarity" && Boolean(transform)}
        disabled={controlPairsCount < 2}
        onClick={onSimilarityClick}
        mobile={false}
      />
      <FloatingToolButton
        icon={Sparkles}
        label="Affine রিফাইনমেন্ট (৩+ পয়েন্ট)"
        active={alignmentMode === "affine" && Boolean(transform)}
        disabled={controlPairsCount < 3}
        onClick={onAffineClick}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 5. Undo / Redo */}
      <FloatingToolButton
        icon={Undo2}
        label="শেষ পয়েন্ট বাতিল (Undo)"
        disabled={!canUndo}
        onClick={onUndo}
        mobile={false}
      />
      <FloatingToolButton
        icon={Redo2}
        label="পয়েন্ট ফিরিয়ে আনুন (Redo)"
        disabled={!canRedo}
        onClick={onRedo}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 6. Alignment Reset */}
      <FloatingToolButton
        icon={RotateCcw}
        label="অ্যালাইনমেন্ট রিসেট"
        disabled={controlPairsCount === 0 && !transform}
        onClick={onResetAlignment}
        mobile={false}
      />
    </>
  );
}
