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
      reject(new Error("Export sheet render করা যায়নি"));
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
        ErrorToast("Sheet export করার আগে Final Edit map প্রস্তুত করুন");
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
          ["PANTAGRAPH FOR", sheetDetails.ownerName],
          ["NAME OF MOUZA", sheetDetails.mouzaName],
          ["SHEET NO", sheetDetails.sheetNo],
          ["KHATIAN NO", sheetDetails.khatianNo],
          ["SURVEYED BY", sheetDetails.surveyorName],
          ["PREPARED BY", sheetDetails.preparedBy],
          ["DATE", sheetDetails.date],
        ];

        const detailsMarkup = details
          .map(([label, value], index) => {
            const y = 270 + index * 30;
            return `<text x="858" y="${y}" font-size="11"><tspan font-weight="700">${escapeXml(label)}: </tspan>${escapeXml(value || "—")}</text><line x1="858" y1="${y + 8}" x2="1080" y2="${y + 8}" stroke="#000" stroke-width="1"/>`;
          })
          .join("");

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}">
        <rect width="1120" height="792" fill="#fff"/>
        <rect x="20" y="20" width="1080" height="752" fill="none" stroke="#10b981"/>
        <line x1="842" y1="28" x2="842" y2="764" stroke="#000"/>
        <g font-family="Arial, 'Noto Sans Bengali', sans-serif" fill="#000">
          <text x="42" y="52" font-size="20" font-weight="700">${escapeXml(sheetDetails.title || "MOUZA MAP")}</text>
          <text x="42" y="74" font-size="11" fill="#4b5563">RED LINE — C.S MAP  |  GREEN LINE — B.S MAP</text>
          <text x="760" y="48" fill="#dc2626" font-size="11" font-weight="700">● C.S</text>
          <text x="805" y="48" fill="#16a34a" font-size="11" font-weight="700">● B.S</text>

          <svg x="38" y="92" width="790" height="650" viewBox="0 0 ${imageWidth} ${imageHeight}" preserveAspectRatio="xMidYMid meet">
            <image href="${escapeXml(mapDataUrl)}" x="0" y="0" width="${imageWidth}" height="${imageHeight}" preserveAspectRatio="none"/>
            ${editorMarkup}
          </svg>

          <circle cx="965" cy="125" r="45" fill="none" stroke="#d946ef" stroke-width="2"/>
          <text x="965" y="68" fill="#dc2626" font-size="16" font-weight="700" text-anchor="middle">N</text>
          <text x="965" y="188" fill="#2563eb" font-size="16" font-weight="700" text-anchor="middle">S</text>
          <text x="908" y="131" fill="#c026d3" font-size="16" font-weight="700" text-anchor="middle">W</text>
          <text x="1022" y="131" fill="#16a34a" font-size="16" font-weight="700" text-anchor="middle">E</text>
          <text x="965" y="137" fill="#2563eb" font-size="38" text-anchor="middle">✥</text>
          <line x1="858" y1="205" x2="1080" y2="205" stroke="#000"/>
          ${detailsMarkup}
          <text x="969" y="744" fill="#4b5563" font-size="9" text-anchor="middle">Generated with Mouza Map Studio</text>
        </g>
      </svg>`;

        const image = await loadSvgImage(svg);
        const canvas = document.createElement("canvas");
        canvas.width = EXPORT_WIDTH * 2;
        canvas.height = EXPORT_HEIGHT * 2;
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Export canvas তৈরি করা যায়নি");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        if (format === "png") {
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (value) =>
                value ? resolve(value) : reject(new Error("PNG তৈরি হয়নি")),
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
                  : reject(new Error("PDF image তৈরি হয়নি")),
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
          format === "png" ? "PNG export হয়েছে" : "PDF export হয়েছে",
        );
      } catch (error) {
        console.error(error);
        ErrorToast("Sheet export করা যায়নি");
      } finally {
        setExporting(null);
      }
    },
    [editorImage, mapDataUrl, editorStrokes, editorTexts, sheetDetails, imageWidth, imageHeight],
  );

  const visibleTexts = editorTexts.filter((item) => item.text.trim());

  return (
    <div className="flex h-full min-h-0 bg-background pt-16">
      <StudioSheetSidebar
        sheetDetails={sheetDetails}
        mapDataUrl={mapDataUrl}
        exporting={exporting}
        onChangeField={updateField}
        onExport={exportSheet}
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
