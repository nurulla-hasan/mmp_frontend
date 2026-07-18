import { memo, useMemo } from 'react';
import { Group, Line, Text } from 'react-konva';
import type { TracerLayer } from '../store/useTracerStore';

export const CompletedPolygons = memo(function CompletedPolygons({
  layers,
  selectedPolygonId,
  selectedLabelId,
  selectedLayerId,
  mode,
  stageScale,
  selectPolygon,
  selectLabel,
  editLabel,
  setLabelPosition,
}: {
  layers: TracerLayer[];
  selectedPolygonId: string | null;
  selectedLabelId: string | null;
  selectedLayerId: string | null;
  mode: string;
  stageScale: number;
  imageWidth?: number;
  selectPolygon: (layerId: string | null, pathId: string | null) => void;
  selectLabel: (layerId: string | null, labelId: string | null) => void;
  editLabel: (layerId: string, labelId: string) => void;
  setLabelPosition: (
    layerId: string,
    labelId: string,
    x: number,
    y: number,
  ) => void;
}) {
  const pointsByPath = useMemo(() => {
    const points = new Map<string, number[]>();

    for (const layer of layers) {
      for (const path of layer.polygons) {
        points.set(
          path.id,
          path.points.flatMap(point => [point.x, point.y]),
        );
      }
    }

    return points;
  }, [layers]);

  const labelFontSize = 14 / stageScale;
  const labelWidth = 120 / stageScale;

  return (
    <>
      {layers.map(layer =>
        layer.visible ? (
          <Group key={layer.id}>
            {layer.polygons.map(path => {
              const flatPoints = pointsByPath.get(path.id);
              if (!flatPoints) return null;

              const isSelected =
                selectedPolygonId === path.id && selectedLayerId === layer.id;

              return (
                <Line
                  key={path.id}
                  name="boundary-path"
                  points={flatPoints}
                  closed={false}
                  stroke={isSelected ? '#F59E0B' : layer.color}
                  strokeWidth={
                    (isSelected ? layer.lineWidth + 0.75 : layer.lineWidth) /
                    stageScale
                  }
                  lineCap="round"
                  lineJoin="round"
                  hitStrokeWidth={14 / stageScale}
                  perfectDrawEnabled={false}
                  listening={mode === 'select'}
                  onClick={event => {
                    event.cancelBubble = true;
                    selectPolygon(layer.id, path.id);
                  }}
                  onTap={event => {
                    event.cancelBubble = true;
                    selectPolygon(layer.id, path.id);
                  }}
                />
              );
            })}

            {layer.labels.map(label => {
              if (!label.text) return null;

              const isSelected =
                selectedLabelId === label.id && selectedLayerId === layer.id;

              return (
                <Text
                  key={label.id}
                  name="dag-label"
                  x={label.x}
                  y={label.y}
                  text={label.text}
                  fontSize={labelFontSize}
                  fontStyle="bold"
                  fill={isSelected ? '#F59E0B' : layer.color}
                  align="center"
                  width={labelWidth}
                  offsetX={labelWidth / 2}
                  offsetY={labelFontSize / 2}
                  padding={3 / stageScale}
                  draggable={mode === 'select'}
                  listening={mode === 'select'}
                  onClick={event => {
                    event.cancelBubble = true;
                    selectLabel(layer.id, label.id);
                  }}
                  onTap={event => {
                    event.cancelBubble = true;
                    selectLabel(layer.id, label.id);
                  }}
                  onDblClick={event => {
                    event.cancelBubble = true;
                    editLabel(layer.id, label.id);
                  }}
                  onDblTap={event => {
                    event.cancelBubble = true;
                    editLabel(layer.id, label.id);
                  }}
                  onDragStart={event => {
                    event.cancelBubble = true;
                    selectLabel(layer.id, label.id);
                  }}
                  onDragEnd={event => {
                    event.cancelBubble = true;
                    setLabelPosition(
                      layer.id,
                      label.id,
                      event.target.x(),
                      event.target.y(),
                    );
                  }}
                />
              );
            })}
          </Group>
        ) : null,
      )}
    </>
  );
});

