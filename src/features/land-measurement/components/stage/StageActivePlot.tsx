import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Circle, Text } from 'react-konva';
import { formatFeetInches, LABEL_OFFSET_DRAWING_LIVE, UI_CONFIG } from '@/features/land-measurement/utils/canvas';
import { getSnappedPoint, isPointInPolygon, clipLineToPolygon, GROUP_ANGLE_THRESHOLD_DEG } from '@/features/land-measurement/utils/geometry';
import { getReadableRotation } from '@/features/land-measurement/utils/component-helpers';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { ActivePlotSegments } from './ActivePlotSegments';
import { ActivePlotDiagonals } from './ActivePlotDiagonals';

const SnapHintCircle = memo(() => {
  const snapHint = useMapStore(s => s.snapHint);
  const isPlotFinished = useMapStore(s => s.isPlotFinished);
  const stageScale = useMapStore(s => s.stageScale);
  const firstPoint = useMapStore(s => s.plotPoints[0]);

  if (isPlotFinished || !snapHint || !firstPoint) return null;

  return (
    <Circle
      x={firstPoint.x}
      y={firstPoint.y}
      radius={UI_CONFIG.radius.xxlarge / stageScale}
      stroke={UI_CONFIG.colors.snapHint}
      strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale}
      dash={[6 / stageScale, 4 / stageScale]}
    />
  );
});
SnapHintCircle.displayName = 'SnapHintCircle';

const StaticLines = memo(() => {
  const { plotPoints, isPlotFinished, stageScale } = useMapStore(
    useShallow(s => ({ plotPoints: s.plotPoints, isPlotFinished: s.isPlotFinished, stageScale: s.stageScale }))
  );

  const flatPoints = useMemo(
    () => plotPoints.flatMap(p => [p.x, p.y]),
    [plotPoints]
  );

  if (flatPoints.length === 0) return null;

  const closingPoints = isPlotFinished && plotPoints.length > 0
    ? [plotPoints[0].x, plotPoints[0].y]
    : [];

  return (
    <Line
      points={[...flatPoints, ...closingPoints]}
      stroke={UI_CONFIG.colors.drawPrimary}
      strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale}
      closed={isPlotFinished}
    />
  );
});
StaticLines.displayName = 'StaticLines';

// Dashed preview from the last fixed point to the current target. This path is
// intentionally lightweight because it updates during pan/pointer movement.
const LiveDashedLine = memo(() => {
  const { plotPoints, snapHint, stageScale, stagePos, stageSize, scale, isPlotFinished, plots, pointerPos, deviceType } = useMapStore(
    useShallow(s => ({
      plotPoints: s.plotPoints,
      snapHint: s.snapHint,
      stageScale: s.stageScale,
      stagePos: s.stagePos,
      stageSize: s.stageSize,
      scale: s.scale,
      isPlotFinished: s.isPlotFinished,
      plots: s.plots,
      pointerPos: s.pointerPos,
      deviceType: s.deviceType,
    }))
  );

  const derived = useMemo(() => {
    if (isPlotFinished) return null;

    let rawCenter = {
      x: (stageSize.width / 2 - stagePos.x) / stageScale,
      y: (stageSize.height / 2 - stagePos.y) / stageScale,
    };
    if (deviceType === 'mouse' && pointerPos) {
      rawCenter = pointerPos;
    }

    const snapThreshold = 10 / stageScale;
    const center = getSnappedPoint(rawCenter, plots.map(p => p.points), snapThreshold);
    const isEdgeSnapped = center.x !== rawCenter.x || center.y !== rawCenter.y;

    if (plotPoints.length === 0) {
      return {
        isEdgeSnapped,
        centerX: center.x,
        centerY: center.y,
        lastPt: undefined,
        targetX: undefined,
        targetY: undefined,
        distPx: undefined,
        labelText: undefined,
        midX: undefined,
        midY: undefined,
        estWidth: undefined,
        estHeight: undefined,
        perpX: undefined,
        perpY: undefined,
        fontSize: undefined,
        rotation: undefined,
      };
    }

    const lastPt = plotPoints[plotPoints.length - 1];
    let targetX = snapHint ? plotPoints[0].x : center.x;
    let targetY = snapHint ? plotPoints[0].y : center.y;

    if (!snapHint && plotPoints.length > 0) {
      const firstPt = plotPoints[0];
      for (const plot of plots) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of plot.points) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }

        if (firstPt.x >= minX && firstPt.x <= maxX && firstPt.y >= minY && firstPt.y <= maxY) {
          if (isPointInPolygon(firstPt, plot.points)) {
            const clipped = clipLineToPolygon(lastPt, { x: targetX, y: targetY }, plot.points);
            targetX = clipped.x;
            targetY = clipped.y;
            break;
          }
        }
      }
    }

    const dx = targetX - lastPt.x;
    const dy = targetY - lastPt.y;
    const distPx = Math.hypot(dx, dy);
    const labelText = scale ? formatFeetInches(distPx / scale) : "0'-00\"";
    const midX = (lastPt.x + targetX) / 2;
    const midY = (lastPt.y + targetY) / 2;
    const fontSize = UI_CONFIG.fontSize.small / stageScale;
    const estWidth = labelText.length * fontSize * 0.58;
    const estHeight = fontSize * 1.08;

    const normalAX = distPx >= 1 ? -dy / distPx : 0;
    const normalAY = distPx >= 1 ? dx / distPx : 0;
    const plotCenter = plotPoints.reduce(
      (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
      { x: 0, y: 0 },
    );
    plotCenter.x /= plotPoints.length;
    plotCenter.y /= plotPoints.length;
    const towardCenterX = plotCenter.x - midX;
    const towardCenterY = plotCenter.y - midY;
    const normalFacesCenter = normalAX * towardCenterX + normalAY * towardCenterY >= 0;
    const perpX = normalFacesCenter ? normalAX : -normalAX;
    const perpY = normalFacesCenter ? normalAY : -normalAY;
    const rotation = getReadableRotation(Math.atan2(dy, dx) * 180 / Math.PI);

    return {
      lastPt,
      targetX,
      targetY,
      distPx,
      labelText,
      midX,
      midY,
      estWidth,
      estHeight,
      perpX,
      perpY,
      isEdgeSnapped,
      centerX: center.x,
      centerY: center.y,
      fontSize,
      rotation,
    };
  }, [isPlotFinished, plotPoints, stageSize, stagePos, stageScale, snapHint, scale, plots, pointerPos, deviceType]);

  if (!derived) return null;

  const {
    lastPt,
    targetX,
    targetY,
    distPx,
    midX,
    midY,
    labelText,
    fontSize,
    estWidth,
    estHeight,
    perpX,
    perpY,
    isEdgeSnapped,
    centerX,
    centerY,
    rotation,
  } = derived;

  return (
    <Group listening={false}>
      {lastPt && targetX !== undefined && targetY !== undefined && distPx !== undefined && distPx >= 1 && (
        <>
          <Line
            points={[lastPt.x, lastPt.y, targetX, targetY]}
            stroke={UI_CONFIG.colors.drawPrimary}
            strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale}
            dash={[8 / stageScale, 6 / stageScale]}
            opacity={0.8}
            listening={false}
          />
          {distPx > 20 / stageScale && (
            <Text
              x={midX! + perpX! * (LABEL_OFFSET_DRAWING_LIVE / stageScale)}
              y={midY! + perpY! * (LABEL_OFFSET_DRAWING_LIVE / stageScale)}
              offsetX={estWidth! / 2}
              offsetY={estHeight! / 2}
              rotation={rotation!}
              text={labelText!}
              fontSize={fontSize!}
              fontStyle="bold"
              fill={UI_CONFIG.colors.drawPrimary}
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={2.2 / stageScale}
              fillAfterStrokeEnabled
              opacity={0.95}
              listening={false}
            />
          )}
        </>
      )}
      {isEdgeSnapped && !snapHint && (
        <Circle
          x={centerX}
          y={centerY}
          radius={UI_CONFIG.radius.xlarge / stageScale}
          stroke={UI_CONFIG.colors.drawPrimary}
          strokeWidth={UI_CONFIG.strokeWidth.xthick / stageScale}
          dash={[5 / stageScale, 4 / stageScale]}
          listening={false}
        />
      )}
    </Group>
  );
});
LiveDashedLine.displayName = 'LiveDashedLine';

const PlotDots = memo(() => {
  const { plotPoints, isPlotFinished, stageScale } = useMapStore(
    useShallow(s => ({ plotPoints: s.plotPoints, isPlotFinished: s.isPlotFinished, stageScale: s.stageScale }))
  );
  const handlePointDragEnd = useMapStore(s => s.handlePointDragEnd);

  const dotData = useMemo(() => {
    return plotPoints.map((point, i) => {
      let isCorner = true;

      const getAngle = (from: { x: number; y: number }, to: { x: number; y: number }) =>
        Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

      const checkDeflection = (prev: { x: number; y: number }, curr: { x: number; y: number }, next: { x: number; y: number }) => {
        let d = Math.abs(getAngle(prev, curr) - getAngle(curr, next));
        if (d > 180) d = 360 - d;
        return d > GROUP_ANGLE_THRESHOLD_DEG;
      };

      if (i > 0 && i < plotPoints.length - 1) {
        isCorner = checkDeflection(plotPoints[i - 1], point, plotPoints[i + 1]);
      }

      if (isPlotFinished && plotPoints.length > 3) {
        if (i === 0) {
          isCorner = checkDeflection(plotPoints[plotPoints.length - 1], point, plotPoints[1]);
        }
        if (i === plotPoints.length - 1) {
          isCorner = checkDeflection(plotPoints[i - 1], point, plotPoints[0]);
        }
      }

      return { point, i, isCorner };
    });
  }, [plotPoints, isPlotFinished]);

  if (plotPoints.length === 0) return null;

  return (
    <>
      {dotData.map(({ point, i, isCorner }) => {
        if (!isCorner && !isPlotFinished) return null;
        const opacity = !isCorner && isPlotFinished ? 0.3 : 1;
        const radius = !isCorner && isPlotFinished ? 3 / stageScale : 5 / stageScale;
        return (
          <Circle
            key={i}
            x={point.x}
            y={point.y}
            radius={radius}
            fill="#3182CE"
            stroke="white"
            strokeWidth={1.5 / stageScale}
            hitStrokeWidth={20 / stageScale}
            opacity={opacity}
            draggable={isPlotFinished}
            onDragEnd={(e) => handlePointDragEnd(e, i)}
          />
        );
      })}
    </>
  );
});
PlotDots.displayName = 'PlotDots';

export const StageActivePlot = memo(() => {
  const mode = useMapStore(s => s.mode);

  if (mode !== 'drawing_plot') return null;

  return (
    <>
      <SnapHintCircle />
      <StaticLines />
      <LiveDashedLine />
      <ActivePlotDiagonals />
      <ActivePlotSegments />
      <PlotDots />
    </>
  );
});
StageActivePlot.displayName = 'StageActivePlot';
