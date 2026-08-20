import { useMemo } from 'react';
import { Group, Text } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { UI_CONFIG, formatFeetInches } from '@/features/land-measurement/utils/canvas';
import {
  getVisualCenter,
  groupPolygonSegments,
  isPointInPolygon,
} from '@/features/land-measurement/utils/geometry';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import type { Point } from '@/features/land-measurement/types/map';
import type { PlotsLabelData } from '@/features/land-measurement/types/stage';

interface PlotEdgeLabelsProps {
  allLabels: PlotsLabelData[];
  stageScale: number;
}

type LabelGeometry = {
  plotId: string;
  color: string;
  i: number;
  midX: number;
  midY: number;
  rotation: number;
  inwardX: number;
  inwardY: number;
  labelText: string;
  totalDistPx: number;
};

type ScreenLabel = LabelGeometry & {
  x: number;
  y: number;
  fontSize: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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

const quantizeScale = (stageScale: number) => {
  const safeScale = Math.max(stageScale, 0.01);
  // Roughly 3% zoom buckets. This avoids recalculating every label on every
  // pinch/wheel frame while still making the size change feel continuous.
  return Math.exp(Math.round(Math.log(safeScale) * 32) / 32);
};

export const PlotEdgeLabels: React.FC<PlotEdgeLabelsProps> = ({ stageScale }) => {
  const { plots, scale } = useMapStore(
    useShallow((state) => ({
      plots: state.plots,
      scale: state.scale,
    })),
  );

  // Heavy polygon/grouping work depends only on the plots and calibration.
  // It no longer runs on every zoom/pan frame.
  const geometry = useMemo<LabelGeometry[]>(() => {
    if (!scale) return [];

    const result: LabelGeometry[] = [];

    plots.forEach((plot) => {
      const groups = groupPolygonSegments(plot.points);

      groups.forEach((segments, groupIndex) => {
        if (segments.length === 0) return;

        const { midX, midY, midDx, midDy, totalDistPx } = getPathMidpoint(segments);
        if (totalDistPx <= 0) return;

        const totalLengthFt = segments.reduce(
          (sum, segment) => sum + (plot.results.lengths[segment.i] ?? segment.distPx / scale),
          0,
        );
        const midpoint = { x: midX, y: midY };
        const inward = getInwardNormal(
          midpoint,
          midDx,
          midDy,
          plot.points,
          Math.max(1, totalDistPx * 0.03),
        );

        result.push({
          plotId: plot.id,
          color: plot.color || '#0F766E',
          i: groupIndex,
          midX,
          midY,
          rotation: getReadableRotation(Math.atan2(midDy, midDx) * (180 / Math.PI)),
          inwardX: inward.x,
          inwardY: inward.y,
          labelText: formatFeetInches(totalLengthFt),
          totalDistPx,
        });
      });
    });

    return result;
  }, [plots, scale]);

  const layoutScale = quantizeScale(stageScale);

  // Cheap screen-space sizing only. Very short on-screen edges are hidden until
  // the user zooms in; rendering unreadable 6px labels only adds clutter and lag.
  const labels = useMemo<ScreenLabel[]>(() => {
    if (layoutScale <= 0) return [];

    const result: ScreenLabel[] = [];

    geometry.forEach((item) => {
      const edgeScreenPx = item.totalDistPx * layoutScale;
      if (edgeScreenPx < 34) return;

      let fontPx = clamp(edgeScreenPx * 0.13, 7.5, UI_CONFIG.fontSize.small);
      let widthPx = item.labelText.length * fontPx * 0.58;
      const maxWidthPx = edgeScreenPx * 0.74;

      if (widthPx > maxWidthPx) {
        fontPx = Math.max(6.75, fontPx * (maxWidthPx / widthPx));
        widthPx = item.labelText.length * fontPx * 0.58;
      }

      const heightPx = fontPx * 1.08;
      const insetPx = Math.max(7, fontPx * 0.95);
      const x = item.midX + item.inwardX * (insetPx / layoutScale);
      const y = item.midY + item.inwardY * (insetPx / layoutScale);

      result.push({
        ...item,
        x,
        y,
        fontSize: fontPx / layoutScale,
        width: widthPx / layoutScale,
        height: heightPx / layoutScale,
      });
    });

    return result;
  }, [geometry, layoutScale]);

  return (
    <>
      {labels.map((label) => (
        <Group key={`plot-${label.plotId}-label-group-${label.i}`} listening={false}>
          <Text
            x={label.x}
            y={label.y}
            offsetX={label.width / 2}
            offsetY={label.height / 2}
            rotation={label.rotation}
            text={label.labelText}
            fontSize={label.fontSize}
            fontStyle="bold"
            fill={label.color}
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={2.2 / layoutScale}
            fillAfterStrokeEnabled
            listening={false}
          />
        </Group>
      ))}
    </>
  );
};
