import { memo, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Label as KonvaLabel, Tag, Text } from 'react-konva';
import {
  AREA_LABEL_FONT_SCALE,
  AREA_LABEL_HEIGHT_FACTOR,
  AREA_LABEL_PADDING_FACTOR,
  AREA_LABEL_RADIUS_FACTOR,
  AREA_LABEL_WIDTH_FACTOR,
  LABEL_OFFSET_DRAWN_PLOT,
  MIN_DIAGONAL_DRAW_PX,
  MIN_EDGE_LABEL_DRAW_PX,
  MIN_EDGE_LABEL_FT,
  UI_CONFIG,
  formatFeetInches,
} from '@/features/map-tool/utils/canvas';
import { getLineIntersection, getVisualCenter, groupPolygonSegments } from '@/features/map-tool/utils/geometry';
import { signedArea } from '@/features/map-tool/utils/component-helpers';
import { getReadableRotation, hexToRgba } from '@/features/map-tool/utils/component-helpers';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import type { Point } from '@/features/map-tool/types/map';
import type Konva from 'konva';
import type { PlotsLabelData, PlotSegment, PlotSegmentGroup } from '@/features/map-tool/types/stage';
import { PlotEdgeLabels } from './PlotEdgeLabels';

const getDefaultManualCutLine = (plotPoints: Point[], center: Point, stageScale: number): Point[] => {
  const xs = plotPoints.map(p => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const padding = 1000 / stageScale;
  const lineStart = { x: minX - padding, y: center.y };
  const lineEnd = { x: maxX + padding, y: center.y };
  const intersections: Point[] = [];

  for (let i = 0; i < plotPoints.length; i++) {
    const p1 = plotPoints[i];
    const p2 = plotPoints[(i + 1) % plotPoints.length];
    const intersection = getLineIntersection(lineStart, lineEnd, p1, p2);
    if (!intersection) continue;
    const isDuplicate = intersections.some(p => Math.hypot(p.x - intersection.x, p.y - intersection.y) < 1e-3);
    if (!isDuplicate) intersections.push(intersection);
  }

  if (intersections.length >= 2) {
    intersections.sort((a, b) => a.x - b.x);
    return [intersections[0], intersections[intersections.length - 1]];
  }

  const fallbackOffset = 100 / stageScale;
  return [
    { x: center.x - fallbackOffset, y: center.y },
    { x: center.x + fallbackOffset, y: center.y }
  ];
};

export const StagePlots = memo(() => {
  const { plots, stageScale, scale, mode, manualDividePlotId, manualCutLine, setManualDividePlotId, setManualCutLine, isShowDiagonals } = useMapStore(
    useShallow(s => ({
      plots: s.plots,
      stageScale: s.stageScale,
      scale: s.scale,
      mode: s.mode,
      manualDividePlotId: s.manualDividePlotId,
      manualCutLine: s.manualCutLine,
      setManualDividePlotId: s.setManualDividePlotId,
      setManualCutLine: s.setManualCutLine,
      isShowDiagonals: s.isShowDiagonals
    }))
  );

  // Memoize heavy geometric computation — only re-runs when plots or scale change
  const plotPolygons = useMemo(() => {
    if (plots.length === 0) return [];

    return plots.map((plot, plotIndex) => {
      const points = plot.points.flatMap(p => [p.x, p.y]);
      const first = plot.points[0];
      const areaCenter = getVisualCenter(plot.points);

      // Winding order (computed once per plot)
      const isClockwise = signedArea(plot.points) < 0;

      // Build segments & group co-linear edges (shared helper)
      const rawGroups = groupPolygonSegments(plot.points);

      // Add component-specific data (length in feet) to each segment/group
      const groups: PlotSegmentGroup[] = rawGroups.map((rawGroup) => {
        const segments: PlotSegment[] = rawGroup.map((seg) => ({
          ...seg,
          lengthFt: scale ? (seg.distPx / scale) : 0,
        }));
        return {
          segments,
          totalLengthFt: segments.reduce((sum, s) => sum + s.lengthFt, 0),
        };
      });

      return { id: plot.id, points, first, areaCenter, plotIndex, color: plot.color || '#0F766E', groups, isClockwise };
    });
  }, [plots, scale]);

  // Memoize labels — placed outside polygon using outward normal from winding order.
  const allLabels = useMemo(() => {
    if (plotPolygons.length === 0) return [];

    const drawnLabelCenters: { x: number; y: number }[] = [];
    const allLabelsMut: PlotsLabelData[] = [];

    const sortedPlotPolygons = [...plotPolygons].sort((a, b) => {
      const areaA = plots[a.plotIndex]?.results?.shotok || 0;
      const areaB = plots[b.plotIndex]?.results?.shotok || 0;
      return areaA - areaB;
    });

    const maxArea = sortedPlotPolygons.length > 1
      ? Math.max(...sortedPlotPolygons.map(p => plots[p.plotIndex]?.results?.shotok || 0))
      : -1;

    sortedPlotPolygons.forEach((plot) => {
      const currentArea = plots[plot.plotIndex]?.results?.shotok || 0;
      if (sortedPlotPolygons.length > 1 && currentArea === maxArea) return; // Skip largest plot

      plot.groups.forEach((group, groupIdx) => {
        const totalDistPx = group.segments.reduce((sum, seg) => sum + seg.distPx, 0);
        if (totalDistPx < MIN_EDGE_LABEL_DRAW_PX / stageScale) return;
        if (group.totalLengthFt < MIN_EDGE_LABEL_FT) return;

        const labelText = formatFeetInches(group.totalLengthFt);
        
        // Find the physical midpoint ALONG the boundary path (not the chord)
        const firstPt = group.segments[0].point;
        const lastPt = group.segments[group.segments.length - 1].nextPoint;
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

        const fontSize = UI_CONFIG.fontSize.small / stageScale;
        const padding = UI_CONFIG.padding.small / stageScale;
        const estWidth = (labelText.length * fontSize * 0.6) + padding * 2;
        const estHeight = fontSize + padding * 2;
        
        const dx = midDx;
        const dy = midDy;
        const dist = Math.hypot(dx, dy) > 0.001 ? Math.hypot(dx, dy) : 1;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const rotation = getReadableRotation(angle);

        // Outward normal — always points away from polygon interior
        const perpX = plot.isClockwise ?  dy / dist : -dy / dist;
        const perpY = plot.isClockwise ? -dx / dist :  dx / dist;
        const labelOffset = LABEL_OFFSET_DRAWN_PLOT / stageScale;
        const lx = midX + perpX * labelOffset;
        const ly = midY + perpY * labelOffset;

        const isDuplicate = drawnLabelCenters.some(
          c => Math.hypot(c.x - midX, c.y - midY) < 10 / stageScale
        );
        if (isDuplicate) return;
        drawnLabelCenters.push({ x: midX, y: midY });

        allLabelsMut.push({
          plotId: plot.id,
          color: plot.color,
          i: groupIdx,
          midX, midY,
          rotation,
          idealX: lx,
          idealY: ly,
          x: lx,
          y: ly,
          labelDist: labelOffset,
          perpX, perpY,
          estWidth, estHeight,
          labelText, fontSize, padding,
        });
      });
    });

    return allLabelsMut;
  }, [plotPolygons, stageScale, plots]);

  if (plotPolygons.length === 0) return null;

  return (
    <>
      {plotPolygons.map(({ id, points, first, areaCenter, plotIndex, color, groups }) => {
        const isManualSelected = mode === 'manual_divide_plot' && manualDividePlotId === id;
        const plotFill = hexToRgba(color, isManualSelected ? 0.18 : 0.10);
        const hoverFill = hexToRgba(color, 0.15);
        const areaText = `${plots[plotIndex].results.shotok.toFixed(2)} শতক`;
        const areaFontSize = (UI_CONFIG.fontSize.small * AREA_LABEL_FONT_SCALE) / stageScale;
        const areaPadding = (UI_CONFIG.padding.small * AREA_LABEL_PADDING_FACTOR) / stageScale;
        const areaWidth = areaText.length * areaFontSize * AREA_LABEL_WIDTH_FACTOR + areaPadding * 2;
        const areaHeight = areaFontSize * AREA_LABEL_HEIGHT_FACTOR + areaPadding * 2;

        return (
        <Group key={id}>
          <Line
            points={[...points, first.x, first.y]}
            stroke={color}
            strokeWidth={UI_CONFIG.strokeWidth.xxthick / stageScale}
            fill={plotFill}
            closed
            onMouseEnter={(e) => {
              if (mode !== 'manual_divide_plot') return;
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'pointer';
              if (!isManualSelected) (e.target as Konva.Shape).fill(hoverFill);
            }}
            onMouseLeave={(e) => {
              if (mode !== 'manual_divide_plot') return;
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'default';
              if (!isManualSelected) (e.target as Konva.Shape).fill(plotFill);
            }}
            onClick={(e) => {
              if (mode !== 'manual_divide_plot') return;
              e.cancelBubble = true;
              if (manualDividePlotId === id && manualCutLine && manualCutLine.length >= 2) return;
              setManualDividePlotId(id);
              const plotPts = groups.flatMap(g => g.segments.map(s => s.point));
              const xs = plotPts.map(p => p.x);
              const ys = plotPts.map(p => p.y);
              const pos = e.target.getStage()?.getRelativePointerPosition();
              const minPxX = Math.min(...xs);
              const maxPxX = Math.max(...xs);
              const minPxY = Math.min(...ys);
              const maxPxY = Math.max(...ys);
              const midPxX = pos ? pos.x : (minPxX + maxPxX) / 2;
              const midPxY = pos ? pos.y : (minPxY + maxPxY) / 2;
              setManualCutLine(getDefaultManualCutLine(plotPts, { x: midPxX, y: midPxY }, stageScale));
            }}
            onTap={(e) => {
              if (mode !== 'manual_divide_plot') return;
              e.cancelBubble = true;
              if (manualDividePlotId === id && manualCutLine && manualCutLine.length >= 2) return;
              setManualDividePlotId(id);
              const plotPts = groups.flatMap(g => g.segments.map(s => s.point));
              const xs = plotPts.map(p => p.x);
              const ys = plotPts.map(p => p.y);
              const pos = e.target.getStage()?.getRelativePointerPosition();
              const minPxX = Math.min(...xs);
              const maxPxX = Math.max(...xs);
              const minPxY = Math.min(...ys);
              const maxPxY = Math.max(...ys);
              const midPxX = pos ? pos.x : (minPxX + maxPxX) / 2;
              const midPxY = pos ? pos.y : (minPxY + maxPxY) / 2;
              setManualCutLine(getDefaultManualCutLine(plotPts, { x: midPxX, y: midPxY }, stageScale));
            }}
          />

          {mode !== 'manual_divide_plot' && (
            <KonvaLabel
              x={areaCenter.x}
              y={areaCenter.y}
              offsetX={areaWidth / 2}
              offsetY={areaHeight / 2}
              opacity={0.95}
            >
              <Tag
                fill={color}
                cornerRadius={(UI_CONFIG.radius.small * AREA_LABEL_RADIUS_FACTOR) / stageScale}
                shadowColor="rgba(0,0,0,0.25)"
                shadowBlur={2 / stageScale}
              />
              <Text text={areaText} fill="white" padding={areaPadding} fontSize={areaFontSize} fontStyle="bold" />
            </KonvaLabel>
          )}
          {isShowDiagonals && plotIndex < plots.length && plots[plotIndex].results.diagonals && plots[plotIndex].results.diagonals!.map((d, dIdx) => {
            const p1x = points[d.p1Index * 2];
            const p1y = points[d.p1Index * 2 + 1];
            const p2x = points[d.p2Index * 2];
            const p2y = points[d.p2Index * 2 + 1];
            const dx = p2x - p1x;
            const dy = p2y - p1y;
            const distPx = Math.hypot(dx, dy);

            if (distPx <= MIN_DIAGONAL_DRAW_PX / stageScale) return null;

            const midX = (p1x + p2x) / 2;
            const midY = (p1y + p2y) / 2;
            const labelText = d.lengthFt >= MIN_EDGE_LABEL_FT ? formatFeetInches(d.lengthFt) : '';

            if (labelText) {
              const fontSize = UI_CONFIG.fontSize.small / stageScale;
              const padding = UI_CONFIG.padding.small / stageScale;
              const estWidth = (labelText.length * fontSize * 0.6) + padding * 2;
              const estHeight = fontSize + padding * 2;

              return (
                <Group key={`plot-${id}-diag-${dIdx}`}>
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
                    offsetX={estWidth / 2}
                    offsetY={estHeight / 2}
                    opacity={0.8}
                  >
                    <Tag fill={UI_CONFIG.colors.textWhite} stroke={color} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} cornerRadius={UI_CONFIG.padding.small / stageScale} />
                    <Text text={labelText} fontSize={fontSize} fill={color} padding={padding} fontStyle="bold" />
                  </KonvaLabel>
                </Group>
              );
            } else {
              return (
                <Line
                  key={`plot-${id}-diag-${dIdx}`}
                  points={[p1x, p1y, p2x, p2y]}
                  stroke={color}
                  strokeWidth={1 / stageScale}
                  dash={[6 / stageScale, 6 / stageScale]}
                  opacity={0.4}
                />
              );
            }
          })}
        </Group>
        );
      })}
      <PlotEdgeLabels allLabels={allLabels} stageScale={stageScale} />
    </>
  );
});
StagePlots.displayName = 'StagePlots';
