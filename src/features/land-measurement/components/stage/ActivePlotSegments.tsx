import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Label as KonvaLabel, Tag, Text } from 'react-konva';
import { formatFeetInches, LABEL_OFFSET_DRAWING_SEGMENT, UI_CONFIG } from '@/features/land-measurement/utils/canvas';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import { GROUP_ANGLE_THRESHOLD_DEG } from '@/features/land-measurement/utils/geometry';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import type { PlotSegment, PlotSegmentGroup, ActivePlotLabelData } from '@/features/land-measurement/types/stage';

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

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

    // Build segments
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

    // Group co-linear segments
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

    // Compute winding once for all groups
    let signedArea = 0;
    for (let i = 0; i < plotPoints.length; i++) {
      const p1 = plotPoints[i];
      const p2 = plotPoints[(i + 1) % plotPoints.length];
      signedArea += (p2.x - p1.x) * (p2.y + p1.y);
    }
    const isClockwise = signedArea < 0;

    return groups
      .map((group, groupIdx): ActivePlotLabelData | null => {
        const totalDistPx = group.segments.reduce((sum, seg) => sum + seg.distPx, 0);
        if (totalDistPx < 15 / stageScale) return null;

        const labelText = formatFeetInches(group.totalLengthFt);
        // Use first→last point of the entire group for true angle & normal
        const firstPt = group.segments[0].point;
        const lastPt = group.segments[group.segments.length - 1].nextPoint;
        
        // Find the physical midpoint ALONG the boundary path (not the chord)
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
        const totalDist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const fontSize = UI_CONFIG.fontSize.medium / stageScale;
        const padding = UI_CONFIG.padding.small / stageScale;
        const estWidth = labelText.length * fontSize * 0.6 + padding * 2;
        const estHeight = fontSize + padding * 2;

        let perpX: number;
        let perpY: number;
        if (plotPoints.length >= 3) {
          if (isClockwise) {
            perpX = dy / totalDist;
            perpY = -dx / totalDist;
          } else {
            perpX = -dy / totalDist;
            perpY = dx / totalDist;
          }
        } else {
          perpX = -dy / totalDist;
          perpY = dx / totalDist;
        }

        const staggeredOffset = [75, 100, 125][groupIdx % 3];
        const lineLen = staggeredOffset / stageScale;
        const lineEndX = midX + perpX * lineLen;
        const lineEndY = midY + perpY * lineLen;

        return {
          i: groupIdx,
          midX,
          midY,
          rotation: getReadableRotation(angle),
          lineEndX,
          lineEndY,
          labelDist: lineLen,
          perpX,
          perpY,
          estWidth,
          estHeight,
          labelText,
          fontSize,
          padding,
        };
      })
      .filter((d): d is ActivePlotLabelData => d !== null);
  }, [plotPoints, isPlotFinished, stageScale, scale]);

  if (labelData.length === 0) return null;

  return (
    <>
      {labelData.map((d) => (
        <Group key={`length-label-group-${d.i}`}>
          <KonvaLabel
            x={d.midX + d.perpX * (LABEL_OFFSET_DRAWING_SEGMENT / stageScale)}
            y={d.midY + d.perpY * (LABEL_OFFSET_DRAWING_SEGMENT / stageScale)}
            offsetX={d.estWidth / 2}
            offsetY={d.estHeight / 2}
            rotation={d.rotation}
            opacity={0.95}
          >
            <Tag
              fill={UI_CONFIG.colors.drawBg}
              stroke={UI_CONFIG.colors.drawLight}
              strokeWidth={UI_CONFIG.strokeWidth.medium / stageScale}
              cornerRadius={UI_CONFIG.radius.small / stageScale}
            />
            <Text
              text={d.labelText}
              fontSize={d.fontSize}
              fill={UI_CONFIG.colors.drawPrimary}
              padding={d.padding}
              fontStyle="bold"
            />
          </KonvaLabel>
        </Group>
      ))}
    </>
  );
});
ActivePlotSegments.displayName = 'ActivePlotSegments';

