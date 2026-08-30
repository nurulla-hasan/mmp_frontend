'use client';

import { FileText } from 'lucide-react';

import type {
  StudioEditorStroke,
  StudioEditorText,
  StudioSheetDetails,
} from '../store/useMouzaMapStudioStore';

type StudioSheetPreviewProps = {
  imageWidth: number;
  imageHeight: number;
  mapDataUrl: string | null;
  sheetDetails: StudioSheetDetails;
  editorStrokes: StudioEditorStroke[];
  visibleTexts: StudioEditorText[];
};

export default function StudioSheetPreview({
  imageWidth,
  imageHeight,
  mapDataUrl,
  sheetDetails,
  editorStrokes,
  visibleTexts,
}: StudioSheetPreviewProps) {
  return (
    <main className="min-w-0 flex-1 overflow-auto p-6">
      <div className="mx-auto w-max shadow-2xl">
        <div className="relative h-198 w-280 overflow-hidden bg-white text-black">
          {/* Green border that clips content */}
          <div className="absolute inset-5 overflow-hidden rounded-xs border border-emerald-500">
            <div className="grid h-full w-full grid-cols-[1fr_250px] p-2">
              <section className="flex min-w-0 flex-col border-r border-black pr-4">
                <header className="flex h-16 items-start justify-between gap-4 px-2 pt-1">
                  <div>
                    <h1 className="text-xl font-bold uppercase tracking-wide">
                      {sheetDetails.title || 'MOUZA MAP'}
                    </h1>
                    <p className="mt-1 text-xs text-gray-600">
                      RED LINE — C.S MAP | GREEN LINE — B.S MAP
                    </p>
                  </div>
                  <div className="flex gap-3 text-xs font-semibold">
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

              <aside className="flex flex-col px-3 py-1">
                <div className="flex h-32 items-center justify-center border-b border-black">
                  <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-fuchsia-500 text-center text-xs font-bold text-blue-700">
                    <span className="absolute -top-5 text-base text-red-600">N</span>
                    <span className="absolute -bottom-5 text-base">S</span>
                    <span className="absolute -left-5 text-base text-fuchsia-600">W</span>
                    <span className="absolute -right-4 text-base text-green-600">E</span>
                    <span className="text-4xl text-blue-600">✥</span>
                  </div>
                </div>

                <div className="mt-5 text-xs leading-5">
                  {([
                    ['PANTAGRAPH FOR', sheetDetails.ownerName],
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

                <div className="mt-auto border-t border-black pt-2 text-center text-[9px] text-gray-600">
                  <FileText className="mx-auto mb-1 size-4" />
                  Generated with Mouza Map Studio
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
