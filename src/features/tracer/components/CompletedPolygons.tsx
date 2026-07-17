import { memo } from 'react';
import { Group, Line, Text } from 'react-konva';
import { centroid, type TracerLayer } from '../store/useTracerStore';

export const CompletedPolygons = memo(function CompletedPolygons({
  layers,
  selectedPolygonId,
  selectedLayerId,
  mode,
  stageScale,
  selectPolygon,
  setPolygonLabelPosition,
}: {
  layers: TracerLayer[];
  selectedPolygonId: string | null;
  selectedLayerId: string | null;
  mode: string;
  stageScale: number;
  selectPolygon: (layerId: string | null, polyId: string | null) => void;
  setPolygonLabelPosition: (layerId: string, polyId: string, x: number, y: number) => void;
}) {
  const labelFontSize = Math.max(8, 14 / stageScale);

  return (
    <>
      {layers.map(layer =>
        layer.visible
          ? layer.polygons.map(poly => {
            const flat = poly.points.flatMap(p => [p.x, p.y]);
            const c = centroid(poly.points);
            const isSelected = selectedPolygonId === poly.id && selectedLayerId === layer.id;
            return (
              <Group key={poly.id}>
                <Line
                  name="polygon"
                  points={flat}
                  closed
                  stroke={isSelected ? '#F59E0B' : layer.color}
                  strokeWidth={(isSelected ? layer.lineWidth + 0.5 : layer.lineWidth) / stageScale}
                  fill={isSelected ? `${layer.color}1A` : 'transparent'}
                  hitStrokeWidth={14 / stageScale}
                  perfectDrawEnabled={false}
                  listening={mode === 'select'}
                  onClick={e => {
                    if (mode === 'select') {
                      e.cancelBubble = true;
                      selectPolygon(layer.id, poly.id);
                    }
                  }}
                  onTap={e => {
                    if (mode === 'select') {
                      e.cancelBubble = true;
                      selectPolygon(layer.id, poly.id);
                    }
                  }}
                />
                {poly.label ? (
                  <Text
                    x={poly.labelX ?? c.x}
                    y={poly.labelY ?? c.y}
                    text={poly.label}
                    fontSize={labelFontSize}
                    fontStyle="bold"
                    fill={layer.color}
                    align="center"
                    width={80 / stageScale}
                    offsetX={40 / stageScale}
                    offsetY={labelFontSize / 2}
                    draggable
                    onDragEnd={e => {
                      e.cancelBubble = true;
                      setPolygonLabelPosition(layer.id, poly.id, e.target.x(), e.target.y());
                    }}
                    listening={mode !== 'polygon'}
                  />
                ) : null}
              </Group>
            );
          })
          : null,
      )}
    </>
  );
});
