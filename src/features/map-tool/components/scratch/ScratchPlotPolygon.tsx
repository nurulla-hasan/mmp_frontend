import React from 'react';
import type { Point } from '@/features/map-tool/types/map';
import type { PlotSheetLayout } from '@/features/map-tool/types/scratch';
import { formatFeetInches } from '@/features/map-tool/utils/canvas';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface ScratchPlotPolygonProps {
  item: PlotSheetLayout;
  toPagePoint: (point: Point, item: PlotSheetLayout) => Point;
  hasMultiplePlots: boolean;
  plotIndex: number;
  isShowDiagonals: boolean;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const ScratchPlotPolygon: React.FC<ScratchPlotPolygonProps> = ({
  item,
  toPagePoint,
  hasMultiplePlots,
  plotIndex,
  isShowDiagonals,
}) => {
  const points = item.plot.points.map((point) => toPagePoint(point, item));
  const plotColor = item.plot.color || '#0d9488';

  return (
    <g>
      {/* Polygon shape */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={plotColor}
        strokeWidth="2.2"
      />

      {/* Plot marker index */}
      {hasMultiplePlots && (
        <text
          x={Math.min(...points.map((p) => p.x)) - 16}
          y={Math.min(...points.map((p) => p.y)) - 12}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fontFamily="serif"
        >
          {plotIndex + 1}
        </text>
      )}

      {/* Diagonals */}
      {isShowDiagonals &&
        item.plot.results.diagonals?.map((d, dIdx) => {
          const p1 = toPagePoint(item.plot.points[d.p1Index], item);
          const p2 = toPagePoint(item.plot.points[d.p2Index], item);
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const distPx = Math.hypot(dx, dy);

          let textAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          if (textAngle > 90 || textAngle < -90) {
            textAngle += 180;
          }

          return (
            <g key={`diag-${item.plot.id}-${dIdx}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={plotColor}
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              {distPx > 10 && d.lengthFt > 0 && (
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fill={plotColor}
                  fontWeight="600"
                  paintOrder="stroke"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  transform={`rotate(${textAngle}, ${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}
                  opacity="0.8"
                >
                  {formatFeetInches(d.lengthFt)}
                </text>
              )}
            </g>
          );
        })}
    </g>
  );
};
