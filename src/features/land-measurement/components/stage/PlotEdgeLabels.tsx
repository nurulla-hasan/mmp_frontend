import { useMemo } from 'react';
import { Group, Label as KonvaLabel, Tag, Text } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import {
  UI_CONFIG,
  formatFeetInches,
} from '@/features/land-measurement/utils/canvas';
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getPathMidpoint = (segments: ReturnType<typeof groupPolygonSegments>[number]) => {
  const totalDistPx = segments.reduce((sum, seg) => sum + seg.distPx, 0);
  const halfDist = totalDistPx / 2;
  let walked = 0;
  let midX = segments[0]?.point.x ?? 0;
  let midY = segments[0]?.point.y ?? 0;
  let midDx = segments[0]?.dx ?? 1;
  let midDy = segments[0]?.dy ?? 0;

  for (const seg of segments) {
    const distance = seg.distPx || 1e-5;
    if (walked + distance >= halfDist) {
      const ratio = (halfDist - walked) / distance;
      midX = seg.point.x + ratio * seg.dx;
      midY = seg.point.y + ratio * seg.dy;
      midDx = seg.dx;
      midDy = seg.dy;
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

export const PlotEdgeLabels: React.FC<PlotEdgeLabelsProps> = ({ stageScale }) => {
  const { plots, scale } = useMapStore(
    useShallow((state) => ({
      plots: state.plots,
      scale: state.scale,
    })),
  );

  const labels = useMemo(() => {
    if (!scale || stageScale <= 0) return [];

    const result: PlotsLabelData[] = [];

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
        const labelText = formatFeetInches(totalLengthFt);
        const rotation = getReadableRotation(Math.atan2(midDy, midDx) * (180 / Math.PI));
        const edgeScreenPx = totalDistPx * stageScale;

        // Dynamic screen size: small blocks get smaller text, large blocks get fuller text.
        let fontPx = clamp(edgeScreenPx * 0.14, 7, UI_CONFIG.fontSize.small);
        let paddingPx = clamp(fontPx * 0.22, 1.5, UI_CONFIG.padding.small);
        let estimatedWidthPx = labelText.length * fontPx * 0.58 + paddingPx * 2;
        const maxWidthPx = Math.max(24, edgeScreenPx * 0.82);

        if (estimatedWidthPx > maxWidthPx) {
          const fitRatio = maxWidthPx / estimatedWidthPx;
          fontPx = Math.max(6.25, fontPx * fitRatio);
          paddingPx = clamp(fontPx * 0.2, 1.25, UI_CONFIG.padding.small);
          estimatedWidthPx = labelText.length * fontPx * 0.58 + paddingPx * 2;
        }

        const midpoint = { x: midX, y: midY };
        const inward = getInwardNormal(
          midpoint,
          midDx,
          midDy,
          plot.points,
          Math.max(6 / stageScale, totalDistPx * 0.03),
        );

        let chosen: PlotsLabelData | null = null;

        for (let attempt = 0; attempt < 5; attempt += 1) {
          const shrink = Math.pow(0.9, attempt);
          const attemptFontPx = Math.max(6, fontPx * shrink);
          const attemptPaddingPx = Math.max(1, paddingPx * shrink);
          const widthPx = labelText.length * attemptFontPx * 0.58 + attemptPaddingPx * 2;
          const heightPx = attemptFontPx + attemptPaddingPx * 2;
          const insetPx = Math.max(7, heightPx * (0.72 + attempt * 0.12));
          const center = {
            x: midX + inward.x * (insetPx / stageScale),
            y: midY + inward.y * (insetPx / stageScale),
          };
          const width = widthPx / stageScale;
          const height = heightPx / stageScale;

          if (!labelFitsInside(center, rotation, width, height, plot.points) && attempt < 4) {
            continue;
          }

          chosen = {
            plotId: plot.id,
            color: plot.color || '#0F766E',
            i: groupIndex,
            midX,
            midY,
            rotation,
            idealX: center.x,
            idealY: center.y,
            x: center.x,
            y: center.y,
            labelDist: insetPx / stageScale,
            perpX: inward.x,
            perpY: inward.y,
            estWidth: width,
            estHeight: height,
            labelText,
            fontSize: attemptFontPx / stageScale,
            padding: attemptPaddingPx / stageScale,
          };
          break;
        }

        if (chosen) result.push(chosen);
      });
    });

    return result;
  }, [plots, scale, stageScale]);

  return (
    <>
      {labels.map((label) => (
        <Group key={`plot-${label.plotId}-label-group-${label.i}`}>
          <KonvaLabel
            x={label.x}
            y={label.y}
            offsetX={label.estWidth / 2}
            offsetY={label.estHeight / 2}
            rotation={label.rotation}
            opacity={1}
          >
            <Tag
              fill="white"
              stroke={label.color}
              strokeWidth={1.1 / stageScale}
              cornerRadius={3 / stageScale}
              opacity={0.94}
            />
            <Text
              text={label.labelText}
              fontSize={label.fontSize}
              fill={label.color}
              padding={label.padding}
              fontStyle="bold"
            />
          </KonvaLabel>
        </Group>
      ))}
    </>
  );
};
