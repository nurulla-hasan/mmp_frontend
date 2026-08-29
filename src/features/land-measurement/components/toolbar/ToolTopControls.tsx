"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/shallow";
import {
  Eye,
  EyeOff,
  Search,
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
    isMagnifierEnabled,
    setIsMagnifierEnabled,
  } = useMapStore(
    useShallow((s) => ({
      plots: s.plots,
      isShowDiagonals: s.isShowDiagonals,
      setIsShowDiagonals: s.setIsShowDiagonals,
      isMagnifierEnabled: s.isMagnifierEnabled,
      setIsMagnifierEnabled: s.setIsMagnifierEnabled,
    })),
  );

  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(Boolean(calcIdFromUrl));
  const [initialCalcId, setInitialCalcId] = useState<string | null>(calcIdFromUrl);

  useEffect(() => {
    if (calcIdFromUrl) {
      setInitialCalcId(calcIdFromUrl);
      setIsLoadOpen(true);
    }
  }, [calcIdFromUrl]);

  return (
    <>
      <div className="mb-2 flex justify-between items-center gap-2">
        <div id="step-toolbar" className="flex gap-2 flex-wrap items-center">
          <Button
            size="sm"
            onClick={() => setShowScratchSheet(!showScratchSheet)}
            variant={showScratchSheet ? "default" : "outline"}
            title="স্ক্র্যাচ শিট"
            className="hidden md:flex"
          >
            <FileText className="size-4" />
            <span className="hidden sm:inline">স্ক্র্যাচ শিট</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsShowDiagonals(!isShowDiagonals)}
            variant={isShowDiagonals ? "default" : "outline"}
            title="কর্ণ (Diagonals) দেখান/লুকান"
          >
            {isShowDiagonals ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            <span className="hidden sm:inline">কর্ণ</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsMagnifierEnabled(!isMagnifierEnabled)}
            variant={isMagnifierEnabled ? "default" : "outline"}
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">ম্যাগনিফায়ার</span>
          </Button>

          {/* Saved Calculations Dialog Trigger */}
          <Button
            size="sm"
            onClick={() => {
              setInitialCalcId(null);
              setIsLoadOpen(true);
            }}
            variant="outline"
            title="সংরক্ষিত পরিমাপসমূহ"
            className="gap-1.5 text-xs"
          >
            <FolderOpen className="size-4 text-primary" />
            <span>সংরক্ষিত পরিমাপ</span>
          </Button>

          {/* Save Calculation Dialog Trigger */}
          {plots.length > 0 && (
            <Button
              size="sm"
              onClick={() => setIsSaveOpen(true)}
              variant="default"
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              title="পরিমাপ সেভ করুন"
            >
              <BookmarkCheck className="size-4" />
              <span>সেভ করুন</span>
            </Button>
          )}
        </div>

        <div id="step-top-controls" className="flex items-center gap-2">
          <Button
            size="icon-sm"
            variant="outline"
            onClick={() => window.dispatchEvent(new Event("start-tutorial"))}
            title="টিউটোরিয়াল / সাহায্য"
            className="text-muted-foreground"
          >
            <HelpCircle className="size-4" />
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
