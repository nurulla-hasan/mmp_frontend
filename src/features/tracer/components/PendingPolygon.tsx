import { memo } from 'react';
import { Group, Line, Circle } from 'react-konva';

export const PendingPolygon = memo(function PendingPolygon({
  pendingPoints,
  activeLayerColor,
  activeLayerLineWidth,
  stageScale,
  hoverPoint,
  snapActive,
  edgeSnapped,
}: {
  pendingPoints: { x: number; y: number }[];
  activeLayerColor: string;
  activeLayerLineWidth: number;
  stageScale: number;
  hoverPoint: { x: number; y: number } | null;
  snapActive: boolean;
  edgeSnapped: boolean;
}) {
  if (pendingPoints.length === 0) return null;

  const flatPending = pendingPoints.flatMap(p => [p.x, p.y]);

  return (
    <Group listening={false}>
      {/* Completed edges so far */}
      {flatPending.length >= 4 && (
        <Line
          points={flatPending}
          stroke={activeLayerColor}
          strokeWidth={activeLayerLineWidth / stageScale}
          dash={[8 / stageScale, 4 / stageScale]}
          perfectDrawEnabled={false}
        />
      )}
      {/* Edge-snap indicator */}
      {hoverPoint && edgeSnapped && !snapActive && (
        <Circle
          x={hoverPoint.x}
          y={hoverPoint.y}
          radius={10 / stageScale}
          stroke="#2563EB"
          strokeWidth={2 / stageScale}
          dash={[5 / stageScale, 4 / stageScale]}
          opacity={0.7}
        />
      )}
      {/* Rubber-band to cursor */}
      {hoverPoint && (
        <Line
          points={[
            pendingPoints[pendingPoints.length - 1].x,
            pendingPoints[pendingPoints.length - 1].y,
            hoverPoint.x,
            hoverPoint.y,
          ]}
          stroke={activeLayerColor}
          strokeWidth={activeLayerLineWidth / stageScale}
          dash={[5 / stageScale, 5 / stageScale]}
          opacity={0.5}
          perfectDrawEnabled={false}
        />
      )}
      {/* Vertex dots */}
      {pendingPoints.map((p, i) => (
        <Group key={i}>
          {i === 0 && snapActive && (
            <Circle
              x={p.x}
              y={p.y}
              radius={12 / stageScale}
              stroke="#2563EB"
              strokeWidth={2.5 / stageScale}
              dash={[6 / stageScale, 4 / stageScale]}
            />
          )}
          <Circle
            x={p.x}
            y={p.y}
            radius={(i === 0 ? (snapActive ? 7 : 5) : 3.5) / stageScale}
            fill={i === 0 ? (snapActive ? '#2563EB' : activeLayerColor) : '#ffffff'}
            stroke={snapActive && i === 0 ? '#2563EB' : activeLayerColor}
            strokeWidth={1.5 / stageScale}
          />
        </Group>
      ))}
    </Group>
  );
});
