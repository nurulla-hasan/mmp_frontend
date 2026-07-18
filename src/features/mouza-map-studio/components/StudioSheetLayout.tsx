'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, ImageDown, Loader2 } from 'lucide-react';

import { centroid, useTracerStore } from '@/features/tracer/store/useTracerStore';
import { ErrorToast, SuccessToast } from '@/lib/utils';
import {
  useMouzaMapStudioStore,
  type StudioSheetDetails,
  type StudioSheetMode,
} from '../store/useMouzaMapStudioStore';
import { formatArea, formatDistance, getPolygonBounds, pointDistance, polygonPixelArea } from '../utils/measurement';

type ExportFormat = 'png' | 'pdf';

const sheetModes: Array<{ id: StudioSheetMode; label: string }> = [
  { id: 'all', label: 'C.S + B.S' },
  { id: 'cs', label: 'শুধু C.S' },
  { id: 'bs', label: 'শুধু B.S' },
];

export default function StudioSheetLayout() {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const backgroundImage = useTracerStore((state) => state.backgroundImage);
  const layers = useTracerStore((state) => state.layers);
  const {
    calibration,
    dimensions,
    sheetMode,
    sheetDetails,
    setSheetMode,
    updateSheetDetails,
  } = useMouzaMapStudioStore();

  const targetLayers = useMemo(() => layers.filter((layer) =>
    layer.visible && (sheetMode === 'all' || layer.id === sheetMode),
  ), [layers, sheetMode]);

  const polygons = useMemo(() => targetLayers.flatMap((layer) => layer.polygons), [targetLayers]);

  const mapBounds = useMemo(() => {
    const polygonBounds = getPolygonBounds(polygons);
    const width = backgroundImage?.naturalWidth || backgroundImage?.width || 1200;
    const height = backgroundImage?.naturalHeight || backgroundImage?.height || 800;
    if (!polygonBounds) return { minX: 0, minY: 0, maxX: width, maxY: height };

    let { minX, minY, maxX, maxY } = polygonBounds;
    for (const dimension of dimensions) {
      minX = Math.min(minX, dimension.start.x, dimension.end.x);
      minY = Math.min(minY, dimension.start.y, dimension.end.y);
      maxX = Math.max(maxX, dimension.start.x, dimension.end.x);
      maxY = Math.max(maxY, dimension.start.y, dimension.end.y);
    }
    const padding = Math.max(40, Math.max(maxX - minX, maxY - minY) * 0.05);
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  }, [polygons, dimensions, backgroundImage]);

  const viewWidth = Math.max(1, mapBounds.maxX - mapBounds.minX);
  const viewHeight = Math.max(1, mapBounds.maxY - mapBounds.minY);
  const mapFontSize = Math.max(10, Math.max(viewWidth, viewHeight) / 65);

  const plotAreas = useMemo(() => {
    if (!calibration) return [];
    return targetLayers.flatMap((layer) => layer.polygons.map((polygon, index) => ({
      id: polygon.id,
      label: polygon.label || `Plot ${index + 1}`,
      color: layer.color,
      area: polygonPixelArea(polygon.points) * calibration.unitsPerPixel ** 2,
    })));
  }, [targetLayers, calibration]);

  useEffect(() => {
    if (!backgroundImage) return;
    const frame = requestAnimationFrame(() => {
      const width = backgroundImage.naturalWidth || backgroundImage.width;
      const height = backgroundImage.naturalHeight || backgroundImage.height;
      const scale = Math.min(1, 600 / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) return;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      setThumbnailUrl(canvas.toDataURL('image/jpeg', 0.78));
      canvas.width = 1;
      canvas.height = 1;
    });
    return () => cancelAnimationFrame(frame);
  }, [backgroundImage]);

  const updateField = (field: keyof StudioSheetDetails, value: string) => {
    updateSheetDetails({ [field]: value });
  };

  const exportSheet = async (format: ExportFormat) => {
    if (!sheetRef.current || polygons.length === 0) {
      ErrorToast('Sheet export করার আগে plot trace করুন');
      return;
    }

    setExporting(format);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(sheetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      if (format === 'png') {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG তৈরি হয়নি')), 'image/png');
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `mouza-map-${sheetMode}.png`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
      } else {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imageData, 'JPEG', 0, 0, 297, 210);
        pdf.save(`mouza-map-${sheetMode}.pdf`);
      }
      canvas.width = 1;
      canvas.height = 1;
      SuccessToast(`${format.toUpperCase()} সফলভাবে তৈরি হয়েছে`);
    } catch (error) {
      console.error('[MouzaMapStudio] Sheet export failed:', error);
      ErrorToast('Sheet export করা যায়নি');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-muted/40 pt-16">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border bg-background p-4">
        <div className="mb-5">
          <h2 className="text-base font-semibold">শিট তৈরি</h2>
          <p className="mt-1 text-xs text-muted-foreground">তথ্য পূরণ করে professional map sheet export করুন।</p>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {sheetModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setSheetMode(mode.id)}
              className={`h-9 rounded-lg text-[11px] font-medium transition ${
                sheetMode === mode.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {([
            ['title', 'শিটের শিরোনাম'],
            ['mouzaName', 'মৌজার নাম'],
            ['sheetNo', 'শিট নম্বর'],
            ['khatianNo', 'খতিয়ান নম্বর'],
            ['ownerName', 'জমির মালিক'],
            ['surveyorName', 'Surveyed by'],
            ['preparedBy', 'CAD/Prepared by'],
            ['date', 'তারিখ'],
          ] as Array<[keyof StudioSheetDetails, string]>).map(([field, label]) => (
            <label key={field} className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
              <input
                type={field === 'date' ? 'date' : 'text'}
                value={sheetDetails[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void exportSheet('png')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background text-xs font-semibold transition hover:bg-muted disabled:opacity-50"
          >
            {exporting === 'png' ? <Loader2 className="size-4 animate-spin" /> : <ImageDown className="size-4" />}
            PNG
          </button>
          <button
            type="button"
            disabled={exporting !== null}
            onClick={() => void exportSheet('pdf')}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            PDF
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-6">
        <div className="mx-auto w-max shadow-2xl">
          <div
            ref={sheetRef}
            className="relative grid h-[792px] w-[1120px] grid-cols-[1fr_250px] overflow-hidden bg-white p-7 text-black"
          >
            <div className="absolute inset-5 border border-emerald-500" />

            <section className="relative z-10 flex min-w-0 flex-col border-r border-black pr-4">
              <header className="flex h-16 items-start justify-between gap-4 px-2 pt-1">
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-wide">{sheetDetails.title || 'MOUZA MAP'}</h1>
                  <p className="mt-1 text-[11px] text-gray-600">
                    {sheetMode === 'all' ? 'RED LINE — C.S MAP  |  GREEN LINE — B.S MAP' : sheetMode === 'cs' ? 'ORIGINAL C.S MAP' : 'ORIGINAL B.S MAP'}
                  </p>
                </div>
                <div className="flex gap-3 text-[11px] font-semibold">
                  {(sheetMode === 'all' || sheetMode === 'cs') && <span className="text-red-600">● C.S</span>}
                  {(sheetMode === 'all' || sheetMode === 'bs') && <span className="text-green-600">● B.S</span>}
                </div>
              </header>

              <div className="min-h-0 flex-1 p-2">
                <svg
                  viewBox={`${mapBounds.minX} ${mapBounds.minY} ${viewWidth} ${viewHeight}`}
                  className="h-full w-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {targetLayers.map((layer) => layer.polygons.map((polygon) => {
                    const center = polygon.labelX != null && polygon.labelY != null
                      ? { x: polygon.labelX, y: polygon.labelY }
                      : centroid(polygon.points);
                    return (
                      <g key={polygon.id}>
                        <polygon
                          points={polygon.points.map((point) => `${point.x},${point.y}`).join(' ')}
                          fill="none"
                          stroke={layer.color}
                          strokeWidth={Math.max(1.5, viewWidth / 900)}
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                        {polygon.label && (
                          <text
                            x={center.x}
                            y={center.y}
                            fill={layer.color}
                            fontSize={mapFontSize}
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {polygon.label}
                          </text>
                        )}
                      </g>
                    );
                  }))}

                  {dimensions.map((dimension) => {
                    const center = {
                      x: (dimension.start.x + dimension.end.x) / 2,
                      y: (dimension.start.y + dimension.end.y) / 2,
                    };
                    return (
                      <g key={dimension.id}>
                        <line
                          x1={dimension.start.x}
                          y1={dimension.start.y}
                          x2={dimension.end.x}
                          y2={dimension.end.y}
                          stroke="#0284C7"
                          strokeWidth={Math.max(1.2, viewWidth / 1100)}
                          strokeDasharray={`${viewWidth / 180} ${viewWidth / 260}`}
                          vectorEffect="non-scaling-stroke"
                        />
                        {calibration && (
                          <text
                            x={center.x}
                            y={center.y}
                            fill="#0369A1"
                            fontSize={mapFontSize * 0.8}
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="auto"
                            style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: mapFontSize * 0.18 }}
                          >
                            {formatDistance(pointDistance(dimension.start, dimension.end) * calibration.unitsPerPixel, calibration.unit)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {thumbnailUrl && (
                <div className="absolute bottom-3 left-3 h-32 w-52 overflow-hidden border border-black bg-white p-1">
                  <Image src={thumbnailUrl} alt="Original aligned mouza map" width={208} height={128} unoptimized className="h-full w-full object-contain" />
                </div>
              )}
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
                    <span className="font-bold">{label}: </span>{value || '—'}
                  </div>
                ))}
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                <h3 className="border-b border-black pb-1 text-[11px] font-bold">DAG / PLOT AREA</h3>
                <div className="mt-1 space-y-0.5 text-[10px]">
                  {plotAreas.slice(0, 14).map((plot) => (
                    <div key={plot.id} className="flex justify-between gap-2">
                      <span style={{ color: plot.color }}>{plot.label}</span>
                      <span>{calibration && formatArea(plot.area, calibration.unit)}</span>
                    </div>
                  ))}
                  {!calibration && <p className="text-gray-500">Scale সেট করলে area দেখা যাবে</p>}
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
