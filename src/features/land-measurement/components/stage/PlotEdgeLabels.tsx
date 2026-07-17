import { Group, Label as KonvaLabel, Tag, Text } from 'react-konva';
import type { PlotsLabelData } from '@/features/land-measurement/types/stage';

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface PlotEdgeLabelsProps {
  allLabels: PlotsLabelData[];
  stageScale: number;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const PlotEdgeLabels: React.FC<PlotEdgeLabelsProps> = ({ allLabels, stageScale }) => {
  return (
    <>
      {allLabels.map((d) => (
        <Group key={`plot-${d.plotId}-label-group-${d.i}`}>
          <KonvaLabel
            x={d.x}
            y={d.y}
            offsetX={d.estWidth / 2}
            offsetY={d.estHeight / 2}
            rotation={d.rotation}
            opacity={1}
          >
            <Tag
              fill="white"
              stroke={d.color}
              strokeWidth={1.2 / stageScale}
              cornerRadius={3 / stageScale}
            />
            <Text
              text={d.labelText}
              fontSize={d.fontSize}
              fill={d.color}
              padding={d.padding}
              fontStyle="bold"
            />
          </KonvaLabel>
        </Group>
      ))}
    </>
  );
};
