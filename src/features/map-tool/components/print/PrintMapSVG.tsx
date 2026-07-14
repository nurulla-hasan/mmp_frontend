import React from 'react';
import { getVisualCenter, isPointInPolygon } from '@/features/map-tool/utils/geometry';
import {
  formatFeetInches,
  MIN_EDGE_LABEL_FT,
} from '@/features/map-tool/utils/canvas';
import { computePrintLabels } from './PrintLabelEngine';
import type { PlotRecord } from '@/features/map-tool/types/map';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface PrintMapSVGProps {
  plots: PlotRecord[];
  isShowDiagonals: boolean;
  /** View‑box origin X */
  viewBoxMinX: number;
  /** View‑box origin Y */
  viewBoxMinY: number;
  /** View‑box width */
  viewBoxWidth: number;
  /** View‑box height */
  viewBoxHeight: number;
  /** Base scale (max of viewBox w/h) used for proportional sizing */
  baseScale: number;
  /** Stroke width for polygon outlines */
  strokeW: number;
  /** Font size for edge labels */
  fontSize: number;
  /** Padding around label text */
  labelPad: number;
  /** Perpendicular offset from segments for edge labels */
  labelOffset: number;
  /** Font size for area labels */
  areaFontSize: number;
  /** Padding around area label text */
  areaLabelPad: number;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const PrintMapSVG: React.FC<PrintMapSVGProps> = ({
  plots,
  isShowDiagonals,
  viewBoxMinX,
  viewBoxMinY,
  viewBoxWidth,
  viewBoxHeight,
  baseScale,
  strokeW,
  fontSize,
  labelPad,
  labelOffset,
  areaFontSize,
  areaLabelPad,
}) => {
  const { allLabels, plotPolygons } = computePrintLabels(plots, {
    baseScale,
    fontSize,
    labelPad,
    labelOffset,
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
    >
      {/* ── Polygons ────────────────────────── */}
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

      {/* ── Diagonals ───────────────────────── */}
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
              d.lengthFt >= MIN_EDGE_LABEL_FT ? formatFeetInches(d.lengthFt) : '';

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
                      fontSize={fontSize * 0.85}
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

      {/* ── Edge labels ─────────────────────── */}
      {allLabels.map((lbl) => (
        <g
          key={`lbl-${lbl.plotId}-${lbl.i}`}
          transform={`translate(${lbl.lx}, ${lbl.ly}) rotate(${lbl.rotation})`}
        >
          <text
            x={0}
            y={0}
            fontSize={fontSize}
            fontWeight="bold"
            fill="#0F766E"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {lbl.labelText}
          </text>
        </g>
      ))}

      {/* ── Area labels ─────────────────────── */}
      {plotPolygons.map((p) => {
        if (!p.plot.results) return null;

        const center = getVisualCenter(p.plot.points);
        const areaText = `${p.plot.results.shotok.toFixed(2)} শতক`;
        const areaWidth = areaText.length * areaFontSize * 0.55 + areaLabelPad * 1.5;
        const areaHeight = areaFontSize + areaLabelPad * 1.5;

        // Try candidate offsets to avoid overlapping edge labels
        const candidateOffsets = [
          { x: 0, y: 0 },
          { x: 0, y: -areaHeight * 1.6 },
          { x: -areaWidth * 1.2, y: 0 },
          { x: areaWidth * 1.2, y: 0 },
          { x: 0, y: areaHeight * 1.6 },
          { x: -areaWidth * 1.2, y: -areaHeight * 1.3 },
          { x: areaWidth * 1.2, y: -areaHeight * 1.3 },
        ];

        const areaPosition =
          candidateOffsets
            .map((offset) => ({ x: center.x + offset.x, y: center.y + offset.y }))
            .find((candidate) => {
              if (!isPointInPolygon(candidate, p.plot.points)) return false;
              return !allLabels.some(
                (label) =>
                  Math.abs(candidate.x - label.lx) <
                    (areaWidth + label.width) / 2 + labelPad &&
                  Math.abs(candidate.y - label.ly) <
                    (areaHeight + label.height) / 2 + labelPad,
              );
            }) ?? center;

        return (
          <g
            key={`area-${p.id}`}
            transform={`translate(${areaPosition.x}, ${areaPosition.y})`}
          >
            <rect
              x={-areaWidth / 2}
              y={-areaHeight / 2}
              width={areaWidth}
              height={areaHeight}
              fill={p.plot.color || '#0F766E'}
              rx={baseScale * 0.005}
              opacity={0.9}
            />
            <text
              x={0}
              y={0}
              fontSize={areaFontSize}
              fontWeight="bold"
              fill="white"
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
