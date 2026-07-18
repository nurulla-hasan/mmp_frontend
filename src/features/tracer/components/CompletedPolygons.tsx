import { memo, useMemo } from 'react';
import { Group, Line, Text } from 'react-konva';
import { centroid, type TracerLayer } from '../store/useTracerStore';

export const CompletedPolygons = memo(function CompletedPolygons({
  layers,
  selectedPolygonId,
  selectedLayerId,
  mode,
  stageScale,
  selectPolygon,
  editPolygonLabel,
  setPolygonLabelPosition,
}: {
  layers: TracerLayer[];
  selectedPolygonId: string | null;
  selectedLayerId: string | null;
  mode: string;
  stageScale: number;
  imageWidth?: number;
  selectPolygon: (layerId: string | null, polyId: string | null) => void;
  editPolygonLabel: (layerId: string, polyId: string) => void;
  setPolygonLabelPosition: (layerId: string, polyId: string, x: number, y: number) => void;
}) {
  const geometryByPolygon = useMemo(() => {
    const geometry = new Map<
      string,
      { flatPoints: number[]; center: { x: number; y: number }; minDimension: number }
    >();

    for (const layer of layers) {
      for (const polygon of layer.polygons) {
        const flatPoints: number[] = [];
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const point of polygon.points) {
          flatPoints.push(point.x, point.y);
          if (point.x < minX) minX = point.x;
          if (point.x > maxX) maxX = point.x;
          if (point.y < minY) minY = point.y;
          if (point.y > maxY) maxY = point.y;
        }

        geometry.set(polygon.id, {
          flatPoints,
          center: centroid(polygon.points),
          minDimension: Math.min(maxX - minX, maxY - minY),
        });
      }
    }

    return geometry;
  }, [layers]);

  return (
    <>
      {layers.map(layer =>
        layer.visible
          ? layer.polygons.map(poly => {
            const polygonGeometry = geometryByPolygon.get(poly.id);
            if (!polygonGeometry) return null;
            const { flatPoints, center, minDimension } = polygonGeometry;
            const isSelected = selectedPolygonId === poly.id && selectedLayerId === layer.id;
            
            // Text should be 14px on screen, but never larger than 40% of the polygon's smallest dimension
            // to prevent it from overflowing the polygon when zoomed out.
            const idealWorldFontSize = 14 / stageScale;
            const maxWorldFontSize = minDimension * 0.4;
            const labelFontSize = Math.min(idealWorldFontSize, maxWorldFontSize);

            return (
              <Group
                key={poly.id}
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
                onDblClick={e => {
                  if (mode === 'select') {
                    e.cancelBubble = true;
                    editPolygonLabel(layer.id, poly.id);
                  }
                }}
                onDblTap={e => {
                  if (mode === 'select') {
                    e.cancelBubble = true;
                    editPolygonLabel(layer.id, poly.id);
                  }
                }}
              >
                <Line
                  name="polygon"
                  points={flatPoints}
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
                    x={poly.labelX ?? center.x}
                    y={poly.labelY ?? center.y}
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
