import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Circle, Label as KonvaLabel, Tag, Text } from 'react-konva';
import { formatFeetInches, LABEL_OFFSET_DRAWING_LIVE, UI_CONFIG } from '@/features/map-tool/utils/canvas';
import { getSnappedPoint, isPointInPolygon, clipLineToPolygon, GROUP_ANGLE_THRESHOLD_DEG } from '@/features/map-tool/utils/geometry';
import { getReadableRotation } from '@/features/map-tool/utils/component-helpers';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { ActivePlotSegments } from './ActivePlotSegments';
import { ActivePlotDiagonals } from './ActivePlotDiagonals';

// ----- Sub-component: snap hint circle -----
// Re-renders only when: snapHint, isPlotFinished, plotPoints[0], stageScale change
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

// ----- Sub-component: the static drawn polyline -----
// Re-renders only when: plotPoints, isPlotFinished, stageScale change — NOT stagePos
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

// ----- Sub-component: dashed preview line from last point to crosshair -----
// Re-renders on stagePos/stageSize changes (expected — this IS position-dependent)
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
        isEdgeSnapped, centerX: center.x, centerY: center.y,
        lastPt: undefined, targetX: undefined, targetY: undefined, distPx: undefined,
        labelText: undefined, midX: undefined, midY: undefined, estWidth: undefined, estHeight: undefined,
        perpX: undefined, perpY: undefined, lineLen: undefined, labelDist: undefined,
        fontSize: undefined, padding: undefined
      };
    }
    
    const lastPt = plotPoints[plotPoints.length - 1];
    let targetX = snapHint ? plotPoints[0].x : center.x;
    let targetY = snapHint ? plotPoints[0].y : center.y;

    // Clip line if starting inside an existing plot
    if (!snapHint && plotPoints.length > 0) {
      const firstPt = plotPoints[0];
      for (const plot of plots) {
        // Fast bounding box pre-check
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
    
    // We still return everything even if distPx < 1, but we might not render the line
    const labelText = scale ? formatFeetInches(distPx / scale) : "0'-00\"";
    const midX = (lastPt.x + targetX) / 2;
    const midY = (lastPt.y + targetY) / 2;
    const fontSize = UI_CONFIG.fontSize.medium / stageScale;
    const padding = UI_CONFIG.padding.small / stageScale;
    const estWidth = (labelText.length * fontSize * 0.6) + padding * 2;
    const estHeight = fontSize + padding * 2;
    const perpX = distPx >= 1 ? -dy / distPx : 0;
    const perpY = distPx >= 1 ? dx / distPx : 0;
    const lineLen = 40 / stageScale;
    const labelDist = 40 / stageScale;
    const rotation = getReadableRotation(Math.atan2(dy, dx) * 180 / Math.PI);

    return {
      lastPt, targetX, targetY, distPx,
      labelText, midX, midY, estWidth, estHeight,
      perpX, perpY, lineLen, labelDist,
      isEdgeSnapped, centerX: center.x, centerY: center.y,
      fontSize, padding, rotation
    };
  }, [isPlotFinished, plotPoints, stageSize, stagePos, stageScale, snapHint, scale, plots, pointerPos, deviceType]);

  if (!derived) return null;

  const { lastPt, targetX, targetY, distPx, midX, midY,
    labelText, fontSize, padding, estWidth, estHeight,
    isEdgeSnapped, centerX, centerY, rotation } = derived;

  return (
    <Group>
      {lastPt && targetX !== undefined && targetY !== undefined && distPx !== undefined && distPx >= 1 && (
        <>
          <Line
            points={[lastPt.x, lastPt.y, targetX, targetY]}
            stroke={UI_CONFIG.colors.drawPrimary}
            strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale!}
            dash={[8 / stageScale!, 6 / stageScale!]}
            opacity={0.8}
          />
          {distPx > 20 / stageScale! && (
            <>
              <KonvaLabel
                x={midX!}
                y={midY!}
                offsetX={estWidth! / 2}
                offsetY={estHeight! / 2 + LABEL_OFFSET_DRAWING_LIVE / stageScale!}
                rotation={rotation!}
                opacity={0.9}
              >
                <Tag fill={UI_CONFIG.colors.textWhite} stroke={UI_CONFIG.colors.drawPrimary} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale!} cornerRadius={UI_CONFIG.radius.small / stageScale!} />
                <Text text={labelText!} fontSize={fontSize!} fill={UI_CONFIG.colors.drawPrimary} padding={padding!} fontStyle="bold" />
              </KonvaLabel>
            </>
          )}
        </>
      )}
      {isEdgeSnapped && !snapHint && (
        <Circle
          x={centerX}
          y={centerY}
          radius={UI_CONFIG.radius.xlarge / stageScale!}
          stroke={UI_CONFIG.colors.drawPrimary}
          strokeWidth={UI_CONFIG.strokeWidth.xthick / stageScale!}
          dash={[5 / stageScale!, 4 / stageScale!]}
        />
      )}
    </Group>
  );
});
LiveDashedLine.displayName = 'LiveDashedLine';

// Segment labels extracted → ./ActivePlotSegments.tsx

// Diagonals extracted → ./ActivePlotDiagonals.tsx

// ----- Sub-component: corner dots -----
// Re-renders only when: plotPoints, isPlotFinished, stageScale change
const PlotDots = memo(() => {
  const { plotPoints, isPlotFinished, stageScale } = useMapStore(
    useShallow(s => ({ plotPoints: s.plotPoints, isPlotFinished: s.isPlotFinished, stageScale: s.stageScale }))
  );
  const handlePointDragEnd = useMapStore(s => s.handlePointDragEnd);

  // Memoize corner detection result
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

// ----- Root component -----
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
