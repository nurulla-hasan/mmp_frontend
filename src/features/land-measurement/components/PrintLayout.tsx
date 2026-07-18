import React from 'react';
import { useShallow } from 'zustand/shallow';
import { AREA_LABEL_FONT_SCALE, AREA_LABEL_PADDING_FACTOR } from '@/features/land-measurement/utils/canvas';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
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

  // Calculate total shotok
  let totalShotok = '';
  if (plots.length > 0) {
    const sum = plots.reduce((acc, plot) => acc + plot.results.shotok, 0);
    totalShotok = sum.toFixed(3);
  } else if (results) {
    totalShotok = results.shotok.toFixed(3);
  }

  const toBengaliNumber = (engNum: string) => {
    const banglaDigits: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return engNum.replace(/[0-9]/g, (w) => banglaDigits[w]);
  };

  const totalShotokBangla = totalShotok ? toBengaliNumber(totalShotok) : '';

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

  // Calculate dynamic stroke widths based on viewBox size to keep lines visible
  const baseScale = Math.max(viewBoxWidth, viewBoxHeight);
  const strokeW = baseScale * 0.005;
  const fontSize = baseScale * 0.018;
  const labelPad = baseScale * 0.005;
  const labelOffset = baseScale * 0.02;
  const areaFontSize = fontSize * Math.max(0.78, AREA_LABEL_FONT_SCALE * 0.85);
  const areaLabelPad = labelPad * Math.max(0.65, AREA_LABEL_PADDING_FACTOR * 0.8);

  return (
    <div ref={ref} className="print-layout hidden print:flex print:flex-col font-sans print:pt-[7mm] print:pb-[3mm] print:px-[8mm] w-full print:h-[297mm] overflow-hidden bg-white relative">

      {/* Beautiful Header */}
      <div className="flex flex-col items-center mb-2">
        <h1 className="text-3xl font-black text-teal-800 tracking-tight border-b-[3px] border-teal-600 pb-2 px-8 mb-4 inline-block">
          ভূমি পরিমাপ প্রতিবেদন
        </h1>

        <div className="w-full grid grid-cols-2 gap-x-16 gap-y-3 text-[1.1rem] text-black px-4">
          <div className="flex items-end">
            <span className="w-28 font-bold text-gray-700">মৌজা:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-gray-900 pb-0.5">
              {reportInfo?.mouza ? toBengaliNumber(reportInfo.mouza) : ''}
            </span>
          </div>
          <div className="flex items-end">
            <span className="w-32 font-bold text-gray-700">খতিয়ান নং:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-gray-900 pb-0.5">
              {reportInfo?.khatianNo ? toBengaliNumber(reportInfo.khatianNo) : ''}
            </span>
          </div>
          <div className="flex items-end">
            <span className="w-28 font-bold text-gray-700">জে. এল. নং:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-gray-900 pb-0.5">
              {reportInfo?.jlNo ? toBengaliNumber(reportInfo.jlNo) : ''}
            </span>
          </div>
          <div className="flex items-end">
            <span className="w-32 font-bold text-gray-700">দাগ নং:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-gray-900 pb-0.5">
              {reportInfo?.dagNo ? toBengaliNumber(reportInfo.dagNo) : ''}
            </span>
          </div>
          <div className="flex items-end">
            <span className="w-28 font-bold text-gray-700">মোট পরিমাণ:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-xl text-teal-700 pb-0.5">
              {totalShotokBangla ? `${totalShotokBangla} শতক` : ''}
            </span>
          </div>
          <div className="flex items-end">
            <span className="w-32 font-bold text-gray-700">তারিখ:</span>
            <span className="flex-1 border-b-[1.5px] border-dashed border-gray-400 text-center font-bold text-gray-900 pb-0.5">
              {reportInfo?.date ? toBengaliNumber(reportInfo.date) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Map Section */}
      <div className="flex-1 w-full flex justify-center items-center mt-4 min-h-0 relative">
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

      {/* Footer (Signatures) */}
      <div className="mt-2 pt-2 flex justify-between items-end text-lg text-black px-8">
        <div className="w-56 text-center">
          <div className="border-b-[1.5px] border-dashed border-gray-600 mb-2">&nbsp;</div>
          <div className="font-bold text-gray-700">উপস্থিত সাক্ষীদের স্বাক্ষর</div>
        </div>
        <div className="w-64 text-center">
          <div className="border-b-[1.5px] border-dashed border-gray-600 mb-2 pb-0.5 h-7 font-bold text-gray-900">
            {reportInfo?.surveyorName || ''}
          </div>
          <div className="font-bold text-gray-700">সার্ভেয়ারের স্বাক্ষর</div>
        </div>
      </div>

      <div className="mt-1 text-center text-[10px] font-medium text-green-800">
        Generated by{' '}
        <a
          // href="https://mouzamappro.com"
          href="https://mouzamappro.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          Mouza Map Pro
        </a>
      </div>

    </div>
  );
});

PrintLayout.displayName = 'PrintLayout';
