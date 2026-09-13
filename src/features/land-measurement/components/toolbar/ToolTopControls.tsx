"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/shallow";
import {
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  BookmarkCheck,
  FolderOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMapStore } from "@/features/land-measurement/store/useMapStore";
import { SaveCalculationDialog } from "../calculations/save-calculation-dialog";
import { LoadCalculationDialog } from "../calculations/load-calculation-dialog";

interface ToolTopControlsProps {
  showScratchSheet: boolean;
  setShowScratchSheet: (show: boolean) => void;
}

export const ToolTopControls = ({
  showScratchSheet,
  setShowScratchSheet,
}: ToolTopControlsProps) => {
  const searchParams = useSearchParams();
  const calcIdFromUrl = searchParams.get("calculationId");

  const {
    plots,
    isShowDiagonals,
    setIsShowDiagonals,
  } = useMapStore(
    useShallow((s) => ({
      plots: s.plots,
      isShowDiagonals: s.isShowDiagonals,
      setIsShowDiagonals: s.setIsShowDiagonals,
    })),
  );

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(Boolean(calcIdFromUrl));
  const [initialCalcId, setInitialCalcId] = useState<string | null>(calcIdFromUrl);
  const [prevCalcId, setPrevCalcId] = useState<string | null>(calcIdFromUrl);

  if (calcIdFromUrl !== prevCalcId) {
    setPrevCalcId(calcIdFromUrl);
    setInitialCalcId(calcIdFromUrl);
    if (calcIdFromUrl) {
      setIsLoadOpen(true);
    }
  }

  return (
    <>
      <div className="mb-2 flex justify-between items-center gap-2">
        <div id="step-toolbar" className="flex gap-2 flex-wrap items-center">
          <Button
            size="sm"
            onClick={() => setShowScratchSheet(!showScratchSheet)}
            variant={showScratchSheet ? "default" : "outline"}
            title="Scratch Sheet"
            className="hidden md:inline-flex"
          >
            <FileText />
            <span className="hidden sm:inline">Scratch Sheet</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsShowDiagonals(!isShowDiagonals)}
            variant={isShowDiagonals ? "default" : "outline"}
            title="Show/Hide Diagonals"
          >
            {isShowDiagonals ? <Eye /> : <EyeOff />}
            <span className="hidden sm:inline">Diagonals</span>
          </Button>

          {/* Saved Calculations Dialog Trigger */}
          <Button
            size="sm"
            onClick={() => {
              setInitialCalcId(null);
              setIsLoadOpen(true);
            }}
            variant="outline"
            title="Saved Measurements"
          >
            <FolderOpen className="text-primary" />
            <span>Saved Measurements</span>
          </Button>

          {/* Save Calculation Dialog Trigger */}
          {plots.length > 0 && (
            <Button
              size="sm"
              onClick={() => setIsSaveOpen(true)}
              variant="default"
              title="Save Measurement"
            >
              <BookmarkCheck />
              <span>Save</span>
            </Button>
          )}
        </div>

        <div id="step-top-controls" className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => window.dispatchEvent(new Event("start-tutorial"))}
            title="Tutorial / Help"
          >
            <HelpCircle />
          </Button>
        </div>
      </div>

      <SaveCalculationDialog open={isSaveOpen} onOpenChange={setIsSaveOpen} />
      <LoadCalculationDialog
        open={isLoadOpen}
        onOpenChange={setIsLoadOpen}
        initialCalculationId={initialCalcId}
      />
    </>
  );
};
