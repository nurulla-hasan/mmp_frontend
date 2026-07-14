import { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { Group, Line, Label as KonvaLabel, Tag, Text } from 'react-konva';
import { formatFeetInches, MIN_DIAGONAL_DRAW_PX, UI_CONFIG } from '@/features/map-tool/utils/canvas';
import { getLogicalCorners, triangulatePolygon } from '@/features/map-tool/utils/geometry';
import { useMapStore } from '@/features/map-tool/store/useMapStore';

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const ActivePlotDiagonals = memo(() => {
  const { plotPoints, isPlotFinished, stageScale, scale, isShowDiagonals } = useMapStore(
    useShallow((s) => ({
      plotPoints: s.plotPoints,
      isPlotFinished: s.isPlotFinished,
      stageScale: s.stageScale,
      scale: s.scale,
      isShowDiagonals: s.isShowDiagonals,
    })),
  );

  if (!isPlotFinished || !isShowDiagonals || plotPoints.length < 4 || plotPoints.length > 8)
    return null;

  const logicalCorners = getLogicalCorners(plotPoints);
  const triangulatedDiagonals = triangulatePolygon(logicalCorners);

  return (
    <>
      {triangulatedDiagonals.map((diag, i) => {
        const p1 = logicalCorners[diag.p1Index];
        const p2 = logicalCorners[diag.p2Index];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distPx = Math.hypot(dx, dy);
        const lengthFt = scale ? distPx / scale : 0;

        if (distPx <= MIN_DIAGONAL_DRAW_PX / stageScale) return null;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const labelText = formatFeetInches(lengthFt);
        const fontSize = UI_CONFIG.fontSize.medium / stageScale;
        const padding = UI_CONFIG.padding.small / stageScale;
        const estWidth = labelText.length * fontSize * 0.6 + padding * 2;
        const estHeight = fontSize + padding * 2;

        return (
          <Group key={`diag-group-${i}`}>
            <Line
              points={[p1.x, p1.y, p2.x, p2.y]}
              stroke="#94A3B8"
              strokeWidth={1 / stageScale}
              dash={[6 / stageScale, 6 / stageScale]}
              opacity={0.6}
            />
            <KonvaLabel
              x={midX}
              y={midY}
              offsetX={estWidth / 2}
              offsetY={estHeight / 2}
              opacity={0.9}
            >
              <Tag
                fill={UI_CONFIG.colors.textWhite}
                stroke={UI_CONFIG.colors.gray}
                strokeWidth={UI_CONFIG.strokeWidth.thin / stageScale}
                cornerRadius={UI_CONFIG.padding.small / stageScale}
              />
              <Text
                text={labelText}
                fontSize={fontSize}
                fill={UI_CONFIG.colors.gray}
                padding={padding}
                fontStyle="bold"
              />
            </KonvaLabel>
          </Group>
        );
      })}
    </>
  );
});
ActivePlotDiagonals.displayName = 'ActivePlotDiagonals';
