import {
  Crosshair,
  FileText,
  Globe2,
  LocateFixed,
  MoreHorizontal,
  MoveDiagonal2,
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
  manualAdjustmentEnabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasImage?: boolean;
  locating?: boolean;
  onToggleSettings: () => void;
  onTogglePointMode: () => void;
  onToggleManualAdjustment: () => void;
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
  manualAdjustmentEnabled,
  canUndo,
  canRedo,
  hasImage = true,
  locating = false,
  onToggleSettings,
  onTogglePointMode,
  onToggleManualAdjustment,
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
          label="Maps & Settings"
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
              ? "Point Mode Active (Click to add point)"
              : "Pan Mode (Click to pan without adding point)"
          }
          active={pointMode}
          disabled={!hasImage}
          onClick={onTogglePointMode}
          mobile={true}
        />

        <div className="mx-0.5 h-6 w-px bg-border/60" />

        {/* 3. View Switchers */}
        <FloatingToolButton
          icon={FileText}
          label="Mouza PDF View"
          active={activeView === "source"}
          disabled={!hasImage}
          onClick={() => onSelectView("source")}
          mobile={true}
        />
        <FloatingToolButton
          icon={Globe2}
          label="World Satellite View"
          active={activeView === "world"}
          onClick={() => onSelectView("world")}
          mobile={true}
        />

        {/* 4. GPS Location Button */}
        {onLocateUser && (
          <FloatingToolButton
            icon={LocateFixed}
            label={
              locating
                ? "Locating current position…"
                : "My Current Location (GPS)"
            }
            active={locating}
            loading={locating}
            onClick={onLocateUser}
            mobile={true}
          />
        )}

        {/* 5. Similarity Alignment Button */}
        <div className="mx-0.5 h-6 w-px bg-border/60" />
        <FloatingToolButton
          icon={SlidersHorizontal}
          label="Similarity Alignment (2+ points)"
          active={alignmentMode === "similarity" && Boolean(transform)}
          disabled={controlPairsCount < 2}
          onClick={onSimilarityClick}
          mobile={true}
        />

        {/* 6. 3-Dot More Tools Dropdown */}
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
              title="More Tools"
              aria-label="More Tools"
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
                label="Affine Refinement (3+ points)"
                active={alignmentMode === "affine" && Boolean(transform)}
                disabled={controlPairsCount < 3}
                onClick={onAffineClick}
                mobile={true}
              />
              <FloatingToolButton
                icon={MoveDiagonal2}
                label={
                  manualAdjustmentEnabled
                    ? "Finish Manual Map Adjustment"
                    : "Adjust Map Manually"
                }
                active={manualAdjustmentEnabled}
                disabled={!transform}
                onClick={onToggleManualAdjustment}
                mobile={true}
              />
              <div className="mx-0.5 h-6 w-px bg-border/60" />
              <FloatingToolButton
                icon={Undo2}
                label="Undo Last Point"
                disabled={!canUndo}
                onClick={onUndo}
                mobile={true}
              />
              <FloatingToolButton
                icon={Redo2}
                label="Redo Point"
                disabled={!canRedo}
                onClick={onRedo}
                mobile={true}
              />
              <div className="mx-0.5 h-6 w-px bg-border/60" />
              <FloatingToolButton
                icon={RotateCcw}
                label="Reset Alignment"
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
        label="Maps & Settings"
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
            ? "Point Mode Active (Click to add point)"
            : "Pan Mode (Click to pan without adding point)"
        }
        active={pointMode}
        disabled={!hasImage}
        onClick={onTogglePointMode}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 3. View Switchers & GPS */}
      <FloatingToolButton
        icon={FileText}
        label="Mouza PDF View"
        active={activeView === "source"}
        disabled={!hasImage}
        onClick={() => onSelectView("source")}
        mobile={false}
      />
      <FloatingToolButton
        icon={Globe2}
        label="World Satellite View"
        active={activeView === "world"}
        onClick={() => onSelectView("world")}
        mobile={false}
      />

      {/* GPS Location Button */}
      {onLocateUser && (
        <FloatingToolButton
          icon={LocateFixed}
          label={
            locating
              ? "Locating current position…"
              : "My Current Location (GPS)"
          }
          active={locating}
          loading={locating}
          onClick={onLocateUser}
          mobile={false}
        />
      )}

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 4. Quick Alignment Methods */}
      <FloatingToolButton
        icon={SlidersHorizontal}
        label="Similarity Alignment (2+ points)"
        active={alignmentMode === "similarity" && Boolean(transform)}
        disabled={controlPairsCount < 2}
        onClick={onSimilarityClick}
        mobile={false}
      />
      <FloatingToolButton
        icon={Sparkles}
        label="Affine Refinement (3+ points)"
        active={alignmentMode === "affine" && Boolean(transform)}
        disabled={controlPairsCount < 3}
        onClick={onAffineClick}
        mobile={false}
      />
      <FloatingToolButton
        icon={MoveDiagonal2}
        label={
          manualAdjustmentEnabled
            ? "Finish Manual Map Adjustment"
            : "Adjust Map Manually"
        }
        active={manualAdjustmentEnabled}
        disabled={!transform}
        onClick={onToggleManualAdjustment}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 5. Undo / Redo */}
      <FloatingToolButton
        icon={Undo2}
        label="Undo Last Point"
        disabled={!canUndo}
        onClick={onUndo}
        mobile={false}
      />
      <FloatingToolButton
        icon={Redo2}
        label="Redo Point"
        disabled={!canRedo}
        onClick={onRedo}
        mobile={false}
      />

      <div className="my-0.5 h-px w-6 bg-border/60" />

      {/* 6. Alignment Reset */}
      <FloatingToolButton
        icon={RotateCcw}
        label="Reset Alignment"
        disabled={controlPairsCount === 0 && !transform}
        onClick={onResetAlignment}
        mobile={false}
      />
    </>
  );
}
