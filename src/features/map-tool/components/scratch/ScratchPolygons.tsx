import React from 'react';
import type { Point, ScratchLine } from '@/features/map-tool/types/map';
import type { PlotSheetLayout, ScratchPhysicsLabel as PhysicsLabel, ScratchSegmentGroup as SegmentGroup } from '@/features/map-tool/types/scratch';
import { formatFeetInches } from '@/features/map-tool/utils/canvas';
import { getVisualCenter, groupPolygonSegments, GROUP_ANGLE_THRESHOLD_DEG } from '@/features/map-tool/utils/geometry';
import { signedArea } from '@/features/map-tool/utils/component-helpers';
import { polygonArea, pointToSegmentDistance } from '@/features/map-tool/utils/component-helpers';
import { SHOTOK_SQ_FT } from '@/features/map-tool/utils/calculations';
import { ScratchPlotPolygon } from './ScratchPlotPolygon';
import { ScratchEdgeLabels } from './ScratchEdgeLabels';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface ScratchPolygonsProps {
  plotLayouts: PlotSheetLayout[];
  hasMultiplePlots: boolean;
  toPagePoint: (point: Point, item: PlotSheetLayout) => Point;
  lines: ScratchLine[];
  draft: Point | null;
  centerPoint: Point | undefined;
  snapPoint: Point | null;
  pageToMapFeet: (distance: number, nearPoint?: Point) => number;
  isShowDiagonals: boolean;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const ScratchPolygons: React.FC<ScratchPolygonsProps> = ({
  plotLayouts,
  hasMultiplePlots,
  toPagePoint,
  lines,
  draft,
  centerPoint,
  snapPoint,
  pageToMapFeet,
  isShowDiagonals,
}) => {
  const drawnLines: React.ReactNode[] = [];
  const areaLabels: React.ReactNode[] = [];
  const allLabels: PhysicsLabel[] = [];
  const plotBoundaries: Point[][] = [];

  const findNearestLayout = (point: Point) => {
    if (plotLayouts.length === 0) return null;
    return plotLayouts.reduce((best, current) => {
      const bestCenter = { x: best.slot.x + best.slot.width / 2, y: best.slot.y + best.slot.height / 2 };
      const currentCenter = { x: current.slot.x + current.slot.width / 2, y: current.slot.y + current.slot.height / 2 };
      const bestDistance = Math.hypot(point.x - bestCenter.x, point.y - bestCenter.y);
      const currentDistance = Math.hypot(point.x - currentCenter.x, point.y - currentCenter.y);
      return currentDistance < bestDistance ? current : best;
    });
  };

  const isPointOnPlotBoundary = (point: Point) =>
    plotBoundaries.some((boundary) =>
      boundary.some((start, index) => {
        const end = boundary[(index + 1) % boundary.length];
        return pointToSegmentDistance(point, start, end) <= 2.5;
      }),
    );

  const isLineOnPlotBoundary = (start: Point, end: Point) => {
    const sampleCount = 5;
    for (let index = 0; index <= sampleCount; index += 1) {
      const t = index / sampleCount;
      const sample = {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      };
      if (!isPointOnPlotBoundary(sample)) return false;
    }
    return true;
  };

  // ── Per-plot edge label computation ──
  plotLayouts.forEach((item) => {
    const points = item.plot.points.map((point) => toPagePoint(point, item));
    plotBoundaries.push(points);
    const plotColor = item.plot.color || '#0d9488';

    const rawGroups = groupPolygonSegments(item.plot.points);

    const groups: SegmentGroup[] = rawGroups.map((rawGroup) => {
      const segments = rawGroup.map((seg) => ({
        i: seg.i,
        angle: seg.angle,
        lengthFt: seg.distPx / item.plot.scale,
      }));
      return {
        segments,
        totalLengthFt: segments.reduce((sum, s) => sum + s.lengthFt, 0),
      };
    });

const isClockwise = signedArea(points) < 0;

    groups.forEach((group, groupIdx) => {
      // Use first→last point of the entire group for true midpoint & angle
      const firstPt = points[group.segments[0].i];
      const lastPt = points[(group.segments[group.segments.length - 1].i + 1) % points.length];
      
      const totalDistPx = group.segments.reduce((sum, seg) => {
        const p1 = points[seg.i];
        const p2 = points[(seg.i + 1) % points.length];
        return sum + Math.hypot(p2.x - p1.x, p2.y - p1.y);
      }, 0);
      const halfDist = totalDistPx / 2;

      let walked = 0;
      let midX = firstPt.x;
      let midY = firstPt.y;
      let midDx = lastPt.x - firstPt.x;
      let midDy = lastPt.y - firstPt.y;

      for (const seg of group.segments) {
        const p1 = points[seg.i];
        const p2 = points[(seg.i + 1) % points.length];
        const sdx = p2.x - p1.x;
        const sdy = p2.y - p1.y;
        const d = Math.hypot(sdx, sdy) || 1e-5;
        if (walked + d >= halfDist) {
          const ratio = (halfDist - walked) / d;
          midX = p1.x + ratio * sdx;
          midY = p1.y + ratio * sdy;
          midDx = sdx;
          midDy = sdy;
          break;
        }
        walked += d;
      }
      
      const dx = midDx;
      const dy = midDy;
      const dist = Math.hypot(dx, dy) || 1;
      
      let perpX, perpY;
      if (isClockwise) {
        perpX = dy / dist;
        perpY = -dx / dist;
      } else {
        perpX = -dy / dist;
        perpY = dx / dist;
      }
      
      const isSmall = group.totalLengthFt < 10;
      const initialDist = isSmall ? 30 : 18; 
      const offsetThreshold = 18;
      // For small segments, shift the label along the line (tangent) to move it away from the corner
      const tangentShift = isSmall ? 10 : 0;
      
      const labelX = midX + perpX * initialDist + (dx / dist) * tangentShift;
      const labelY = midY + perpY * initialDist + (dy / dist) * tangentShift;
      
      let textAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (textAngle > 90 || textAngle < -90) {
        textAngle += 180;
      }
      
      allLabels.push({
        id: `${item.plot.id}-${groupIdx}`,
        midX, midY,
        x: labelX, y: labelY,
        offset: offsetThreshold,
        textAngle,
        labelText: formatFeetInches(group.totalLengthFt),
        fontSize: 11,
        color: plotColor
      });
    });
  });

  let draftNode: React.ReactNode = null;
  let draftCircle: React.ReactNode = null;

  const allDrawnLines = [...lines];
  if (draft && centerPoint) {
    allDrawnLines.push({ id: 'draft-line', start: draft, end: centerPoint, dashed: true });
  }

  const chains: ScratchLine[][] = [];
  let currentChain: ScratchLine[] = [];
  
  allDrawnLines.forEach((line) => {
    if (currentChain.length === 0) {
      currentChain.push(line);
    } else {
      const lastLine = currentChain[currentChain.length - 1];
      if (Math.hypot(lastLine.end.x - line.start.x, lastLine.end.y - line.start.y) < 5) {
        currentChain.push(line);
      } else {
        chains.push(currentChain);
        currentChain = [line];
      }
    }
  });
  if (currentChain.length > 0) {
    chains.push(currentChain);
  }

  chains.forEach((chain) => {
    let signedArea = 0;
    chain.forEach(line => {
      signedArea += (line.end.x - line.start.x) * (line.end.y + line.start.y);
    });
    const first = chain[0].start;
    const last = chain[chain.length - 1].end;
    signedArea += (first.x - last.x) * (first.y + last.y);
    
    const isClockwise = signedArea < 0;

    if (chain.length >= 2 && !chain.some((line) => line.id === 'draft-line')) {
      const chainPoints = [chain[0].start, ...chain.map((line) => line.end)];
      const areaPage = polygonArea(chainPoints);
      const visualCenter = getVisualCenter(chainPoints);
      const layout = findNearestLayout(visualCenter);
      if (layout && areaPage > 1 && layout.scale > 0 && layout.plot.scale > 0) {
        const sourcePixelArea = areaPage / (layout.scale * layout.scale);
        const sqft = sourcePixelArea / (layout.plot.scale * layout.plot.scale);
        const shotok = sqft / SHOTOK_SQ_FT;
        if (Number.isFinite(shotok) && shotok >= 0.01) {
          const label = `${shotok.toFixed(2)} শতক`;
          const width = Math.max(34, label.length * 5.2);
          areaLabels.push(
            <g key={`scratch-area-${chain[0].id}`}>
              <rect
                x={visualCenter.x - width / 2}
                y={visualCenter.y - 7}
                width={width}
                height="14"
                rx="3"
                fill="#0F766E"
                opacity="0.95"
              />
              <text
                x={visualCenter.x}
                y={visualCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="8"
                fill="white"
                fontWeight="600"
              >
                {label}
              </text>
            </g>,
          );
        }
      }
    }
    
    // ── Build segments from chain lines for co-linear grouping ──
    const chainSegments = chain.map((line) => {
      const dx = line.end.x - line.start.x;
      const dy = line.end.y - line.start.y;
      const dist = Math.hypot(dx, dy) || 1;
      const midX = (line.start.x + line.end.x) / 2;
      const midY = (line.start.y + line.end.y) / 2;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const lengthFt = pageToMapFeet(dist, { x: midX, y: midY });
      return { line, dx, dy, dist, midX, midY, angle, lengthFt };
    });

    // Group co-linear segments (same threshold as polygon edges)
    const segGroups: { segments: typeof chainSegments; totalLengthFt: number }[] = [];
    if (chainSegments.length > 0) {
      let curGroup = [chainSegments[0]];
      for (let i = 1; i < chainSegments.length; i++) {
        const seg = chainSegments[i];
        const prevSeg = curGroup[curGroup.length - 1];
        let deflection = Math.abs(seg.angle - prevSeg.angle);
        if (deflection > 180) deflection = 360 - deflection;
        if (deflection <= GROUP_ANGLE_THRESHOLD_DEG) {
          curGroup.push(seg);
        } else {
          segGroups.push({ segments: curGroup, totalLengthFt: curGroup.reduce((sum, s) => sum + s.lengthFt, 0) });
          curGroup = [seg];
        }
      }
      segGroups.push({ segments: curGroup, totalLengthFt: curGroup.reduce((sum, s) => sum + s.lengthFt, 0) });
    }

    // One combined label per co-linear group (using first→last point for true midpoint & angle)
    segGroups.forEach((group) => {
      const firstSeg = group.segments[0];
      const lastSeg = group.segments[group.segments.length - 1];
      const firstPt = firstSeg.line.start;
      const lastPt = lastSeg.line.end;

      const totalDistPx = group.segments.reduce((sum, seg) => sum + seg.dist, 0);
      const halfDist = totalDistPx / 2;

      let walked = 0;
      let midX = firstPt.x;
      let midY = firstPt.y;
      let midDx = lastPt.x - firstPt.x;
      let midDy = lastPt.y - firstPt.y;

      for (const seg of group.segments) {
        const d = seg.dist || 1e-5;
        if (walked + d >= halfDist) {
          const ratio = (halfDist - walked) / d;
          midX = seg.line.start.x + ratio * seg.dx;
          midY = seg.line.start.y + ratio * seg.dy;
          midDx = seg.dx;
          midDy = seg.dy;
          break;
        }
        walked += d;
      }

      const dx = midDx;
      const dy = midDy;
      const dist = Math.hypot(dx, dy) || 1;
      const line = firstSeg.line;

      let perpX, perpY;
      if (isClockwise) {
        perpX = dy / dist;
        perpY = -dx / dist;
      } else {
        perpX = -dy / dist;
        perpY = dx / dist;
      }

      const isSmall = group.totalLengthFt < 10;
      const initialDist = isSmall ? 30 : 18;
      const offsetThreshold = 18;
      const tangentShift = isSmall ? 10 : 0;

      const labelX = midX + perpX * initialDist + (dx / dist) * tangentShift;
      const labelY = midY + perpY * initialDist + (dy / dist) * tangentShift;

      let textAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (textAngle > 90 || textAngle < -90) {
        textAngle += 180;
      }

      if (!isLineOnPlotBoundary(line.start, line.end)) {
        allLabels.push({
          id: `${line.id}-group`,
          midX, midY,
          x: labelX, y: labelY,
          offset: offsetThreshold,
          textAngle,
          labelText: formatFeetInches(group.totalLengthFt),
          fontSize: 8,
        });
      }
    });

    // Render individual lines (still drawn separately)
    chain.forEach((line) => {
      if (line.id === 'draft-line') {
        let firstPointOfActiveChain: Point | null = null;
        if (draft && lines.length > 0) {
          firstPointOfActiveChain = draft;
          for (let i = lines.length - 1; i >= 0; i--) {
            if (Math.hypot(lines[i].end.x - firstPointOfActiveChain.x, lines[i].end.y - firstPointOfActiveChain.y) < 2) {
              firstPointOfActiveChain = lines[i].start;
            } else {
              break;
            }
          }
        }
        const isClosing = firstPointOfActiveChain && Math.hypot(line.end.x - firstPointOfActiveChain.x, line.end.y - firstPointOfActiveChain.y) < 2;

        draftNode = <line x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="#2563EB" strokeWidth="1" strokeDasharray="4 2" />;
        if (isClosing) {
          draftCircle = (
            <g>
              <circle cx={line.start.x} cy={line.start.y} r="1.5" fill="#111" />
              <circle cx={line.end.x} cy={line.end.y} r="6" fill="transparent" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={line.end.x} cy={line.end.y} r="3" fill="#2563EB" />
            </g>
          );
        } else {
          draftCircle = <circle cx={line.start.x} cy={line.start.y} r="1.5" fill="#111" />;
        }
      } else {
        drawnLines.push(
          <line key={`drawn-${line.id}`} x1={line.start.x} y1={line.start.y} x2={line.end.x} y2={line.end.y} stroke="#111" strokeWidth="1.2" strokeDasharray={line.dashed ? '4 3' : undefined} />
        );
      }
    });
  });

  return (
    <>
      {plotLayouts.map((item, index) => (
        <ScratchPlotPolygon
          key={item.plot.id}
          item={item}
          toPagePoint={toPagePoint}
          hasMultiplePlots={hasMultiplePlots}
          plotIndex={index}
          isShowDiagonals={isShowDiagonals}
        />
      ))}
      {drawnLines}
      {draftNode}
      {areaLabels}
      <ScratchEdgeLabels allLabels={allLabels} />
      {snapPoint && (
        <g>
          <circle cx={snapPoint.x} cy={snapPoint.y} r="7" fill="transparent" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={snapPoint.x} cy={snapPoint.y} r="3" fill="#2563EB" />
        </g>
      )}
      {draftCircle}
    </>
  );
};
