'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, ImageDown, Loader2 } from 'lucide-react';

import { ErrorToast, SuccessToast } from '@/lib/utils';
import {
  useMouzaMapStudioStore,
  type StudioSheetDetails,
} from '../store/useMouzaMapStudioStore';

type ExportFormat = 'png' | 'pdf';

const EXPORT_WIDTH = 1120;
const EXPORT_HEIGHT = 792;

const escapeXml = (value: string | number) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const loadSvgImage = (svg: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    );
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Export sheet render করা যায়নি'));
    };
    image.src = url;
  });

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
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

  const {
    editorImage,
    editorStrokes,
    editorTexts,
    sheetDetails,
    updateSheetDetails,
  } = useMouzaMapStudioStore();

  const imageWidth =
    editorImage?.naturalWidth || editorImage?.width || 1200;
  const imageHeight =
    editorImage?.naturalHeight || editorImage?.height || 800;

  useEffect(() => {
    if (!editorImage) {
      setMapDataUrl(null);
      return;
    }

    const frame = requestAnimationFrame(() => {
      const sourceWidth = editorImage.naturalWidth || editorImage.width;
      const sourceHeight = editorImage.naturalHeight || editorImage.height;
      const scale = Math.min(1, 2400 / Math.max(sourceWidth, sourceHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceHeight * scale));
      const context = canvas.getContext('2d');

      if (!context) return;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(editorImage, 0, 0, canvas.width, canvas.height);
      setMapDataUrl(canvas.toDataURL('image/jpeg', 0.94));
      canvas.width = 1;
      canvas.height = 1;
    });

    return () => cancelAnimationFrame(frame);
  }, [editorImage]);

  const updateField = (field: keyof StudioSheetDetails, value: string) => {
    updateSheetDetails({ [field]: value });
  };

  const exportSheet = async (format: ExportFormat) => {
    if (!editorImage || !mapDataUrl) {
      ErrorToast('Sheet export করার আগে Final Edit map প্রস্তুত করুন');
      return;
    }

    setExporting(format);
    try {
      const editorMarkup = [
        ...editorStrokes.map((stroke) => {
          const points = stroke.points
            .map((point) => `${point.x},${point.y}`)
            .join(' ');
          return `<polyline points="${points}" fill="none" stroke="${escapeXml(stroke.color)}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }),
        ...editorTexts
          .filter((item) => item.text.trim())
          .map(
            (item) =>
              `<text x="${item.x}" y="${item.y}" fill="${escapeXml(item.color)}" font-size="${item.fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(item.text)}</text>`,
          ),
      ].join('');

      const details: Array<[string, string]> = [
        ['LAND OWNER', sheetDetails.ownerName],
        ['NAME OF MOUZA', sheetDetails.mouzaName],
        ['SHEET NO', sheetDetails.sheetNo],
        ['KHATIAN NO', sheetDetails.khatianNo],
        ['SURVEYED BY', sheetDetails.surveyorName],
        ['PREPARED BY', sheetDetails.preparedBy],
        ['DATE', sheetDetails.date],
      ];

      const detailsMarkup = details
        .map(([label, value], index) => {
          const y = 270 + index * 30;
          return `<text x="858" y="${y}" font-size="11"><tspan font-weight="700">${escapeXml(label)}: </tspan>${escapeXml(value || '—')}</text><line x1="858" y1="${y + 8}" x2="1080" y2="${y + 8}" stroke="#000" stroke-width="1"/>`;
        })
        .join('');

      const dagMarkup = editorTexts
        .filter((item) => item.text.trim())
        .slice(0, 20)
        .map(
          (item, index) =>
            `<text x="860" y="${520 + index * 15}" fill="${escapeXml(item.color)}" font-size="9">${escapeXml(item.text)}</text>`,
        )
        .join('');

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}">
        <rect width="1120" height="792" fill="#fff"/>
        <rect x="20" y="20" width="1080" height="752" fill="none" stroke="#10b981"/>
        <line x1="842" y1="28" x2="842" y2="764" stroke="#000"/>
        <g font-family="Arial, 'Noto Sans Bengali', sans-serif" fill="#000">
          <text x="42" y="52" font-size="20" font-weight="700">${escapeXml(sheetDetails.title || 'MOUZA MAP')}</text>
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
          <text x="858" y="500" font-size="10" font-weight="700">DAG NO / NOTES</text>
          <line x1="858" y1="508" x2="1080" y2="508" stroke="#000"/>
          ${dagMarkup}
          <text x="969" y="744" fill="#4b5563" font-size="9" text-anchor="middle">Generated with Mouza Map Studio</text>
        </g>
      </svg>`;

      const image = await loadSvgImage(svg);
      const canvas = document.createElement('canvas');
      canvas.width = EXPORT_WIDTH * 2;
      canvas.height = EXPORT_HEIGHT * 2;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Export canvas তৈরি করা যায়নি');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (format === 'png') {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) =>
              value ? resolve(value) : reject(new Error('PNG তৈরি হয়নি')),
            'image/png',
          );
        });
        downloadBlob(blob, 'mouza-map-comparison.png');
      } else {
        const { default: jsPDF } = await import('jspdf');
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (value) =>
              value ? resolve(value) : reject(new Error('PDF image তৈরি হয়নি')),
            'image/jpeg',
            0.96,
          );
        });
        const imageBytes = new Uint8Array(await blob.arrayBuffer());
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(imageBytes, 'JPEG', 0, 0, 297, 210);
        pdf.save('mouza-map-comparison.pdf');
      }

      canvas.width = 1;
      canvas.height = 1;
      SuccessToast(
        format === 'png' ? 'PNG export হয়েছে' : 'PDF export হয়েছে',
      );
    } catch (error) {
      console.error(error);
      ErrorToast('Sheet export করা যায়নি');
    } finally {
      setExporting(null);
    }
  };

  const visibleTexts = editorTexts.filter((item) => item.text.trim());

  return (
    <div className="flex h-full min-h-0 bg-[#171717] pt-20">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-white/10 bg-[#111] p-4 text-white">
        <h2 className="text-lg font-semibold">শিট তৈরি</h2>
        <p className="mt-1 text-xs text-white/55">
          Edited real map-এ তথ্য যোগ করে professional sheet export করুন।
        </p>

        <div className="mt-5 space-y-3">
          {([
            ['title', 'শিটের শিরোনাম'],
            ['ownerName', 'Land Owner / জমির মালিক'],
            ['mouzaName', 'মৌজার নাম'],
            ['sheetNo', 'শিট নম্বর'],
            ['khatianNo', 'খতিয়ান নম্বর'],
            ['surveyorName', 'Surveyed by'],
            ['preparedBy', 'CAD/Prepared by'],
          ] as Array<[keyof StudioSheetDetails, string]>).map(
            ([field, label]) => (
              <label key={field} className="block text-xs">
                <span className="mb-1 block text-white/65">{label}</span>
                <input
                  value={sheetDetails[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 outline-none transition focus:border-emerald-500"
                />
              </label>
            ),
          )}

          <label className="block text-xs">
            <span className="mb-1 block text-white/65">তারিখ</span>
            <input
              type="date"
              value={sheetDetails.date}
              onChange={(event) => updateField('date', event.target.value)}
              className="h-9 w-full rounded-lg border border-white/15 bg-white/5 px-3 outline-none transition focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={Boolean(exporting) || !mapDataUrl}
            onClick={() => void exportSheet('png')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 text-xs font-semibold transition hover:bg-white/10 disabled:opacity-50"
          >
            {exporting === 'png' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImageDown className="size-4" />
            )}
            PNG
          </button>

          <button
            type="button"
            disabled={Boolean(exporting) || !mapDataUrl}
            onClick={() => void exportSheet('pdf')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-xs font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            PDF
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-6">
        <div className="mx-auto w-max shadow-2xl">
          <div className="relative grid h-[792px] w-[1120px] grid-cols-[1fr_250px] overflow-hidden bg-white p-7 text-black">
            <div className="absolute inset-5 border border-emerald-500" />

            <section className="relative z-10 flex min-w-0 flex-col border-r border-black pr-4">
              <header className="flex h-16 items-start justify-between gap-4 px-2 pt-1">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-wide">
                    {sheetDetails.title || 'MOUZA MAP'}
                  </h1>
                  <p className="mt-1 text-[11px] text-gray-600">
                    RED LINE — C.S MAP | GREEN LINE — B.S MAP
                  </p>
                </div>
                <div className="flex gap-3 text-[11px] font-semibold">
                  <span className="text-red-600">● C.S</span>
                  <span className="text-green-600">● B.S</span>
                </div>
              </header>

              <div className="min-h-0 flex-1 p-2">
                <svg
                  viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {mapDataUrl && (
                    <image
                      href={mapDataUrl}
                      x={0}
                      y={0}
                      width={imageWidth}
                      height={imageHeight}
                      preserveAspectRatio="none"
                    />
                  )}

                  {editorStrokes.map((stroke) => (
                    <polyline
                      key={stroke.id}
                      points={stroke.points
                        .map((point) => `${point.x},${point.y}`)
                        .join(' ')}
                      fill="none"
                      stroke={stroke.color}
                      strokeWidth={stroke.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}

                  {visibleTexts.map((item) => (
                    <text
                      key={item.id}
                      x={item.x}
                      y={item.y}
                      fill={item.color}
                      fontSize={item.fontSize}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {item.text}
                    </text>
                  ))}
                </svg>
              </div>
            </section>

            <aside className="relative z-10 flex flex-col px-3 py-1">
              <div className="flex h-32 items-center justify-center border-b border-black">
                <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-fuchsia-500 text-center text-xs font-bold text-blue-700">
                  <span className="absolute -top-5 text-base text-red-600">N</span>
                  <span className="absolute -bottom-5 text-base">S</span>
                  <span className="absolute -left-5 text-base text-fuchsia-600">W</span>
                  <span className="absolute -right-4 text-base text-green-600">E</span>
                  <span className="text-4xl text-blue-600">✥</span>
                </div>
              </div>

              <div className="mt-5 text-[11px] leading-5">
                {([
                  ['LAND OWNER', sheetDetails.ownerName],
                  ['NAME OF MOUZA', sheetDetails.mouzaName],
                  ['SHEET NO', sheetDetails.sheetNo],
                  ['KHATIAN NO', sheetDetails.khatianNo],
                  ['SURVEYED BY', sheetDetails.surveyorName],
                  ['PREPARED BY', sheetDetails.preparedBy],
                  ['DATE', sheetDetails.date],
                ] as Array<[string, string]>).map(([label, value]) => (
                  <div key={label} className="border-b border-black py-1">
                    <span className="font-bold">{label}: </span>
                    {value || '—'}
                  </div>
                ))}
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                <h3 className="border-b border-black pb-1 text-[11px] font-bold">
                  DAG NO / NOTES
                </h3>
                <div className="mt-1 space-y-0.5 text-[10px]">
                  {visibleTexts.slice(0, 20).map((item) => (
                    <div key={item.id} style={{ color: item.color }}>
                      {item.text}
                    </div>
                  ))}
                  {visibleTexts.length === 0 && (
                    <p className="text-gray-500">
                      Final Edit থেকে text বসান
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-auto border-t border-black pt-2 text-center text-[9px] text-gray-600">
                <FileText className="mx-auto mb-1 size-4" />
                Generated with Mouza Map Studio
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

