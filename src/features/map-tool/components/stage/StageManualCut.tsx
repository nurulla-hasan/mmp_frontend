import React, { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Circle, Label as KonvaLabel, Tag, Text, Shape } from 'react-konva';
import type Konva from 'konva';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { AREA_LABEL_FONT_SCALE, AREA_LABEL_PADDING_FACTOR, AREA_LABEL_RADIUS_FACTOR, MANUAL_DIVIDE_CORNER_SNAP_PX, UI_CONFIG } from '@/features/map-tool/utils/canvas';
import { calculatePolygonData } from '@/features/map-tool/utils/calculations';
import { getLogicalCorners, getSnappedPoint, getVisualCenter } from '@/features/map-tool/utils/geometry';
import { splitPolygonByPolyline } from '@/features/map-tool/utils/polygonDivision';
import type { Point } from '@/features/map-tool/types/map';

const getCornerSnapPoint = (point: Point, polygon: Point[], thresholdPx: number): Point | null => {
  let closest: Point | null = null;
  let closestDistance = thresholdPx;

  for (const vertex of polygon) {
    const distance = Math.hypot(point.x - vertex.x, point.y - vertex.y);
    if (distance <= closestDistance) {
      closestDistance = distance;
      closest = vertex;
    }
  }

  return closest ? { x: closest.x, y: closest.y } : null;
};



export const StageManualCut = React.memo(() => {
  const { mode, manualDividePlotId, manualCutLine, setManualCutLine, plots, scale, stageScale } = useMapStore(
    useShallow(s => ({
      mode: s.mode,
      manualDividePlotId: s.manualDividePlotId,
      manualCutLine: s.manualCutLine,
      setManualCutLine: s.setManualCutLine,
      plots: s.plots,
      scale: s.scale,
      stageScale: s.stageScale,
    }))
  );

  const plot = plots.find(p => p.id === manualDividePlotId);

  // Calculate live splits unconditionally to obey rules of hooks
  const splits = useMemo(() => {
    if (!plot || !manualCutLine || manualCutLine.length < 2 || !scale) return null;
    
    const polySplits = splitPolygonByPolyline(plot.points, manualCutLine);
    if (!polySplits) return null;
    
    const { poly1: splitA, poly2: splitB } = polySplits;

    if (splitA.length < 3 || splitB.length < 3) return null;

    const resA = calculatePolygonData(splitA, scale);
    const resB = calculatePolygonData(splitB, scale);

    if (!resA || !resB) return null;

    return { splitA, splitB, resA, resB, centerA: getVisualCenter(splitA), centerB: getVisualCenter(splitB) };
  }, [plot, manualCutLine, scale]);

  if (mode !== 'manual_divide_plot' || !manualDividePlotId || !manualCutLine || manualCutLine.length < 2 || !plot || !scale) return null;
  
  const linePoints = manualCutLine.flatMap(p => [p.x, p.y]);
  const areaFontSize = (UI_CONFIG.fontSize.small * AREA_LABEL_FONT_SCALE) / stageScale;
  const areaPadding = (UI_CONFIG.padding.small * AREA_LABEL_PADDING_FACTOR) / stageScale;
  const areaRadius = (UI_CONFIG.radius.small * AREA_LABEL_RADIUS_FACTOR) / stageScale;


  // During drag: snap to edge only (no corner pull), so preview stays smooth
  const handleDragMove = (idx: number) => (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const newLines = [...manualCutLine];
    const rawPoint = { x: e.target.x(), y: e.target.y() };
    const isBoundaryAnchor = idx === 0 || idx === manualCutLine.length - 1;
    const snapThreshold = isBoundaryAnchor ? Number.POSITIVE_INFINITY : 14 / stageScale;
    newLines[idx] = getSnappedPoint(rawPoint, [plot.points], snapThreshold);
    setManualCutLine(newLines);
  };

  // On release: also apply corner snap so the point locks exactly to a corner vertex
  const handleDragEnd = (idx: number) => (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const newLines = [...manualCutLine];
    const rawPoint = { x: e.target.x(), y: e.target.y() };
    const isBoundaryAnchor = idx === 0 || idx === manualCutLine.length - 1;
    const snapThreshold = isBoundaryAnchor ? Number.POSITIVE_INFINITY : 14 / stageScale;
    const cornerSnap = isBoundaryAnchor
      ? getCornerSnapPoint(rawPoint, getLogicalCorners(plot.points), MANUAL_DIVIDE_CORNER_SNAP_PX / stageScale)
      : null;
    newLines[idx] = cornerSnap || getSnappedPoint(rawPoint, [plot.points], snapThreshold);
    setManualCutLine(newLines);
  };

  const drawPolygon = (context: Konva.Context, shape: Konva.Shape, points: {x: number, y: number}[]) => {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
    context.fillStrokeShape(shape);
  };

  return (
    <Group>
      {/* Live Preview Polygons */}
      {splits && (
        <>
          <Shape
            sceneFunc={(context, shape) => drawPolygon(context, shape, splits.splitA)}
            fill={plot.color}
            opacity={0.3}
            listening={false}
          />
          <Shape
            sceneFunc={(context, shape) => drawPolygon(context, shape, splits.splitB)}
            fill="#0284C7"
            opacity={0.3}
            listening={false}
          />

          {/* Floating Area Labels */}
          <KonvaLabel x={splits.centerA.x} y={splits.centerA.y} opacity={1}>
            <Tag fill={plot.color || '#0F766E'} cornerRadius={areaRadius} shadowColor="rgba(0,0,0,0.25)" shadowBlur={2/stageScale} shadowOffsetX={1/stageScale} shadowOffsetY={1/stageScale} />
            <Text text={`${splits.resA.shotok.toFixed(2)} শতক`} fill="white" padding={areaPadding} fontSize={areaFontSize} fontStyle="bold" />
          </KonvaLabel>
          <KonvaLabel x={splits.centerB.x} y={splits.centerB.y} opacity={1}>
            <Tag fill="#0284C7" cornerRadius={areaRadius} shadowColor="rgba(0,0,0,0.25)" shadowBlur={2/stageScale} shadowOffsetX={1/stageScale} shadowOffsetY={1/stageScale} />
            <Text text={`${splits.resB.shotok.toFixed(2)} শতক`} fill="white" padding={areaPadding} fontSize={areaFontSize} fontStyle="bold" />
          </KonvaLabel>
        </>
      )}

      {/* Cutting Line restricted to plot bounds */}
      <Group
        clipFunc={(ctx) => {
          if (!plot) return;
          ctx.beginPath();
          ctx.moveTo(plot.points[0].x, plot.points[0].y);
          for (let i = 1; i < plot.points.length; i++) {
            ctx.lineTo(plot.points[i].x, plot.points[i].y);
          }
          ctx.closePath();
        }}
      >
        <Line
          points={linePoints}
          stroke="#DC2626"
          strokeWidth={2 / stageScale}
          dash={[8 / stageScale, 8 / stageScale]}
          listening={false}
        />
      </Group>



      {/* Draggable Anchors */}
      {manualCutLine.map((pt, idx) => (
        <Circle
          key={idx}
          x={pt.x}
          y={pt.y}
          radius={8 / stageScale}
          fill="#DC2626"
          stroke="#FFFFFF"
          strokeWidth={2 / stageScale}
          hitStrokeWidth={30 / stageScale}
          draggable
          onDragMove={handleDragMove(idx)}
          onMouseEnter={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'grab';
          }}
          onMouseLeave={(e) => {
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'default';
          }}
          onDragStart={(e) => {
            e.cancelBubble = true;
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'grabbing';
          }}
          onDragEnd={(e) => {
            handleDragEnd(idx)(e);
            const container = e.target.getStage()?.container();
            if (container) container.style.cursor = 'grab';
          }}
        />
      ))}
    </Group>
  );
});

StageManualCut.displayName = 'StageManualCut';
