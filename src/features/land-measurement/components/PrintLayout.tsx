import React from 'react';
import Image from 'next/image';
import { useShallow } from 'zustand/shallow';
import { AREA_LABEL_FONT_SCALE, AREA_LABEL_PADDING_FACTOR } from '@/features/land-measurement/utils/canvas';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { toBengaliDigits } from '@/lib/utils';
import { PrintMapSVG } from './print/PrintMapSVG';

export const PrintLayout = React.forwardRef<HTMLDivElement, unknown>((_, ref) => {
  const { results, plots, isShowDiagonals, reportInfo } = useMapStore(
    useShallow((s) => ({
      results: s.results,
      plots: s.plots,
      isShowDiagonals: s.isShowDiagonals,
      reportInfo: s.reportInfo,
    })),
  );

  if (plots.length === 0) return null;

  // Calculate total shotok, katha, sqft
  const sumShotok = plots.reduce((acc, plot) => acc + (plot.results?.shotok || 0), 0) || (results?.shotok || 0);
  const sumKatha = plots.reduce((acc, plot) => acc + (plot.results?.katha || 0), 0) || (results?.katha || 0);
  const sumSqft = plots.reduce((acc, plot) => acc + (plot.results?.sqft || 0), 0) || (results?.sqft || 0);

  const totalShotok = sumShotok.toFixed(3);
  const totalKatha = sumKatha.toFixed(3);
  const totalSqft = Math.round(sumSqft).toLocaleString('en-US');

  // Calculate bounding box of all plots to set up SVG viewBox
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  plots.forEach((plot) => {
    plot.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
  });

  if (minX === Infinity) return null;

  const boundsWidth = Math.max(1, maxX - minX);
  const boundsHeight = Math.max(1, maxY - minY);

  const maxDim = Math.max(boundsWidth, boundsHeight);
  const paddingX = maxDim * 0.1;
  const paddingY = maxDim * 0.1;

  const viewBoxMinX = minX - paddingX;
  const viewBoxMinY = minY - paddingY;
  const viewBoxWidth = boundsWidth + paddingX * 2;
  const viewBoxHeight = boundsHeight + paddingY * 2;

  // Calculate dynamic stroke widths based on viewBox size
  const baseScale = Math.max(viewBoxWidth, viewBoxHeight);
  const strokeW = baseScale * 0.005;
  const fontSize = baseScale * 0.018;
  const labelPad = baseScale * 0.005;
  const labelOffset = baseScale * 0.02;
  const areaFontSize = fontSize * Math.max(0.78, AREA_LABEL_FONT_SCALE * 0.85);
  const areaLabelPad = labelPad * Math.max(0.65, AREA_LABEL_PADDING_FACTOR * 0.8);

  const displayDate = reportInfo?.date
    ? toBengaliDigits(reportInfo.date)
    : toBengaliDigits(new Date().toLocaleDateString('bn-BD'));

  return (
    <div
      ref={ref}
      className="print-layout hidden print:flex print:flex-col font-sans w-full print:h-[297mm] overflow-hidden bg-white text-gray-900 print:p-[6mm] relative box-border"
    >
      {/* Outer Certificate Frame */}
      <div className="w-full h-full border-2 border-teal-800 rounded-sm p-[2mm] flex flex-col justify-between box-border">
        {/* Inner Fine Border */}
        <div className="w-full h-full border border-teal-600/30 rounded-xs p-[3mm] flex flex-col justify-between box-border relative">

          {/* ── HEADER SECTION ───────────────────────────── */}
          <div className="flex flex-col gap-2 pb-2 border-b-2 border-teal-800/80">
            <div className="flex items-center justify-between">
              {/* Left Brand info */}
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo.png"
                  alt="Mouza Map Pro"
                  className="w-10 h-10 rounded-md object-contain shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-teal-900 tracking-tight leading-none">
                    মৌজা ম্যাপ প্রো
                  </h3>
                  <span className="text-xs font-semibold text-teal-700 tracking-wider uppercase">
                    স্মার্ট ডিজিটাল ভূমি পরিমাপ ও জরিপ
                  </span>
                </div>
              </div>

              {/* Center Title */}
              <div className="text-center flex-1 px-4">
                <h1 className="text-xl font-black text-teal-950 tracking-tight leading-snug">
                  ভূমি পরিমাপ ও নকশা প্রতিবেদন
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide">
                  LAND MEASUREMENT &amp; SURVEY REPORT
                </p>
              </div>

              {/* Right Reference Meta */}
              <div className="text-right text-xs text-gray-500 space-y-0.5 min-w-28">
                <div>তারিখ: <strong className="text-gray-800 font-semibold">{displayDate}</strong></div>
                <div>প্লট সংখ্যা: <strong className="text-teal-800 font-semibold">{toBengaliDigits(plots.length)} টি</strong></div>
              </div>
            </div>

            {/* ── LAND RECORD METADATA BOX (তথ্য বিবরণী) ─── */}
            <div className="rounded border border-teal-200 bg-teal-50/30 p-2.5 text-[11px] leading-relaxed">
              <div className="grid grid-cols-4 gap-x-4 gap-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-gray-600 font-semibold shrink-0">মৌজা:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {reportInfo?.mouza || '—'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-gray-600 font-semibold shrink-0">জে. এল. নং:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {toBengaliDigits(reportInfo?.jlNo) || '—'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-gray-600 font-semibold shrink-0">খতিয়ান নং:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {toBengaliDigits(reportInfo?.khatianNo) || '—'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-gray-600 font-semibold shrink-0">দাগ নং:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {toBengaliDigits(reportInfo?.dagNo) || '—'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 col-span-2">
                  <span className="text-teal-900 font-bold shrink-0">মোট ক্ষেত্রফল:</span>
                  <span className="font-black text-teal-800 text-[12px]">
                    {toBengaliDigits(totalShotok)} শতক
                  </span>
                  <span className="text-gray-600 text-xs">
                    ({toBengaliDigits(totalKatha)} কাঠা / {toBengaliDigits(totalSqft)} বর্গফুট)
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 col-span-2">
                  <span className="text-gray-600 font-semibold shrink-0">সার্ভেয়ার / আমিন:</span>
                  <span className="font-bold text-gray-900 truncate">
                    {reportInfo?.surveyorName || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SVG MAP CANVAS (নকশা এলাকা) ─────────────── */}
          <div className="flex-1 w-full my-2 min-h-0 relative border border-gray-200 rounded bg-gray-50/20 flex items-center justify-center overflow-hidden">
            {/* Compass / North Arrow Indicator (উত্তর দিক নির্দেশক) */}
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-center bg-white/90 backdrop-blur-xs border border-gray-300 px-1.5 py-1 rounded shadow-xs">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Arrow North Needle */}
                <polygon points="12,2 17,14 12,11" fill="#DC2626" />
                {/* Arrow South Needle */}
                <polygon points="12,2 7,14 12,11" fill="#EF4444" />
                <polygon points="12,20 17,13 12,15" fill="#94A3B8" />
                <polygon points="12,20 7,13 12,15" fill="#CBD5E1" />
                <circle cx="12" cy="13" r="2" fill="#1E293B" />
                {/* North Letter */}
                <text x="12" y="27" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#0F766E">
                  উত্তর
                </text>
              </svg>
            </div>

            {/* Map Watermark / Scale Badge */}
            <div className="absolute top-2.5 left-2.5 z-10 text-[9px] font-semibold text-teal-800/80 bg-white/90 border border-gray-200 px-2 py-0.5 rounded shadow-xs">
              📐 ডিজিটাল স্কেল নকশা
            </div>

            {/* Actual Map SVG Render */}
            <PrintMapSVG
              plots={plots}
              isShowDiagonals={isShowDiagonals}
              viewBoxMinX={viewBoxMinX}
              viewBoxMinY={viewBoxMinY}
              viewBoxWidth={viewBoxWidth}
              viewBoxHeight={viewBoxHeight}
              baseScale={baseScale}
              strokeW={strokeW}
              fontSize={fontSize}
              labelPad={labelPad}
              labelOffset={labelOffset}
              areaFontSize={areaFontSize}
              areaLabelPad={areaLabelPad}
            />
          </div>

          {/* ── PLOTS BREAKDOWN TABLE (যদি একাধিক প্লট থাকে) ─── */}
          {plots.length > 1 && (
            <div className="mb-2">
              <table className="w-full text-center border-collapse text-xs border border-gray-200">
                <thead>
                  <tr className="bg-teal-800 text-white font-semibold">
                    <th className="py-1 px-2 border border-teal-700">প্লট নং</th>
                    <th className="py-1 px-2 border border-teal-700">শতক</th>
                    <th className="py-1 px-2 border border-teal-700">কাঠা</th>
                    <th className="py-1 px-2 border border-teal-700">বর্গফুট</th>
                    <th className="py-1 px-2 border border-teal-700">পরিসীমা</th>
                  </tr>
                </thead>
                <tbody>
                  {plots.map((p, idx) => (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-teal-50/30'}>
                      <td className="py-0.5 px-2 border border-gray-200 font-bold text-gray-800">
                        {p.name ? toBengaliDigits(p.name) : `প্লট ${toBengaliDigits(idx + 1)}`}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 font-semibold text-teal-800">
                        {toBengaliDigits(p.results.shotok.toFixed(2))}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200">
                        {toBengaliDigits(p.results.katha.toFixed(2))}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200">
                        {toBengaliDigits(Math.round(p.results.sqft).toLocaleString('en-US'))}
                      </td>
                      <td className="py-0.5 px-2 border border-gray-200 text-gray-600">
                        {toBengaliDigits(Math.round(p.results.perimeter))} ফুট
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── SIGNATURES & VERIFICATION (স্বাক্ষর ও প্রত্যয়ন) ─── */}
          <div className="pt-2 pb-1 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-6 text-center text-[11px] text-gray-800">
              {/* Applicant / Land owner */}
              <div>
                <div className="h-9 flex items-end justify-center mb-1">
                  <div className="w-44 border-b border-dashed border-gray-500" />
                </div>
                <div className="font-bold text-gray-800">জমির মালিক / আবেদনকারী</div>
                <div className="text-[9px] text-gray-500">স্বাক্ষর ও তারিখ</div>
              </div>

              {/* Witness */}
              <div>
                <div className="h-9 flex items-end justify-center mb-1">
                  <div className="w-44 border-b border-dashed border-gray-500" />
                </div>
                <div className="font-bold text-gray-800">সাক্ষীগণের স্বাক্ষর</div>
                <div className="text-[9px] text-gray-500">নাম ও তারিখ সহ</div>
              </div>

              {/* Surveyor */}
              <div>
                <div className="h-9 flex flex-col justify-end items-center mb-1">
                  <span className="font-bold text-[11px] text-teal-900 pb-0.5">
                    {reportInfo?.surveyorName || ''}
                  </span>
                  <div className="w-44 border-b border-dashed border-gray-500" />
                </div>
                <div className="font-bold text-gray-800">সার্ভেয়ার / আমিনের স্বাক্ষর</div>
                <div className="text-[9px] text-gray-500">স্বাক্ষর ও সিল</div>
              </div>
            </div>
          </div>

          {/* ── DOCUMENT AUTHENTICITY FOOTER ───────────── */}
          <div className="pt-1.5 border-t border-gray-200/80 flex items-center justify-between text-[9px] text-gray-500">
            <span>
              এই প্রতিবেদনটি <strong>মৌজা ম্যাপ প্রো</strong> ডিজিটাল প্ল্যাটফর্ম দ্বারা প্রস্তুতকৃত। নির্ভুল স্কেল ও জ্যামিতিক সূত্রে গণনাকৃত।
            </span>
            <span className="font-semibold text-teal-800">
              www.mouzamappro.com
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

PrintLayout.displayName = 'PrintLayout';
