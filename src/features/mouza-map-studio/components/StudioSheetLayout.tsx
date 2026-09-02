"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ErrorToast, SuccessToast } from "@/lib/utils";
import {
  useMouzaMapStudioStore,
  type StudioSheetDetails,
} from "../store/useMouzaMapStudioStore";
import StudioSheetSidebar from "./StudioSheetSidebar";
import StudioSheetPreview from "./StudioSheetPreview";

type ExportFormat = "png" | "pdf";

const EXPORT_WIDTH = 1120;
const EXPORT_HEIGHT = 792;

const escapeXml = (value: string | number) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const loadSvgImage = (svg: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const fallbackImage = new window.Image();
      fallbackImage.onload = () => resolve(fallbackImage);
      fallbackImage.onerror = (err) => {
        console.error("SVG export render error:", err);
        reject(new Error("Could not render export sheet"));
      };
      fallbackImage.src = dataUri;
    };
    image.src = url;
  });

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export default function StudioSheetLayout() {
  const [mapDataUrl, setMapDataUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    editorImage,
    editorStrokes,
    editorTexts,
    sheetDetails,
    updateSheetDetails,
  } = useMouzaMapStudioStore();

  const imageWidth = editorImage?.naturalWidth || editorImage?.width || 1200;
  const imageHeight = editorImage?.naturalHeight || editorImage?.height || 800;

  useEffect(() => {
    if (!editorImage) return;

    const frame = requestAnimationFrame(() => {
      const sourceWidth = editorImage.naturalWidth || editorImage.width;
      const sourceHeight = editorImage.naturalHeight || editorImage.height;
      const scale = Math.min(1, 2400 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext("2d");

      if (!context) return;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(editorImage, 0, 0, canvas.width, canvas.height);
      setMapDataUrl(canvas.toDataURL("image/jpeg", 0.94));
      canvasRef.current = canvas;
    });

    return () => {
      cancelAnimationFrame(frame);
      // Reset data URL in cleanup when editorImage changes
      setMapDataUrl(null);
      if (canvasRef.current) {
        canvasRef.current.width = 1;
        canvasRef.current.height = 1;
        canvasRef.current = null;
      }
    };
  }, [editorImage]);

  const updateField = useCallback(
    (field: keyof StudioSheetDetails, value: string) => {
      updateSheetDetails({ [field]: value });
    },
    [updateSheetDetails],
  );

  const exportSheet = useCallback(
    async (format: ExportFormat) => {
      if (!editorImage || !mapDataUrl) {
        ErrorToast("Please prepare the Final Edit map before exporting the sheet");
        return;
      }

      setExporting(format);
      try {
        const editorMarkup = [
          ...editorStrokes.map((stroke) => {
            const points = stroke.points
              .map((point) => `${point.x},${point.y}`)
              .join(" ");
            return `<polyline points="${points}" fill="none" stroke="${escapeXml(stroke.color)}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
          }),
          ...editorTexts
            .filter((item) => item.text.trim())
            .map(
              (item) =>
                `<text x="${item.x}" y="${item.y}" fill="${escapeXml(item.color)}" font-size="${item.fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(item.text)}</text>`,
            ),
        ].join("");

        const details: Array<[string, string]> = [
          ["CLIENT / FOR", sheetDetails.ownerName],
          ["MOUZA NAME", sheetDetails.mouzaName],
          ["SHEET NO", sheetDetails.sheetNo],
          ["KHATIAN NO", sheetDetails.khatianNo],
          ["SURVEYED BY", sheetDetails.surveyorName],
          ["PREPARED BY", sheetDetails.preparedBy],
          ["DATE", sheetDetails.date],
        ];

        const detailsMarkup = details
          .map(([label, value], index) => {
            const y = 205 + index * 34;
            return `
              <rect x="842" y="${y - 12}" width="248" height="34" fill="${index % 2 === 0 ? '#ffffff' : '#f8fafc'}" stroke="#e2e8f0" stroke-width="0.5"/>
              <text x="852" y="${y + 8}" font-size="10" font-weight="700" fill="#334155">${escapeXml(label)}:</text>
              <text x="950" y="${y + 8}" font-size="10" font-weight="600" fill="#0f172a">${escapeXml(value || "—")}</text>
            `;
          })
          .join("");

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}">
        <rect width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" fill="#ffffff"/>
        <rect x="14" y="14" width="1092" height="764" fill="none" stroke="#0f766e" stroke-width="2"/>
        <rect x="20" y="20" width="1080" height="752" fill="none" stroke="#0f766e" stroke-width="0.75" stroke-opacity="0.4"/>

        <line x1="832" y1="20" x2="832" y2="772" stroke="#0f766e" stroke-width="1.5" stroke-opacity="0.6"/>
        <line x1="20" y1="78" x2="832" y2="78" stroke="#0f766e" stroke-width="1.5" stroke-opacity="0.6"/>
        <line x1="20" y1="738" x2="832" y2="738" stroke="#e2e8f0" stroke-width="1"/>
        <line x1="832" y1="156" x2="1100" y2="156" stroke="#0f766e" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="832" y1="724" x2="1100" y2="724" stroke="#e2e8f0" stroke-width="1"/>

        <g font-family="Arial, 'Noto Sans Bengali', sans-serif">
          <text x="36" y="44" font-size="18" font-weight="900" fill="#042f2e">${escapeXml(sheetDetails.title || "C.S & B.S MOUZA MAP COMPARISON")}</text>
          <text x="36" y="62" font-size="10" font-weight="600" fill="#0f766e">DIGITAL OVERLAY &amp; BOUNDARY ALIGNMENT REPORT</text>

          <rect x="520" y="36" width="144" height="26" rx="6" ry="6" fill="#fef2f2" stroke="#fecaca" stroke-width="1"/>
          <circle cx="534" cy="49" r="4" fill="#dc2626"/>
          <text x="544" y="49" font-size="10" font-weight="700" fill="#b91c1c" dominant-baseline="central">C.S MAP (RED / সাবেক)</text>

          <rect x="672" y="36" width="148" height="26" rx="6" ry="6" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
          <circle cx="686" cy="49" r="4" fill="#16a34a"/>
          <text x="696" y="49" font-size="10" font-weight="700" fill="#047857" dominant-baseline="central">B.S MAP (GREEN / হাল)</text>

          <rect x="36" y="90" width="784" height="636" fill="#fafafa" stroke="#e2e8f0" stroke-width="1" rx="4"/>
          <svg x="36" y="90" width="784" height="636" viewBox="0 0 ${imageWidth} ${imageHeight}" preserveAspectRatio="xMidYMid meet">
            <image href="${escapeXml(mapDataUrl)}" xlink:href="${escapeXml(mapDataUrl)}" x="0" y="0" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="none"/>
            ${editorMarkup}
          </svg>

          <text x="36" y="756" font-size="9" fill="#64748b" dominant-baseline="central">This comparison sheet was generated using precision coordinate matching algorithms.</text>
          <text x="820" y="756" font-size="9" font-weight="700" fill="#0f766e" text-anchor="end" dominant-baseline="central">Mouza Map Pro Studio</text>

          <g transform="translate(966, 85)">
            <circle cx="0" cy="0" r="42" stroke="#0F766E" stroke-width="1.5" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="38" stroke="#CBD5E1" stroke-width="0.8" stroke-dasharray="2,2" fill="none" />
            <circle cx="0" cy="0" r="30" stroke="#E2E8F0" stroke-width="0.8" fill="none" />
            <polygon points="0,-36 5,0 0,-4" fill="#DC2626" />
            <polygon points="0,-36 -5,0 0,-4" fill="#EF4444" />
            <polygon points="0,36 5,0 0,4" fill="#334155" />
            <polygon points="0,36 -5,0 0,4" fill="#64748B" />
            <polygon points="36,0 0,5 4,0" fill="#94A3B8" />
            <polygon points="36,0 0,-5 4,0" fill="#CBD5E1" />
            <polygon points="-36,0 0,5 -4,0" fill="#94A3B8" />
            <polygon points="-36,0 0,-5 -4,0" fill="#CBD5E1" />
            <circle cx="0" cy="0" r="4" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5" />
            <text x="0" y="-39" text-anchor="middle" font-size="9" font-weight="900" fill="#DC2626">N</text>
            <text x="0" y="47" text-anchor="middle" font-size="8" font-weight="bold" fill="#475569">S</text>
            <text x="45" y="3" text-anchor="middle" font-size="8" font-weight="bold" fill="#475569">E</text>
            <text x="-45" y="3" text-anchor="middle" font-size="8" font-weight="bold" fill="#475569">W</text>
            <text x="0" y="58" text-anchor="middle" font-size="8" font-weight="bold" fill="#0F766E">NORTH / উত্তর</text>
          </g>

          <rect x="842" y="168" width="248" height="24" fill="#0f766e" rx="3" ry="3"/>
          <text x="966" y="184" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">SHEET SPECIFICATIONS</text>
          ${detailsMarkup}

          <rect x="842" y="452" width="248" height="84" fill="#f8fafc" stroke="#94a3b8" stroke-dasharray="3,3" rx="4"/>
          <text x="966" y="488" font-size="11" font-weight="700" fill="#042f2e" text-anchor="middle">${escapeXml(sheetDetails.surveyorName || "")}</text>
          <line x1="870" y1="495" x2="1062" y2="495" stroke="#94a3b8"/>
          <text x="966" y="510" font-size="9" font-weight="700" fill="#334155" text-anchor="middle">SURVEYOR SIGNATURE &amp; SEAL</text>
          <text x="966" y="522" font-size="8" fill="#64748b" text-anchor="middle">সার্ভেয়ারের স্বাক্ষর ও সিল</text>

          <text x="966" y="744" font-size="10" font-weight="900" fill="#0f766e" text-anchor="middle">MOUZA MAP PRO</text>
          <text x="966" y="756" font-size="8" fill="#64748b" text-anchor="middle">www.mouzamappro.com</text>
        </g>
      </svg>`;

        const image = await loadSvgImage(svg);
        const canvas = document.createElement("canvas");
        canvas.width = EXPORT_WIDTH * 2;
        canvas.height = EXPORT_HEIGHT * 2;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Could not create export canvas");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        if (format === "png") {
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (value) =>
                value ? resolve(value) : reject(new Error("Failed to generate PNG")),
              "image/png",
            );
          });
          downloadBlob(blob, "mouza-map-comparison.png");
        } else {
          const { default: jsPDF } = await import("jspdf");
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (value) =>
                value
                  ? resolve(value)
                  : reject(new Error("Failed to generate PDF image")),
              "image/jpeg",
              0.96,
            );
          });
          const imageBytes = new Uint8Array(await blob.arrayBuffer());
          const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });
          pdf.addImage(imageBytes, "JPEG", 0, 0, 297, 210);
          pdf.save("mouza-map-comparison.pdf");
        }

        canvas.width = 1;
        canvas.height = 1;
        SuccessToast(
          format === "png" ? "PNG exported successfully" : "PDF exported successfully",
        );
      } catch (error) {
        console.error(error);
        ErrorToast("Could not export sheet");
      } finally {
        setExporting(null);
      }
    },
    [editorImage, mapDataUrl, editorStrokes, editorTexts, sheetDetails, imageWidth, imageHeight],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const visibleTexts = editorTexts.filter((item) => item.text.trim());

  return (
    <div className="relative h-full min-h-0 bg-background pt-16">
      <StudioSheetSidebar
        sheetDetails={sheetDetails}
        mapDataUrl={mapDataUrl}
        exporting={exporting}
        onChangeField={updateField}
        onExport={exportSheet}
        onPrint={handlePrint}
      />

      <StudioSheetPreview
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        mapDataUrl={mapDataUrl}
        sheetDetails={sheetDetails}
        editorStrokes={editorStrokes}
        visibleTexts={visibleTexts}
      />
    </div>
  );
}
