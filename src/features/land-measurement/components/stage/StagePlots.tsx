
import { memo, useMemo, useCallback } from 'react';
import Konva from 'konva';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Label as KonvaLabel, Tag, Text } from 'react-konva';
import {
  AREA_LABEL_FONT_SCALE,
  AREA_LABEL_HEIGHT_FACTOR,
  AREA_LABEL_PADDING_FACTOR,
  AREA_LABEL_RADIUS_FACTOR,
  AREA_LABEL_WIDTH_FACTOR,
  MIN_DIAGONAL_DRAW_PX,
  MIN_EDGE_LABEL_FT,
  UI_CONFIG,
  formatFeetInches,
} from '@/features/land-measurement/utils/canvas';
import {
  getLineIntersection,
  groupPolygonSegments,
} from '@/features/land-measurement/utils/geometry';
import { getPolygonAreaLabelLayout } from '@/features/land-measurement/utils/polygon-label';
import { hexToRgba } from '@/features/land-measurement/utils/component-helpers';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import type { Point, MapMode, PlotRecord } from '@/features/land-measurement/types/map';
import type { PlotSegment, PlotSegmentGroup } from '@/features/land-measurement/types/stage';
import { PlotEdgeLabels } from './PlotEdgeLabels';

const getDefaultManualCutLine = (
  plotPoints: Point[],
  center: Point,
  stageScale: number,
): Point[] => {
  const xs = plotPoints.map((point) => point.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const padding = 1000 / stageScale;
  const lineStart = { x: minX - padding, y: center.y };
  const lineEnd = { x: maxX + padding, y: center.y };
  const intersections: Point[] = [];

  for (let i = 0; i < plotPoints.length; i += 1) {
    const p1 = plotPoints[i];
    const p2 = plotPoints[(i + 1) % plotPoints.length];
    const intersection = getLineIntersection(lineStart, lineEnd, p1, p2);
    if (!intersection) continue;

    const isDuplicate = intersections.some(
      (point) => Math.hypot(point.x - intersection.x, point.y - intersection.y) < 1e-3,
    );
    if (!isDuplicate) intersections.push(intersection);
  }

  if (intersections.length >= 2) {
    intersections.sort((a, b) => a.x - b.x);
    return [intersections[0], intersections[intersections.length - 1]];
  }

  const fallbackOffset = 100 / stageScale;
  return [
    { x: center.x - fallbackOffset, y: center.y },
    { x: center.x + fallbackOffset, y: center.y },
  ];
};

type PreparedPlot = {
  id: string;
  points: number[];
  first: Point;
  areaCenter: Point;
  areaRotation: number;
  plotIndex: number;
  color: string;
  groups: PlotSegmentGroup[];
};

type SinglePlotProps = {
  plot: PreparedPlot;
  mode: MapMode;
  manualDividePlotId: string | null;
  setManualDividePlotId: (id: string | null) => void;
  manualCutLine: Point[] | null;
  setManualCutLine: (points: Point[] | null) => void;
  stageScale: number;
  plotData: PlotRecord;
  isShowDiagonals: boolean;
};

const SinglePlot = memo(({
  plot,
  mode,
  manualDividePlotId,
  setManualDividePlotId,
  manualCutLine,
  setManualCutLine,
  stageScale,
  plotData,
  isShowDiagonals,
}: SinglePlotProps) => {
  const { id, points, first, areaCenter, areaRotation, color, groups } = plot;
  const isManualSelected = mode === 'manual_divide_plot' && manualDividePlotId === id;
  const plotFill = hexToRgba(color, isManualSelected ? 0.18 : 0.10);
  const hoverFill = hexToRgba(color, 0.15);
  const areaText = `${plotData.results.shotok.toFixed(2)} শতক`;
  const areaFontSize = (UI_CONFIG.fontSize.small * AREA_LABEL_FONT_SCALE) / stageScale;
  const areaPadding = (UI_CONFIG.padding.small * AREA_LABEL_PADDING_FACTOR) / stageScale;
  const areaWidth = areaText.length * areaFontSize * AREA_LABEL_WIDTH_FACTOR + areaPadding * 2;
  const areaHeight = areaFontSize * AREA_LABEL_HEIGHT_FACTOR + areaPadding * 2;

  const onMouseEnter = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode !== 'manual_divide_plot') return;
    const container = event.target.getStage()?.container();
    if (container) container.style.cursor = 'pointer';
    if (!isManualSelected) (event.target as Konva.Shape).fill(hoverFill);
  }, [mode, isManualSelected, hoverFill]);

  const onMouseLeave = useCallback((event: Konva.KonvaEventObject<MouseEvent>) => {
    if (mode !== 'manual_divide_plot') return;
    const container = event.target.getStage()?.container();
    if (container) container.style.cursor = 'default';
    if (!isManualSelected) (event.target as Konva.Shape).fill(plotFill);
  }, [mode, isManualSelected, plotFill]);

  const handleClickTap = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (mode !== 'manual_divide_plot') return;
    event.cancelBubble = true;
    if (manualDividePlotId === id && manualCutLine && manualCutLine.length >= 2) return;

    setManualDividePlotId(id);
    const plotPoints = groups.flatMap((group) => group.segments.map((segment) => segment.point));
    const xs = plotPoints.map((point) => point.x);
    const ys = plotPoints.map((point) => point.y);
    const position = event.target.getStage()?.getRelativePointerPosition();
    const minPxX = Math.min(...xs);
    const maxPxX = Math.max(...xs);
    const minPxY = Math.min(...ys);
    const maxPxY = Math.max(...ys);
    const midPxX = position ? position.x : (minPxX + maxPxX) / 2;
    const midPxY = position ? position.y : (minPxY + maxPxY) / 2;

    setManualCutLine(
      getDefaultManualCutLine(plotPoints, { x: midPxX, y: midPxY }, stageScale),
    );
  }, [
    mode,
    id,
    manualDividePlotId,
    manualCutLine,
    setManualDividePlotId,
    groups,
    setManualCutLine,
    stageScale,
  ]);

  return (
    <Group>
      <Line
        points={[...points, first.x, first.y]}
        stroke={color}
        strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale}
        fill={plotFill}
        closed
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleClickTap}
        onTap={handleClickTap}
      />

      {mode !== 'manual_divide_plot' && (
        <KonvaLabel
          x={areaCenter.x}
          y={areaCenter.y}
          offsetX={areaWidth / 2}
          offsetY={areaHeight / 2}
          rotation={areaRotation}
          opacity={0.95}
          listening={false}
        >
          <Tag
            fill={color}
            cornerRadius={(UI_CONFIG.radius.small * AREA_LABEL_RADIUS_FACTOR) / stageScale}
            shadowColor="rgba(0,0,0,0.25)"
            shadowBlur={2 / stageScale}
          />
          <Text
            text={areaText}
            fill="white"
            padding={areaPadding}
            fontSize={areaFontSize}
            fontStyle="bold"
          />
        </KonvaLabel>
      )}

      {isShowDiagonals && plotData.results.diagonals?.map((diagonal, diagonalIndex) => {
        const p1x = points[diagonal.p1Index * 2];
        const p1y = points[diagonal.p1Index * 2 + 1];
        const p2x = points[diagonal.p2Index * 2];
        const p2y = points[diagonal.p2Index * 2 + 1];
        const dx = p2x - p1x;
        const dy = p2y - p1y;
        const distPx = Math.hypot(dx, dy);

        if (distPx <= MIN_DIAGONAL_DRAW_PX / stageScale) return null;

        const midX = (p1x + p2x) / 2;
        const midY = (p1y + p2y) / 2;
        const labelText = diagonal.lengthFt >= MIN_EDGE_LABEL_FT
          ? formatFeetInches(diagonal.lengthFt)
          : '';

        if (!labelText) {
          return (
            <Line
              key={`plot-${id}-diag-${diagonalIndex}`}
              points={[p1x, p1y, p2x, p2y]}
              stroke={color}
              strokeWidth={1 / stageScale}
              dash={[6 / stageScale, 6 / stageScale]}
              opacity={0.4}
              listening={false}
            />
          );
        }

        const diagonalFontSize = UI_CONFIG.fontSize.small / stageScale;
        const diagonalPadding = UI_CONFIG.padding.small / stageScale;
        const estimatedWidth = labelText.length * diagonalFontSize * 0.6 + diagonalPadding * 2;
        const estimatedHeight = diagonalFontSize + diagonalPadding * 2;

        return (
          <Group key={`plot-${id}-diag-${diagonalIndex}`} listening={false}>
            <Line
              points={[p1x, p1y, p2x, p2y]}
              stroke={color}
              strokeWidth={1 / stageScale}
              dash={[6 / stageScale, 6 / stageScale]}
              opacity={0.4}
            />
            <KonvaLabel
              x={midX}
              y={midY}
              offsetX={estimatedWidth / 2}
              offsetY={estimatedHeight / 2}
              opacity={0.8}
            >
              <Tag
                fill={UI_CONFIG.colors.textWhite}
                stroke={color}
                strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale}
                cornerRadius={UI_CONFIG.padding.small / stageScale}
              />
              <Text
                text={labelText}
                fontSize={diagonalFontSize}
                fill={color}
                padding={diagonalPadding}
                fontStyle="bold"
              />
            </KonvaLabel>
          </Group>
        );
      })}
    </Group>
  );
});
SinglePlot.displayName = 'SinglePlot';

export const StagePlots = memo(() => {
  const {
    plots,
    stageScale,
    scale,
    mode,
    manualDividePlotId,
    manualCutLine,
    setManualDividePlotId,
    setManualCutLine,
    isShowDiagonals,
  } = useMapStore(
    useShallow((state) => ({
      plots: state.plots,
      stageScale: state.stageScale,
      scale: state.scale,
      mode: state.mode,
      manualDividePlotId: state.manualDividePlotId,
      manualCutLine: state.manualCutLine,
      setManualDividePlotId: state.setManualDividePlotId,
      setManualCutLine: state.setManualCutLine,
      isShowDiagonals: state.isShowDiagonals,
    })),
  );

  // Geometry preparation is independent of zoom. Keeping stageScale out of this
  // memo prevents expensive segment grouping on every pinch/wheel frame.
  const preparedPlots = useMemo<PreparedPlot[]>(() => {
    if (plots.length === 0) return [];

    return plots.map((plot, plotIndex) => {
      const points = plot.points.flatMap((point) => [point.x, point.y]);
      const first = plot.points[0];
      const areaLabelLayout = getPolygonAreaLabelLayout(plot.points);
      const rawGroups = groupPolygonSegments(plot.points);

      const groups: PlotSegmentGroup[] = rawGroups.map((rawGroup) => {
        const segments: PlotSegment[] = rawGroup.map((segment) => ({
          ...segment,
          lengthFt: scale ? segment.distPx / scale : 0,
        }));

        return {
          segments,
          totalLengthFt: segments.reduce((sum, segment) => sum + segment.lengthFt, 0),
        };
      });

      return {
        id: plot.id,
        points,
        first,
        areaCenter: areaLabelLayout.center,
        areaRotation: areaLabelLayout.rotation,
        plotIndex,
        color: plot.color || '#0F766E',
        groups,
      };
    });
  }, [plots, scale]);

  if (preparedPlots.length === 0) return null;

  return (
    <>
      {preparedPlots.map((plot) => (
        <SinglePlot
          key={plot.id}
          plot={plot}
          mode={mode}
          manualDividePlotId={manualDividePlotId}
          setManualDividePlotId={setManualDividePlotId}
          manualCutLine={manualCutLine}
          setManualCutLine={setManualCutLine}
          stageScale={stageScale}
          plotData={plots[plot.plotIndex]}
          isShowDiagonals={isShowDiagonals}
        />
      ))}
      <PlotEdgeLabels stageScale={stageScale} />
    </>
  );
});
StagePlots.displayName = 'StagePlots';
