import {
  getVisualCenter,
  groupPolygonSegments,
  isPointInPolygon,
} from '@/features/land-measurement/utils/geometry';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import { formatFeetInches } from '@/features/land-measurement/utils/canvas';
import type { Point, PlotRecord } from '@/features/land-measurement/types/map';

export interface LabelDatum {
  plotId: string;
  i: number;
  lx: number;
  ly: number;
  rotation: number;
  labelText: string;
  width: number;
  height: number;
  fontSize: number;
}

export interface PlotPolygonInfo {
  id: string;
  pointsStr: string;
  plot: PlotRecord;
  area: number;
}

export interface PrintLabelConfig {
  baseScale: number;
  fontSize: number;
  labelPad: number;
  labelOffset: number;
}

const getPathMidpoint = (segments: ReturnType<typeof groupPolygonSegments>[number]) => {
  const totalDistPx = segments.reduce((sum, segment) => sum + segment.distPx, 0);
  const halfDist = totalDistPx / 2;
  let walked = 0;
  let midX = segments[0]?.point.x ?? 0;
  let midY = segments[0]?.point.y ?? 0;
  let midDx = segments[0]?.dx ?? 1;
  let midDy = segments[0]?.dy ?? 0;

  for (const segment of segments) {
    const distance = segment.distPx || 1e-5;
    if (walked + distance >= halfDist) {
      const ratio = (halfDist - walked) / distance;
      midX = segment.point.x + ratio * segment.dx;
      midY = segment.point.y + ratio * segment.dy;
      midDx = segment.dx;
      midDy = segment.dy;
      break;
    }
    walked += distance;
  }

  return { midX, midY, midDx, midDy, totalDistPx };
};

const getInwardNormal = (
  midpoint: Point,
  dx: number,
  dy: number,
  plotPoints: Point[],
  testDistance: number,
) => {
  const distance = Math.hypot(dx, dy) || 1;
  const normalA = { x: -dy / distance, y: dx / distance };
  const normalB = { x: dy / distance, y: -dx / distance };

  const testA = {
    x: midpoint.x + normalA.x * testDistance,
    y: midpoint.y + normalA.y * testDistance,
  };
  if (isPointInPolygon(testA, plotPoints)) return normalA;

  const testB = {
    x: midpoint.x + normalB.x * testDistance,
    y: midpoint.y + normalB.y * testDistance,
  };
  if (isPointInPolygon(testB, plotPoints)) return normalB;

  const center = getVisualCenter(plotPoints);
  const centerDx = center.x - midpoint.x;
  const centerDy = center.y - midpoint.y;
  const centerDistance = Math.hypot(centerDx, centerDy) || 1;
  return { x: centerDx / centerDistance, y: centerDy / centerDistance };
};

const labelFitsInside = (
  center: Point,
  rotation: number,
  width: number,
  height: number,
  plotPoints: Point[],
) => {
  const radians = rotation * (Math.PI / 180);
  const along = { x: Math.cos(radians), y: Math.sin(radians) };
  const across = { x: -Math.sin(radians), y: Math.cos(radians) };
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const corners = [
    { x: center.x + along.x * halfWidth + across.x * halfHeight, y: center.y + along.y * halfWidth + across.y * halfHeight },
    { x: center.x + along.x * halfWidth - across.x * halfHeight, y: center.y + along.y * halfWidth - across.y * halfHeight },
    { x: center.x - along.x * halfWidth + across.x * halfHeight, y: center.y - along.y * halfWidth + across.y * halfHeight },
    { x: center.x - along.x * halfWidth - across.x * halfHeight, y: center.y - along.y * halfWidth - across.y * halfHeight },
  ];

  return corners.every((corner) => isPointInPolygon(corner, plotPoints));
};

/**
 * Compute one dimension label for every logical plot edge.
 * Labels are moved inward, so a shared boundary naturally gets one label on
 * each side — each label belonging to its own plot. Print dimensions use the
 * report's area-label size by default and only shrink when an edge cannot fit it.
 */
export function computePrintLabels(
  plots: PlotRecord[],
  config: PrintLabelConfig,
): { allLabels: LabelDatum[]; plotPolygons: PlotPolygonInfo[] } {
  const { baseScale, fontSize, labelPad, labelOffset } = config;

  const plotPolygons = plots
    .map((plot) => ({
      id: plot.id,
      pointsStr: plot.points.map((point) => `${point.x},${point.y}`).join(' '),
      plot,
      area: plot.results?.shotok ?? 0,
    }))
    .sort((a, b) => a.area - b.area);

  const allLabels: LabelDatum[] = [];

  for (const { plot } of plotPolygons) {
    const groups = groupPolygonSegments(plot.points);

    groups.forEach((segments, groupIndex) => {
      if (segments.length === 0) return;

      const { midX, midY, midDx, midDy, totalDistPx } = getPathMidpoint(segments);
      if (totalDistPx <= 0) return;

      const totalLengthFt = segments.reduce(
        (sum, segment) => sum + (plot.results.lengths[segment.i] ?? 0),
        0,
      );
      const labelText = formatFeetInches(totalLengthFt);
      const rotation = getReadableRotation(Math.atan2(midDy, midDx) * (180 / Math.PI));

      // Keep dimensions visually consistent with the centered shotok labels.
      // Only reduce the size when the text physically cannot fit on a short edge.
      let dynamicFontSize = fontSize;
      let dynamicPad = labelPad;
      let width = labelText.length * dynamicFontSize * 0.62 + dynamicPad * 2;
      const maxWidth = Math.max(fontSize * 2.4, totalDistPx * 0.8);

      if (width > maxWidth) {
        const fitRatio = maxWidth / width;
        dynamicFontSize = Math.max(fontSize * 0.72, dynamicFontSize * fitRatio);
        dynamicPad = Math.max(labelPad * 0.6, dynamicPad * fitRatio);
        width = labelText.length * dynamicFontSize * 0.62 + dynamicPad * 2;
      }

      const midpoint = { x: midX, y: midY };
      const inward = getInwardNormal(
        midpoint,
        midDx,
        midDy,
        plot.points,
        Math.max(baseScale * 0.006, totalDistPx * 0.03),
      );

      let chosen: LabelDatum | null = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const shrink = Math.pow(0.92, attempt);
        const attemptFontSize = Math.max(fontSize * 0.68, dynamicFontSize * shrink);
        const attemptPad = Math.max(labelPad * 0.55, dynamicPad * shrink);
        const attemptWidth = labelText.length * attemptFontSize * 0.62 + attemptPad * 2;
        const attemptHeight = attemptFontSize + attemptPad * 2;

        // Sit close to the measured boundary. If the label cannot fit there,
        // later attempts progressively move it farther inward while shrinking.
        const inset = Math.max(
          labelOffset * 0.22,
          attemptHeight * (0.42 + attempt * 0.07),
        );
        const center = {
          x: midX + inward.x * inset,
          y: midY + inward.y * inset,
        };

        if (!labelFitsInside(center, rotation, attemptWidth, attemptHeight, plot.points) && attempt < 4) {
          continue;
        }

        chosen = {
          plotId: plot.id,
          i: groupIndex,
          lx: center.x,
          ly: center.y,
          rotation,
          labelText,
          width: attemptWidth,
          height: attemptHeight,
          fontSize: attemptFontSize,
        };
        break;
      }

      if (chosen) allLabels.push(chosen);
    });
  }

  return { allLabels, plotPolygons };
}
