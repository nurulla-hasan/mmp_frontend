import { groupPolygonSegments } from '@/features/map-tool/utils/geometry';
import { getReadableRotation } from '@/features/map-tool/utils/component-helpers';
import { formatFeetInches, MIN_EDGE_LABEL_FT } from '@/features/map-tool/utils/canvas';
import type { PlotRecord } from '@/features/map-tool/types/map';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Label computation
// ──────────────────────────────────────────────

/**
 * Compute edge label data for all plots in a print layout.
 * Returns sorted plot polygons and an array of non-overlapping label data.
 */
export function computePrintLabels(
  plots: PlotRecord[],
  config: PrintLabelConfig,
): { allLabels: LabelDatum[]; plotPolygons: PlotPolygonInfo[] } {
  const { baseScale, fontSize, labelPad, labelOffset } = config;
  const drawnLabelCenters: { x: number; y: number }[] = [];
  const allLabels: LabelDatum[] = [];

  const plotPolygons = plots
    .map((plot) => ({
      id: plot.id,
      pointsStr: plot.points.map((p) => `${p.x},${p.y}`).join(' '),
      plot,
      area: plot.results?.shotok ?? 0,
    }))
    .sort((a, b) => a.area - b.area);

  for (const { plot } of plotPolygons) {
    const rawGroups = groupPolygonSegments(plot.points);
    const groups = rawGroups.map((rawGroup) => {
      const segments = rawGroup.map((seg) => ({
        ...seg,
        lengthFt: plot.results.lengths[seg.i],
      }));
      return {
        segments,
        totalDistPx: segments.reduce((sum, s) => sum + s.distPx, 0),
        totalLengthFt: segments.reduce((sum, s) => sum + s.lengthFt, 0),
      };
    });

    // Winding order (signed area via shoelace)
    let signedArea = 0;
    for (let i = 0; i < plot.points.length; i++) {
      const p1 = plot.points[i];
      const p2 = plot.points[(i + 1) % plot.points.length];
      signedArea += (p2.x - p1.x) * (p2.y + p1.y);
    }
    const isClockwise = signedArea < 0;

    for (const [groupIdx, group] of groups.entries()) {
      if (group.totalLengthFt < MIN_EDGE_LABEL_FT) continue;

      const labelText = formatFeetInches(group.totalLengthFt);
      // Use first→last point of the entire group for true angle & normal
      const firstPt = group.segments[0].point;
      const lastPt = group.segments[group.segments.length - 1].nextPoint;
      
      // Find the physical midpoint ALONG the boundary path (not the chord)
      const totalDistPx = group.segments.reduce((s, seg) => s + seg.distPx, 0);
      const halfDist = totalDistPx / 2;
      let walked = 0;
      let midX = firstPt.x;
      let midY = firstPt.y;
      let midDx = lastPt.x - firstPt.x;
      let midDy = lastPt.y - firstPt.y;

      for (const seg of group.segments) {
        const d = seg.distPx || 1e-5; // avoid div by 0
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

      const dx = midDx;
      const dy = midDy;
      const dist = Math.hypot(dx, dy) > 0.001 ? Math.hypot(dx, dy) : 1;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const rotation = getReadableRotation(angle);

      // Outward normal — always points away from polygon interior
      const perpX = isClockwise ?  dy / dist : -dy / dist;
      const perpY = isClockwise ? -dx / dist :  dx / dist;

      const lx = midX + perpX * labelOffset;
      const ly = midY + perpY * labelOffset;
      const labelWidth = labelText.length * fontSize * 0.62 + labelPad * 2;
      const labelHeight = fontSize + labelPad * 2;

      // Discard if two groups share the same center (degenerate)
      const isDuplicate = drawnLabelCenters.some(
        (c) => Math.hypot(c.x - midX, c.y - midY) < baseScale * 0.001,
      );
      if (isDuplicate) continue;

      // Overlap check against already-placed labels
      const overlapsExistingLabel = allLabels.some((existing) => {
        const angleDiff = Math.abs(rotation - existing.rotation);
        const normalizedAngleDiff = Math.min(angleDiff, 180 - angleDiff);
        if (normalizedAngleDiff > 12) return false;

        const radians = rotation * (Math.PI / 180);
        const dx = lx - existing.lx;
        const dy = ly - existing.ly;
        const along = Math.abs(dx * Math.cos(radians) + dy * Math.sin(radians));
        const perpendicular = Math.abs(-dx * Math.sin(radians) + dy * Math.cos(radians));

        return (
          along < (labelWidth + existing.width) / 2 + labelPad &&
          perpendicular < (labelHeight + existing.height) / 2 + labelPad
        );
      });
      if (overlapsExistingLabel) continue;

      drawnLabelCenters.push({ x: midX, y: midY });

      allLabels.push({
        plotId: plot.id,
        i: groupIdx,
        lx,
        ly,
        rotation,
        labelText,
        width: labelWidth,
        height: labelHeight,
      });
    }
  }

  return { allLabels, plotPolygons };
}
