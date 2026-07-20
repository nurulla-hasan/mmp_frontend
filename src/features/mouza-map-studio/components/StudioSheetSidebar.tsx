"use client";

import { Download, ImageDown, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { StudioSheetDetails } from "../store/useMouzaMapStudioStore";

type ExportFormat = "png" | "pdf";

type StudioSheetSidebarProps = {
  sheetDetails: StudioSheetDetails;
  mapDataUrl: string | null;
  exporting: ExportFormat | null;
  onChangeField: (field: keyof StudioSheetDetails, value: string) => void;
  onExport: (format: ExportFormat) => void;
};

export default function StudioSheetSidebar({
  sheetDetails,
  mapDataUrl,
  exporting,
  onChangeField,
  onExport,
}: StudioSheetSidebarProps) {
  return (
    <aside className="absolute left-4 top-16 z-50 max-h-[85dvh] w-80 overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-md">
      <h2 className="text-lg font-semibold">শিট তৈরি</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Edited real map-এ তথ্য যোগ করে professional sheet export করুন।
      </p>

      <div className="mt-5 space-y-3">
        {(
          [
            ["title", "শিটের শিরোনাম"],
            ["ownerName", "Pantagraph For / যার জন্য তৈরি"],
            ["mouzaName", "মৌজার নাম"],
            ["sheetNo", "শিট নম্বর"],
            ["khatianNo", "খতিয়ান নম্বর"],
            ["surveyorName", "Surveyed by"],
            ["preparedBy", "CAD/Prepared by"],
          ] as Array<[keyof StudioSheetDetails, string]>
        ).map(([field, label]) => (
          <label key={field} className="block text-xs">
            <span className="mb-1 block text-muted-foreground">{label}</span>
            <Input
              value={sheetDetails[field]}
              onChange={(event) => onChangeField(field, event.target.value)}
            />
          </label>
        ))}

        <label className="block text-xs">
          <span className="mb-1 block text-muted-foreground">তারিখ</span>
          <Input
            type="date"
            value={sheetDetails.date}
            onChange={(event) => onChangeField("date", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={Boolean(exporting) || !mapDataUrl}
          onClick={() => onExport("png")}
        >
          {exporting === "png" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageDown className="size-4" />
          )}
          PNG
        </Button>

        <Button
          type="button"
          variant="default"
          disabled={Boolean(exporting) || !mapDataUrl}
          onClick={() => onExport("pdf")}
        >
          {exporting === "pdf" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          PDF
        </Button>
      </div>
    </aside>
  );
}
