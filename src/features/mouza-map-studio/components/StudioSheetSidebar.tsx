"use client";

import { Download, ImageDown, Loader2 } from "lucide-react";

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
    <aside className="w-80 shrink-0 overflow-y-auto bg-sidebar p-4 text-sidebar-foreground">
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
            <input
              value={sheetDetails[field]}
              onChange={(event) => onChangeField(field, event.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 outline-none transition focus:border-primary"
            />
          </label>
        ))}

        <label className="block text-xs">
          <span className="mb-1 block text-muted-foreground">তারিখ</span>
          <input
            type="date"
            value={sheetDetails.date}
            onChange={(event) => onChangeField("date", event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 outline-none transition focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={Boolean(exporting) || !mapDataUrl}
          onClick={() => onExport("png")}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border text-xs font-semibold transition hover:bg-accent disabled:opacity-50"
        >
          {exporting === "png" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageDown className="size-4" />
          )}
          PNG
        </button>

        <button
          type="button"
          disabled={Boolean(exporting) || !mapDataUrl}
          onClick={() => onExport("pdf")}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:opacity-50"
        >
          {exporting === "pdf" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          PDF
        </button>
      </div>
    </aside>
  );
}
