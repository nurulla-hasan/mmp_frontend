import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Text } from 'react-konva';
import { formatFeetInches, UI_CONFIG } from '@/features/land-measurement/utils/canvas';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import { GROUP_ANGLE_THRESHOLD_DEG } from '@/features/land-measurement/utils/geometry';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import type { PlotSegment, PlotSegmentGroup, ActivePlotLabelData } from '@/features/land-measurement/types/stage';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const ActivePlotSegments = memo(() => {
  const { plotPoints, isPlotFinished, stageScale, scale } = useMapStore(
    useShallow((s) => ({
      plotPoints: s.plotPoints,
      isPlotFinished: s.isPlotFinished,
      stageScale: s.stageScale,
      scale: s.scale,
    })),
  );

  const labelData = useMemo((): ActivePlotLabelData[] => {
    if (plotPoints.length < 2) return [];

    const segments: PlotSegment[] = plotPoints
      .map((point, i) => {
        if (i === plotPoints.length - 1 && !isPlotFinished) return null;
        const nextPoint = plotPoints[(i + 1) % plotPoints.length];
        if (!nextPoint) return null;
        const dx = nextPoint.x - point.x;
        const dy = nextPoint.y - point.y;
        const distPx = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const lengthFt = scale ? distPx / scale : 0;
        return { i, point, nextPoint, dx, dy, distPx, angle, lengthFt };
      })
      .filter((d): d is PlotSegment => d !== null);

    const groups: PlotSegmentGroup[] = [];
    let currentGroup: PlotSegmentGroup = { segments: [], totalLengthFt: 0 };
    segments.forEach((seg) => {
      if (currentGroup.segments.length === 0) {
        currentGroup.segments.push(seg);
        currentGroup.totalLengthFt += seg.lengthFt;
      } else {
        const prevSeg = currentGroup.segments[currentGroup.segments.length - 1];
        let deflection = Math.abs(seg.angle - prevSeg.angle);
        if (deflection > 180) deflection = 360 - deflection;
        if (deflection <= GROUP_ANGLE_THRESHOLD_DEG) {
          currentGroup.segments.push(seg);
          currentGroup.totalLengthFt += seg.lengthFt;
        } else {
          groups.push(currentGroup);
          currentGroup = { segments: [seg], totalLengthFt: seg.lengthFt };
        }
      }
    });
    if (currentGroup.segments.length > 0) groups.push(currentGroup);

    // During drawing the polygon is open, so use the average of committed
    // points as a stable hint for which side of each completed edge is inward.
    const center = plotPoints.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 },
    );
    center.x /= plotPoints.length;
    center.y /= plotPoints.length;

    return groups
      .map((group, groupIdx): ActivePlotLabelData | null => {
        const totalDistPx = group.segments.reduce((sum, seg) => sum + seg.distPx, 0);
        const edgeScreenPx = totalDistPx * stageScale;
        if (edgeScreenPx < 34) return null;

        const labelText = formatFeetInches(group.totalLengthFt);
        const firstPt = group.segments[0].point;
        const lastPt = group.segments[group.segments.length - 1].nextPoint;

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

        const dx = midDx;
        const dy = midDy;
        const totalDist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        let fontPx = clamp(edgeScreenPx * 0.13, 7.5, UI_CONFIG.fontSize.small);
        let widthPx = labelText.length * fontPx * 0.58;
        const maxWidthPx = edgeScreenPx * 0.74;
        if (widthPx > maxWidthPx) {
          fontPx = Math.max(6.75, fontPx * (maxWidthPx / widthPx));
          widthPx = labelText.length * fontPx * 0.58;
        }

        const fontSize = fontPx / stageScale;
        const estWidth = widthPx / stageScale;
        const estHeight = (fontPx * 1.08) / stageScale;

        const normalAX = -dy / totalDist;
        const normalAY = dx / totalDist;
        const towardCenterX = center.x - midX;
        const towardCenterY = center.y - midY;
        const normalFacesCenter = normalAX * towardCenterX + normalAY * towardCenterY >= 0;
        const perpX = normalFacesCenter ? normalAX : -normalAX;
        const perpY = normalFacesCenter ? normalAY : -normalAY;

        const insetPx = Math.max(7, fontPx * 0.95);
        const labelDist = insetPx / stageScale;

        return {
          i: groupIdx,
          midX,
          midY,
          rotation: getReadableRotation(angle),
          lineEndX: midX + perpX * labelDist,
          lineEndY: midY + perpY * labelDist,
          labelDist,
          perpX,
          perpY,
          estWidth,
          estHeight,
          labelText,
          fontSize,
          padding: 0,
        };
      })
      .filter((d): d is ActivePlotLabelData => d !== null);
  }, [plotPoints, isPlotFinished, stageScale, scale]);

  if (labelData.length === 0) return null;

  return (
    <>
      {labelData.map((d) => (
        <Text
          key={`length-label-${d.i}`}
          x={d.midX + d.perpX * d.labelDist}
          y={d.midY + d.perpY * d.labelDist}
          offsetX={d.estWidth / 2}
          offsetY={d.estHeight / 2}
          rotation={d.rotation}
          text={d.labelText}
          fontSize={d.fontSize}
          fontStyle="bold"
          fill={UI_CONFIG.colors.drawPrimary}
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={2.2 / stageScale}
          fillAfterStrokeEnabled
          opacity={0.95}
          listening={false}
        />
      ))}
    </>
  );
});
ActivePlotSegments.displayName = 'ActivePlotSegments';
