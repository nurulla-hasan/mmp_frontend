import {
  getLogicalCorners,
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
  areaLabelCenter: Point;
}

export interface PrintLabelConfig {
  baseScale: number;
  fontSize: number;
  labelPad: number;
  labelOffset: number;
}

const EPSILON = 1e-8;

const getPolygonCentroid = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length < 3) {
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 },
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  let twiceArea = 0;
  let centroidX = 0;
  let centroidY = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const cross = current.x * next.y - next.x * current.y;
    twiceArea += cross;
    centroidX += (current.x + next.x) * cross;
    centroidY += (current.y + next.y) * cross;
  }

  if (Math.abs(twiceArea) <= EPSILON) {
    const sum = points.reduce(
      (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
      { x: 0, y: 0 },
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  }

  return {
    x: centroidX / (3 * twiceArea),
    y: centroidY / (3 * twiceArea),
  };
};

/**
 * Find the plot's dominant direction in O(n), project it into that local
 * coordinate system, and use the center of the oriented bounds. This keeps
 * long/slanted plots visually centered without rotating the printed area text.
 *
 * Intermediate points on otherwise straight edges are reduced to logical
 * corners first so dense tracing on one side cannot bias the principal axis.
 */
const getOrientedAreaLabelCenter = (points: Point[]): Point => {
  if (points.length < 3) return getPolygonCentroid(points);

  const logicalCorners = getLogicalCorners(points);
  const axisPoints = logicalCorners.length >= 3 ? logicalCorners : points;

  const mean = axisPoints.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 },
  );
  mean.x /= axisPoints.length;
  mean.y /= axisPoints.length;

  let covXX = 0;
  let covYY = 0;
  let covXY = 0;
  for (const point of axisPoints) {
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    covXX += dx * dx;
    covYY += dy * dy;
    covXY += dx * dy;
  }

  const angle = 0.5 * Math.atan2(2 * covXY, covXX - covYY);
  const axisX = { x: Math.cos(angle), y: Math.sin(angle) };
  const axisY = { x: -axisX.y, y: axisX.x };

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    const localX = point.x * axisX.x + point.y * axisX.y;
    const localY = point.x * axisY.x + point.y * axisY.y;
    if (localX < minX) minX = localX;
    if (localX > maxX) maxX = localX;
    if (localY < minY) minY = localY;
    if (localY > maxY) maxY = localY;
  }

  const localCenterX = (minX + maxX) / 2;
  const localCenterY = (minY + maxY) / 2;
  const orientedCenter = {
    x: localCenterX * axisX.x + localCenterY * axisY.x,
    y: localCenterX * axisX.y + localCenterY * axisY.y,
  };

  if (isPointInPolygon(orientedCenter, points)) return orientedCenter;

  const centroid = getPolygonCentroid(points);
  if (isPointInPolygon(centroid, points)) return centroid;

  // Concave/irregular edge case only. This grid-based fallback is intentionally
  // last so the normal print path remains linear in the number of vertices.
  return getVisualCenter(points);
};

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
 * Shared boundaries keep one label on each plot side. In print, edge labels use
 * the same base font size as the centered area label; positioning moves inward
 * before any size reduction is considered.
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
      areaLabelCenter: getOrientedAreaLabelCenter(plot.points),
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

      // Normal print dimensions stay exactly the same size as the area label.
      // Only genuinely short edges can fall back to 90% so text remains inside.
      const naturalPad = labelPad * 0.65;
      const naturalWidth = labelText.length * fontSize * 0.62 + naturalPad * 2;
      const maxEdgeWidth = totalDistPx * 0.96;
      const edgeFontSize = naturalWidth <= maxEdgeWidth ? fontSize : fontSize * 0.9;
      const edgePad = naturalWidth <= maxEdgeWidth ? naturalPad : naturalPad * 0.9;
      const labelWidth = labelText.length * edgeFontSize * 0.62 + edgePad * 2;
      const labelHeight = edgeFontSize + edgePad * 2;

      const midpoint = { x: midX, y: midY };
      const inward = getInwardNormal(
        midpoint,
        midDx,
        midDy,
        plot.points,
        Math.max(baseScale * 0.006, totalDistPx * 0.03),
      );

      let chosen: LabelDatum | null = null;

      // Keep the font fixed; try progressively deeper positions instead.
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const inset = Math.max(
          labelOffset * 0.2,
          labelHeight * (0.46 + attempt * 0.13),
        );
        const center = {
          x: midX + inward.x * inset,
          y: midY + inward.y * inset,
        };

        if (!labelFitsInside(center, rotation, labelWidth, labelHeight, plot.points) && attempt < 5) {
          continue;
        }

        chosen = {
          plotId: plot.id,
          i: groupIndex,
          lx: center.x,
          ly: center.y,
          rotation,
          labelText,
          width: labelWidth,
          height: labelHeight,
          fontSize: edgeFontSize,
        };
        break;
      }

      if (chosen) allLabels.push(chosen);
    });
  }

  return { allLabels, plotPolygons };
}
