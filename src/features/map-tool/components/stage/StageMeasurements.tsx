import { memo } from 'react';
import { Group, Line, Circle, Label as KonvaLabel, Tag, Text } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { formatFeetInches, LABEL_OFFSET_MEASUREMENT, UI_CONFIG } from '@/features/map-tool/utils/canvas';
import { isPointInPolygon, clipLineToPolygon } from '@/features/map-tool/utils/geometry';
import { useMapStore } from '@/features/map-tool/store/useMapStore';

export const StageMeasurements = memo(() => {
  const {
    mode,
    measurementLines,
    measurementDraft,
    measurementDashed,
    stageScale,
    stagePos,
    stageSize,
    scale,
    plots,
  } = useMapStore(
    useShallow(s => ({
      mode: s.mode,
      measurementLines: s.measurementLines,
      measurementDraft: s.measurementDraft,
      measurementDashed: s.measurementDashed,
      stageScale: s.stageScale,
      stageSize: s.stageSize,
      scale: s.scale,
      plots: s.plots,
      stagePos: s.mode === 'measuring' && s.measurementDraft.length === 2 ? s.stagePos : null
    }))
  );
  
  return (
    <>
      {measurementLines.map((line, i) => {
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
        const distPx = Math.hypot(dx, dy);
        if (distPx < 1) return null;
        const label = scale ? formatFeetInches(distPx / scale) : '0\'-00"';
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;
        const fontSize = 14 / stageScale;
        const padding = 4 / stageScale;
        const estWidth = (label.length * fontSize * 0.62) + padding * 2;
        const estHeight = fontSize + padding * 2;
        const perpX = -dy / distPx;
        const perpY = dx / distPx;
        const offsetDist = LABEL_OFFSET_MEASUREMENT / stageScale;

        return (
          <Group key={line.id}>
            <Line
              points={[line.start.x, line.start.y, line.end.x, line.end.y]}
              stroke="#111827"
              strokeWidth={2.25 / stageScale}
              dash={line.dashed ? [10 / stageScale, 6 / stageScale] : undefined}
            />
            <Circle x={line.start.x} y={line.start.y} radius={UI_CONFIG.radius.small / stageScale} fill={UI_CONFIG.colors.measurePrimary} stroke={UI_CONFIG.colors.textWhite} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} />
            <Circle x={line.end.x} y={line.end.y} radius={UI_CONFIG.radius.small / stageScale} fill={UI_CONFIG.colors.measurePrimary} stroke={UI_CONFIG.colors.textWhite} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} />
            <KonvaLabel
              x={midX + perpX * offsetDist}
              y={midY + perpY * offsetDist}
              offsetX={estWidth / 2}
              offsetY={estHeight / 2}
              opacity={0.95}
            >
              <Tag fill={UI_CONFIG.colors.textWhite} stroke={UI_CONFIG.colors.measurePrimary} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} cornerRadius={UI_CONFIG.padding.small / stageScale} />
              <Text text={`${i + 1}. ${label}`} fontSize={fontSize} fill="#111827" padding={padding} fontStyle="bold" />
            </KonvaLabel>
          </Group>
        );
      })}

      {mode === 'measuring' && measurementDraft.length === 2 && stagePos && (() => {
        let endPt = { 
          x: (stageSize.width / 2 - stagePos.x) / stageScale, 
          y: (stageSize.height / 2 - stagePos.y) / stageScale 
        };
        const [x1, y1] = measurementDraft;
        const startPt = { x: x1, y: y1 };

        // Clip visual line to polygon if starting inside one
        for (const plot of plots) {
          if (isPointInPolygon(startPt, plot.points)) {
            endPt = clipLineToPolygon(startPt, endPt, plot.points);
            break;
          }
        }

        const dx = endPt.x - x1;
        const dy = endPt.y - y1;
        const distPx = Math.hypot(dx, dy);
        if (distPx < 1) return null;
        const label = scale ? formatFeetInches(distPx / scale) : '0\'-00"';
        const midX = (x1 + endPt.x) / 2;
        const midY = (y1 + endPt.y) / 2;
        const fontSize = 14 / stageScale;
        const padding = 4 / stageScale;
        return (
          <Group>
            <Line
              points={[x1, y1, endPt.x, endPt.y]}
              stroke="#111827"
              strokeWidth={2 / stageScale}
              dash={measurementDashed ? [8 / stageScale, 5 / stageScale] : undefined}
              opacity={0.75}
            />
            <Circle x={x1} y={y1} radius={UI_CONFIG.radius.medium / stageScale} fill={UI_CONFIG.colors.measurePrimary} stroke={UI_CONFIG.colors.textWhite} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} />
            <KonvaLabel x={midX} y={midY} opacity={0.9}>
              <Tag fill={UI_CONFIG.colors.textWhite} stroke={UI_CONFIG.colors.measurePrimary} strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale} cornerRadius={UI_CONFIG.padding.small / stageScale} />
              <Text text={label} fontSize={fontSize} fill="#111827" padding={padding} fontStyle="bold" />
            </KonvaLabel>
          </Group>
        );
      })()}
    </>
  );
});
StageMeasurements.displayName = 'StageMeasurements';
