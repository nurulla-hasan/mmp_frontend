import { useMemo } from 'react';
import { Group, Label as KonvaLabel, Tag, Text } from 'react-konva';
import type { PlotsLabelData } from '@/features/land-measurement/types/stage';

interface PlotEdgeLabelsProps {
  allLabels: PlotsLabelData[];
  stageScale: number;
}

type ScreenBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

const boxesOverlap = (a: ScreenBox, b: ScreenBox) =>
  a.left < b.right &&
  a.right > b.left &&
  a.top < b.bottom &&
  a.bottom > b.top;

const getFairLabelOrder = (labels: PlotsLabelData[]) => {
  const byPlot = new Map<string, PlotsLabelData[]>();

  labels.forEach((label) => {
    const plotLabels = byPlot.get(label.plotId) ?? [];
    plotLabels.push(label);
    byPlot.set(label.plotId, plotLabels);
  });

  const queues = Array.from(byPlot.values());
  const ordered: PlotsLabelData[] = [];
  let index = 0;

  while (queues.some((queue) => index < queue.length)) {
    queues.forEach((queue) => {
      const label = queue[index];
      if (label) ordered.push(label);
    });
    index += 1;
  }

  return ordered;
};

export const PlotEdgeLabels: React.FC<PlotEdgeLabelsProps> = ({ allLabels, stageScale }) => {
  const visibleLabels = useMemo(() => {
    if (allLabels.length <= 1) return allLabels;

    // Round-robin between plots first so one heavily divided plot cannot consume
    // all available label space before neighboring plots get a useful dimension.
    const orderedLabels = getFairLabelOrder(allLabels);
    const acceptedBoxes: ScreenBox[] = [];
    const acceptedLabels: PlotsLabelData[] = [];

    // More labels naturally become available as the user zooms in because the
    // label anchors spread apart in screen space while the text stays readable.
    const densityPaddingPx = allLabels.length >= 24 ? 10 : allLabels.length >= 14 ? 8 : 6;

    orderedLabels.forEach((label) => {
      const centerX = label.x * stageScale;
      const centerY = label.y * stageScale;
      const width = Math.max(label.estWidth * stageScale, 42) + densityPaddingPx * 2;
      const height = Math.max(label.estHeight * stageScale, 20) + densityPaddingPx * 2;

      const box: ScreenBox = {
        left: centerX - width / 2,
        right: centerX + width / 2,
        top: centerY - height / 2,
        bottom: centerY + height / 2,
      };

      if (acceptedBoxes.some((existing) => boxesOverlap(existing, box))) return;

      acceptedBoxes.push(box);
      acceptedLabels.push(label);
    });

    return acceptedLabels;
  }, [allLabels, stageScale]);

  return (
    <>
      {visibleLabels.map((d) => (
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
