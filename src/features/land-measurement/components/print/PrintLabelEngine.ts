import { groupPolygonSegments } from '@/features/land-measurement/utils/geometry';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import { formatFeetInches, MIN_EDGE_LABEL_FT } from '@/features/land-measurement/utils/canvas';
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

type LabelCandidate = LabelDatum & {
  boundaryKey: string;
  isShared: boolean;
  lengthFt: number;
};

type LabelBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const boxesOverlap = (a: LabelBox, b: LabelBox) =>
  a.left < b.right &&
  a.right > b.left &&
  a.top < b.bottom &&
  a.bottom > b.top;

const quantize = (value: number, tolerance: number) => Math.round(value / tolerance);

const getSegmentKey = (start: Point, end: Point, tolerance: number) => {
  const a = `${quantize(start.x, tolerance)},${quantize(start.y, tolerance)}`;
  const b = `${quantize(end.x, tolerance)},${quantize(end.y, tolerance)}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
};

const getLabelBox = (label: LabelDatum, padding: number): LabelBox => {
  const radians = label.rotation * (Math.PI / 180);
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const rotatedWidth = label.width * cos + label.height * sin + padding * 2;
  const rotatedHeight = label.width * sin + label.height * cos + padding * 2;

  return {
    left: label.lx - rotatedWidth / 2,
    right: label.lx + rotatedWidth / 2,
    top: label.ly - rotatedHeight / 2,
    bottom: label.ly + rotatedHeight / 2,
  };
};

/**
 * Compute print labels with survey-style priorities:
 * 1) keep all outer-boundary dimensions,
 * 2) render a shared/internal boundary only once,
 * 3) suppress internal labels that would collide with higher-priority labels.
 */
export function computePrintLabels(
  plots: PlotRecord[],
  config: PrintLabelConfig,
): { allLabels: LabelDatum[]; plotPolygons: PlotPolygonInfo[] } {
  const { baseScale, fontSize, labelPad, labelOffset } = config;
  const coordinateTolerance = Math.max(baseScale * 0.00001, 0.0001);

  const plotPolygons = plots
    .map((plot) => ({
      id: plot.id,
      pointsStr: plot.points.map((p) => `${p.x},${p.y}`).join(' '),
      plot,
      area: plot.results?.shotok ?? 0,
    }))
    .sort((a, b) => a.area - b.area);

  // Count atomic edges first. An edge used by more than one plot is internal/shared.
  const segmentUsage = new Map<string, number>();
  const groupedSegmentsByPlot = new Map<string, ReturnType<typeof groupPolygonSegments>>();

  for (const { plot } of plotPolygons) {
    const rawGroups = groupPolygonSegments(plot.points);
    groupedSegmentsByPlot.set(plot.id, rawGroups);

    rawGroups.forEach((group) => {
      group.forEach((seg) => {
        const key = getSegmentKey(seg.point, seg.nextPoint, coordinateTolerance);
        segmentUsage.set(key, (segmentUsage.get(key) ?? 0) + 1);
      });
    });
  }

  const candidates: LabelCandidate[] = [];

  for (const { plot } of plotPolygons) {
    const rawGroups = groupedSegmentsByPlot.get(plot.id) ?? [];

    const groups = rawGroups.map((rawGroup) => {
      const segments = rawGroup.map((seg) => ({
        ...seg,
        lengthFt: plot.results.lengths[seg.i] ?? 0,
      }));
      return {
        segments,
        totalDistPx: segments.reduce((sum, s) => sum + s.distPx, 0),
        totalLengthFt: segments.reduce((sum, s) => sum + s.lengthFt, 0),
      };
    });

    // Winding order controls the outward label offset.
    let signedArea = 0;
    for (let i = 0; i < plot.points.length; i++) {
      const p1 = plot.points[i];
      const p2 = plot.points[(i + 1) % plot.points.length];
      signedArea += (p2.x - p1.x) * (p2.y + p1.y);
    }
    const isClockwise = signedArea < 0;

    for (const [groupIdx, group] of groups.entries()) {
      if (group.totalLengthFt < MIN_EDGE_LABEL_FT || group.segments.length === 0) continue;

      const segmentKeys = group.segments.map((seg) =>
        getSegmentKey(seg.point, seg.nextPoint, coordinateTolerance),
      );
      const boundaryKey = [...segmentKeys].sort().join('::');
      const isShared = segmentKeys.every((key) => (segmentUsage.get(key) ?? 0) > 1);

      const labelText = formatFeetInches(group.totalLengthFt);
      const firstPt = group.segments[0].point;
      const lastPt = group.segments[group.segments.length - 1].nextPoint;
      const totalDistPx = group.totalDistPx;
      const halfDist = totalDistPx / 2;

      let walked = 0;
      let midX = firstPt.x;
      let midY = firstPt.y;
      let midDx = lastPt.x - firstPt.x;
      let midDy = lastPt.y - firstPt.y;

      for (const seg of group.segments) {
        const d = seg.distPx || 1e-5;
        if (walked + d >= halfDist) {
          const ratio = (halfDist - walked) / d;
          midX = seg.point.x + ratio * seg.dx;
          midY = seg.point.y + ratio * seg.dy;
          midDx = seg.dx;
          midDy = seg.dy;
          break;
        }
        walked += d;
      }

      const dist = Math.hypot(midDx, midDy) > 0.001 ? Math.hypot(midDx, midDy) : 1;
      const angle = Math.atan2(midDy, midDx) * (180 / Math.PI);
      const rotation = getReadableRotation(angle);
      const perpX = isClockwise ? midDy / dist : -midDy / dist;
      const perpY = isClockwise ? -midDx / dist : midDx / dist;
      const effectiveOffset = isShared ? labelOffset * 0.82 : labelOffset;
      const lx = midX + perpX * effectiveOffset;
      const ly = midY + perpY * effectiveOffset;
      const width = labelText.length * fontSize * 0.62 + labelPad * 2;
      const height = fontSize + labelPad * 2;

      candidates.push({
        plotId: plot.id,
        i: groupIdx,
        lx,
        ly,
        rotation,
        labelText,
        width,
        height,
        boundaryKey,
        isShared,
        lengthFt: group.totalLengthFt,
      });
    }
  }

  // Exact shared groups can arrive once from each adjacent plot. Keep one copy only.
  const seenSharedBoundaries = new Set<string>();
  const outerCandidates: LabelCandidate[] = [];
  const sharedCandidates: LabelCandidate[] = [];

  candidates.forEach((candidate) => {
    if (!candidate.isShared) {
      outerCandidates.push(candidate);
      return;
    }

    if (seenSharedBoundaries.has(candidate.boundaryKey)) return;
    seenSharedBoundaries.add(candidate.boundaryKey);
    sharedCandidates.push(candidate);
  });

  // Keep every outer dimension. Longer internal dimensions get first chance at space.
  sharedCandidates.sort((a, b) => b.lengthFt - a.lengthFt);

  const allLabels: LabelDatum[] = [];
  const occupiedBoxes: LabelBox[] = [];

  outerCandidates.forEach((label) => {
    allLabels.push(label);
    occupiedBoxes.push(getLabelBox(label, labelPad * 0.5));
  });

  const internalPadding = sharedCandidates.length >= 10 ? labelPad * 1.8 : labelPad * 1.25;

  sharedCandidates.forEach((label) => {
    const box = getLabelBox(label, internalPadding);
    if (occupiedBoxes.some((existing) => boxesOverlap(existing, box))) return;

    allLabels.push(label);
    occupiedBoxes.push(box);
  });

  return { allLabels, plotPolygons };
}
