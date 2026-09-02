"use client";

import { Download, ImageDown, Loader2, Printer } from "lucide-react";

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
  onPrint?: () => void;
};

export default function StudioSheetSidebar({
  sheetDetails,
  mapDataUrl,
  exporting,
  onChangeField,
  onExport,
  onPrint,
}: StudioSheetSidebarProps) {
  return (
    <aside className="print:hidden absolute left-4 top-16 z-50 max-h-[85dvh] w-80 overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-2xl backdrop-blur-md">
      <h2 className="text-lg font-semibold">Sheet Setup</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Add sheet details and export a professional map sheet.
      </p>

      <div className="mt-5 space-y-3">
        {(
          [
            ["title", "Sheet Title"],
            ["ownerName", "Client / Prepared For"],
            ["mouzaName", "Mouza Name"],
            ["sheetNo", "Sheet No"],
            ["khatianNo", "Khatian No"],
            ["surveyorName", "Surveyed By"],
            ["preparedBy", "Prepared By"],
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
          <span className="mb-1 block text-muted-foreground">Date</span>
          <Input
            type="date"
            value={sheetDetails.date}
            onChange={(event) => onChangeField("date", event.target.value)}
          />
        </label>
      </div>

      <div className="mt-5 space-y-2">
        <Button
          type="button"
          variant="default"
          className="w-full gap-2 font-semibold"
          disabled={!mapDataUrl}
          onClick={onPrint}
        >
          <Printer className="size-4" />
          Print Sheet
        </Button>

        <div className="grid grid-cols-2 gap-2">
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
            variant="outline"
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
      </div>
    </aside>
  );
}
