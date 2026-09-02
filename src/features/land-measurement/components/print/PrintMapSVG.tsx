import React from 'react';
import {
  formatFeetInches,
  MIN_EDGE_LABEL_FT,
} from '@/features/land-measurement/utils/canvas';
import { toBengaliDigits } from '@/lib/utils';
import { computePrintLabels } from './PrintLabelEngine';
import type { PlotRecord } from '@/features/land-measurement/types/map';

interface PrintMapSVGProps {
  plots: PlotRecord[];
  isShowDiagonals: boolean;
  viewBoxMinX: number;
  viewBoxMinY: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  baseScale: number;
  strokeW: number;
  fontSize: number;
  labelPad: number;
  labelOffset: number;
  areaFontSize: number;
  areaLabelPad: number;
}

export const PrintMapSVG: React.FC<PrintMapSVGProps> = ({
  plots,
  isShowDiagonals,
  viewBoxMinX,
  viewBoxMinY,
  viewBoxWidth,
  viewBoxHeight,
  baseScale,
  strokeW,
  labelPad,
  labelOffset,
  areaFontSize,
}) => {
  // Edge and area labels share the exact same base size in print.
  const reportLabelFontSize = areaFontSize * 1.1;

  const { allLabels, plotPolygons } = computePrintLabels(plots, {
    baseScale,
    fontSize: reportLabelFontSize,
    labelPad,
    labelOffset,
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
    >
      {/* Polygons */}
      {plotPolygons.map((p) => (
        <polygon
          key={p.id}
          points={p.pointsStr}
          fill={p.plot.color || '#0F766E'}
          fillOpacity={0.1}
          stroke={p.plot.color || '#0F766E'}
          strokeWidth={strokeW}
          strokeLinejoin="round"
        />
      ))}

      {/* Diagonals */}
      {isShowDiagonals &&
        plots.map((plot) =>
          plot.results.diagonals?.map((d, dIdx) => {
            const p1 = plot.points[d.p1Index];
            const p2 = plot.points[d.p2Index];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distPx = Math.hypot(dx, dy);
            if (distPx < baseScale * 0.05) return null;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const labelText =
              d.lengthFt >= MIN_EDGE_LABEL_FT ? toBengaliDigits(formatFeetInches(d.lengthFt)) : '';

            return (
              <g key={`diag-${plot.id}-${dIdx}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={plot.color || '#0F766E'}
                  strokeWidth={strokeW * 0.4}
                  strokeDasharray={`${baseScale * 0.005}, ${baseScale * 0.005}`}
                  opacity={0.5}
                />
                {labelText && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <text
                      x={0}
                      y={0}
                      fontSize={reportLabelFontSize * 0.85}
                      fontWeight="bold"
                      fill="#0F766E"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {labelText}
                    </text>
                  </g>
                )}
              </g>
            );
          }),
        )}

      {/* Edge labels */}
      {allLabels.map((lbl) => (
        <g
          key={`lbl-${lbl.plotId}-${lbl.i}`}
          transform={`translate(${lbl.lx}, ${lbl.ly}) rotate(${lbl.rotation})`}
        >
          <text
            x={0}
            y={0}
            fontSize={lbl.fontSize}
            fontWeight="700"
            fill="#0F766E"
            stroke="rgba(255,255,255,0.96)"
            strokeWidth={baseScale * 0.0022}
            strokeLinejoin="round"
            paintOrder="stroke"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {lbl.labelText}
          </text>
        </g>
      ))}

      {/* Area labels — one shared map/print layout: center + dominant-axis rotation. */}
      {plotPolygons.map((p) => {
        if (!p.plot.results) return null;

        const { center, rotation } = p.areaLabelLayout;
        const areaText = `${toBengaliDigits(p.plot.results.shotok.toFixed(2))} শতক`;
        const areaColor = p.plot.color || '#0F766E';

        return (
          <g
            key={`area-${p.id}`}
            transform={`translate(${center.x}, ${center.y}) rotate(${rotation})`}
          >
            <text
              x={0}
              y={0}
              fontSize={reportLabelFontSize}
              fontWeight="700"
              fill={areaColor}
              stroke="rgba(255,255,255,0.96)"
              strokeWidth={baseScale * 0.003}
              strokeLinejoin="round"
              paintOrder="stroke"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {areaText}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
