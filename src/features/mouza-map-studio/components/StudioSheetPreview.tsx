'use client';

import React from 'react';
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
  const metadataRows: Array<[string, string]> = [
    ['CLIENT / FOR', sheetDetails.ownerName],
    ['MOUZA NAME', sheetDetails.mouzaName],
    ['SHEET NO', sheetDetails.sheetNo],
    ['KHATIAN NO', sheetDetails.khatianNo],
    ['SURVEYED BY', sheetDetails.surveyorName],
    ['PREPARED BY', sheetDetails.preparedBy],
    ['DATE', sheetDetails.date],
  ];

  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6 print:p-0 print:m-0 flex items-center justify-center">
      {/* A4 Landscape Sheet Frame (1120px × 792px) */}
      <div className="mx-auto shadow-2xl bg-white print:shadow-none print:w-[297mm] print:h-[210mm] print:m-0 box-border">
        <div className="relative w-280 h-198 overflow-hidden bg-white text-gray-900 border-2 border-teal-900 p-3.5 box-border flex flex-col justify-between">
          {/* Inner Fine Border */}
          <div className="h-full w-full border border-teal-700/40 p-3 flex flex-col justify-between box-border">
            <div className="grid h-full w-full grid-cols-[1fr_270px] gap-3">

              {/* ── LEFT SECTION: MAP & HEADER ─────────────── */}
              <section className="flex min-w-0 flex-col border-r border-teal-800/60 pr-3">
                {/* Header Banner */}
                <header className="flex h-16 items-center justify-between gap-4 pb-2 border-b-2 border-teal-800/80">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/logo.png"
                      alt="Mouza Map Pro"
                      className="w-10 h-10 rounded-md object-contain shrink-0"
                    />
                    <div>
                      <h1 className="text-lg font-black uppercase tracking-tight text-teal-950 leading-tight">
                        {sheetDetails.title || 'C.S & B.S MOUZA MAP COMPARISON'}
                      </h1>
                      <p className="text-xs text-teal-700 font-semibold tracking-wider uppercase">
                        DIGITAL OVERLAY &amp; BOUNDARY ALIGNMENT REPORT
                      </p>
                    </div>
                  </div>

                  {/* Legend Badges */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-[11px] font-bold text-red-700">
                      <span className="size-2 rounded-full bg-red-600 shrink-0" />
                      C.S MAP (RED / সাবেক)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                      <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
                      B.S MAP (GREEN / হাল)
                    </span>
                  </div>
                </header>

                {/* Main Vector Map Display */}
                <div className="min-h-0 flex-1 my-2 rounded border border-gray-200 bg-gray-50/20 relative flex items-center justify-center overflow-hidden">
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

                {/* Left Bottom Disclaimer */}
                <div className="pt-1 text-[9px] text-gray-500 flex items-center justify-between">
                  <span>
                    This comparison sheet was generated using precision coordinate matching algorithms.
                  </span>
                  <span className="font-semibold text-teal-900">
                    Mouza Map Pro Studio
                  </span>
                </div>
              </section>

              {/* ── RIGHT SECTION: TITLE BLOCK & COMPASS ────── */}
              <aside className="flex flex-col justify-between pl-1">
                {/* 1. Professional Survey Compass */}
                <div className="flex flex-col items-center justify-center p-2 rounded border border-teal-200/80 bg-teal-50/20">
                  <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer Rings */}
                    <circle cx="50" cy="50" r="44" stroke="#0F766E" strokeWidth="1.5" fill="#FFFFFF" />
                    <circle cx="50" cy="50" r="40" stroke="#CBD5E1" strokeWidth="0.8" strokeDasharray="2,2" fill="none" />
                    <circle cx="50" cy="50" r="32" stroke="#E2E8F0" strokeWidth="0.8" fill="none" />

                    {/* Compass Needles */}
                    {/* North (Red Facets) */}
                    <polygon points="50,12 55,50 50,45" fill="#DC2626" />
                    <polygon points="50,12 45,50 50,45" fill="#EF4444" />
                    {/* South (Slate Facets) */}
                    <polygon points="50,88 55,50 50,55" fill="#334155" />
                    <polygon points="50,88 45,50 50,55" fill="#64748B" />
                    {/* East */}
                    <polygon points="88,50 50,55 55,50" fill="#94A3B8" />
                    <polygon points="88,50 50,45 55,50" fill="#CBD5E1" />
                    {/* West */}
                    <polygon points="12,50 50,55 45,50" fill="#94A3B8" />
                    <polygon points="12,50 50,45 45,50" fill="#CBD5E1" />

                    {/* Center Pivot */}
                    <circle cx="50" cy="50" r="4" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />

                    {/* Cardinal Labels */}
                    <text x="50" y="8" textAnchor="middle" fontSize="9" fontWeight="900" fill="#DC2626">N</text>
                    <text x="50" y="98" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">S</text>
                    <text x="96" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">E</text>
                    <text x="4" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#475569">W</text>
                  </svg>
                  <span className="text-[9px] font-bold tracking-widest text-teal-900 mt-1 uppercase">
                    NORTH / উত্তর
                  </span>
                </div>

                {/* 2. Structured Technical Title Block */}
                <div className="rounded border border-gray-300 bg-white overflow-hidden text-xs my-2">
                  <div className="bg-teal-900 text-white font-bold px-2 py-1 text-center tracking-wider text-xs uppercase">
                    SHEET SPECIFICATIONS
                  </div>
                  <div className="divide-y divide-gray-200">
                    {metadataRows.map(([label, value]) => (
                      <div key={label} className="grid grid-cols-[100px_1fr] px-2 py-1">
                        <span className="font-bold text-gray-700 truncate">{label}:</span>
                        <span className="text-gray-950 font-semibold truncate pl-1">
                          {value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Surveyor Signature & Seal Block */}
                <div className="rounded border border-dashed border-gray-400 p-2 text-center bg-gray-50/50">
                  <div className="h-10 flex flex-col justify-end items-center mb-1">
                    <span className="font-bold text-[11px] text-teal-950 pb-0.5">
                      {sheetDetails.surveyorName || ''}
                    </span>
                    <div className="w-36 border-b border-gray-400" />
                  </div>
                  <div className="text-xs font-bold text-gray-800 uppercase">
                    SURVEYOR SIGNATURE &amp; SEAL
                  </div>
                  <div className="text-[8px] text-gray-500">
                    সার্ভেয়ারের স্বাক্ষর ও সিল
                  </div>
                </div>

                {/* 4. Brand Authenticity */}
                <div className="pt-2 text-center border-t border-gray-200 text-[9px] text-gray-500">
                  <div className="font-bold text-teal-900 uppercase tracking-wider">
                    MOUZA MAP PRO
                  </div>
                  <span className="text-[8px]">www.mouzamappro.com</span>
                </div>
              </aside>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
