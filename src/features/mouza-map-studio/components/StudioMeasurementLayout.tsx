'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Layer, Line, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { Crosshair, Hand, Ruler, Scale, Trash2 } from 'lucide-react';

import { CompletedPolygons } from '@/features/tracer/components/CompletedPolygons';
import { useTracerStore } from '@/features/tracer/store/useTracerStore';
import { cn, ErrorToast, SuccessToast } from '@/lib/utils';
import { useMouzaMapStudioStore, type StudioPoint, type StudioUnit } from '../store/useMouzaMapStudioStore';
import { formatArea, formatDistance, pointDistance, polygonPixelArea } from '../utils/measurement';

type MeasurementTool = 'pan' | 'calibrate' | 'distance';

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 12;

const ignoreSelection = () => undefined;
const ignoreLabelMove = () => undefined;
const ignoreLabelEdit = () => undefined;

export default function StudioMeasurementLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const lastPinchRef = useRef<{ distance: number; center: StudioPoint } | null>(null);
  const blockTapRef = useRef(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<MeasurementTool>('pan');
  const [draftPoints, setDraftPoints] = useState<StudioPoint[]>([]);
  const [knownDistance, setKnownDistance] = useState('');
  const [knownUnit, setKnownUnit] = useState<StudioUnit>('ft');

  const backgroundImage = useTracerStore((state) => state.backgroundImage);
  const layers = useTracerStore((state) => state.layers);
  const activeLayerId = useTracerStore((state) => state.activeLayerId);
  const {
    calibration,
    dimensions,
    setCalibration,
    addDimension,
    removeDimension,
    clearDimensions,
  } = useMouzaMapStudioStore();

  const renderLayers = useMemo(() => {
    const activeIndex = layers.findIndex((layer) => layer.id === activeLayerId);
    if (activeIndex < 0 || activeIndex === layers.length - 1) return layers;
    return [
      ...layers.slice(0, activeIndex),
      ...layers.slice(activeIndex + 1),
      layers[activeIndex],
    ];
  }, [layers, activeLayerId]);

  const polygonAreas = useMemo(() => {
    if (!calibration) return [];
    return layers.flatMap((layer) =>
      layer.visible
        ? layer.polygons.map((polygon, index) => ({
            id: polygon.id,
            label: polygon.label || `Plot ${index + 1}`,
            layerName: layer.name,
            color: layer.color,
            area: polygonPixelArea(polygon.points) * calibration.unitsPerPixel ** 2,
          }))
        : [],
    );
  }, [layers, calibration]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    setStageSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!backgroundImage || stageSize.width === 0 || stageSize.height === 0) return;
    const width = backgroundImage.naturalWidth || backgroundImage.width;
    const height = backgroundImage.naturalHeight || backgroundImage.height;
    const scale = Math.min((stageSize.width - 64) / width, (stageSize.height - 64) / height, 1);
    const frame = requestAnimationFrame(() => {
      setStageScale(scale);
      setStagePosition({
        x: (stageSize.width - width * scale) / 2,
        y: (stageSize.height - height * scale) / 2,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [backgroundImage, stageSize]);

  const selectTool = (nextTool: MeasurementTool) => {
    setTool(nextTool);
    setDraftPoints([]);
  };

  const getImagePoint = useCallback((): StudioPoint | null => {
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };
  }, [stagePosition, stageScale]);

  const handlePointPlacement = useCallback((event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (tool === 'pan' || blockTapRef.current) return;
    if ('button' in event.evt && event.evt.button !== 0) return;
    const point = getImagePoint();
    if (!point) return;

    if (tool === 'calibrate') {
      setDraftPoints((current) => current.length >= 2 ? [point] : [...current, point]);
      return;
    }

    if (!calibration) {
      ErrorToast('Distance মাপার আগে scale সেট করুন');
      setTool('calibrate');
      setDraftPoints([point]);
      return;
    }

    setDraftPoints((current) => {
      if (current.length === 0) return [point];
      const start = current[0];
      addDimension({
        id: `dimension_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        start,
        end: point,
      });
      return [];
    });
  }, [tool, getImagePoint, calibration, addDimension]);

  const handleWheel = useCallback((event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return;

    const direction = event.evt.deltaY > 0 ? -1 : 1;
    const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, stageScale * (direction > 0 ? 1.1 : 0.9)));
    const mapPoint = {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };
    setStageScale(nextScale);
    setStagePosition({
      x: pointer.x - mapPoint.x * nextScale,
      y: pointer.y - mapPoint.y * nextScale,
    });
  }, [stagePosition, stageScale]);

  const handleTouchMove = useCallback((event: Konva.KonvaEventObject<TouchEvent>) => {
    const touches = event.evt.touches;
    if (touches.length !== 2 || !containerRef.current) return;
    event.evt.preventDefault();
    stageRef.current?.stopDrag();
    blockTapRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const first = { x: touches[0].clientX - rect.left, y: touches[0].clientY - rect.top };
    const second = { x: touches[1].clientX - rect.left, y: touches[1].clientY - rect.top };
    const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
    const distance = pointDistance(first, second);
    const previous = lastPinchRef.current;

    if (previous && previous.distance > 0) {
      const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, stageScale * (distance / previous.distance)));
      const mapPoint = {
        x: (previous.center.x - stagePosition.x) / stageScale,
        y: (previous.center.y - stagePosition.y) / stageScale,
      };
      setStageScale(nextScale);
      setStagePosition({
        x: center.x - mapPoint.x * nextScale,
        y: center.y - mapPoint.y * nextScale,
      });
    }
    lastPinchRef.current = { distance, center };
  }, [stagePosition, stageScale]);

  const handleTouchEnd = useCallback(() => {
    lastPinchRef.current = null;
    window.setTimeout(() => {
      blockTapRef.current = false;
    }, 180);
  }, []);

  const applyCalibration = () => {
    const realDistance = Number(knownDistance);
    if (draftPoints.length !== 2 || !Number.isFinite(realDistance) || realDistance <= 0) {
      ErrorToast('Map-এ দুইটি point দিন এবং সঠিক distance লিখুন');
      return;
    }
    const pixelDistance = pointDistance(draftPoints[0], draftPoints[1]);
    if (pixelDistance <= 0) return;

    setCalibration({
      pixelDistance,
      realDistance,
      unitsPerPixel: realDistance / pixelDistance,
      unit: knownUnit,
    });
    setDraftPoints([]);
    setTool('distance');
    SuccessToast('Map scale সেট হয়েছে');
  };

  const draftDistance = draftPoints.length === 2 ? pointDistance(draftPoints[0], draftPoints[1]) : 0;
  const markerRadius = 5 / stageScale;
  const lineWidth = 2 / stageScale;
  const labelFontSize = 14 / stageScale;

  return (
    <div ref={containerRef} className="relative h-dvh w-full overflow-hidden bg-[#111]">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={stagePosition.x}
        y={stagePosition.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={tool === 'pan'}
        onDragEnd={(event) => setStagePosition({ x: event.target.x(), y: event.target.y() })}
        onWheel={handleWheel}
        onClick={handlePointPlacement}
        onTap={handlePointPlacement}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundColor: '#121212',
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
          cursor: tool === 'pan' ? 'grab' : 'crosshair',
        }}
      >
        <Layer>
          {backgroundImage && (
            <KonvaImage image={backgroundImage} listening={false} perfectDrawEnabled={false} />
          )}
          <CompletedPolygons
            layers={renderLayers}
            selectedPolygonId={null}
            selectedLayerId={null}
            mode="polygon"
            stageScale={stageScale}
            selectPolygon={ignoreSelection}
            editPolygonLabel={ignoreLabelEdit}
            setPolygonLabelPosition={ignoreLabelMove}
          />

          {dimensions.map((dimension) => {
            const measuredDistance = calibration
              ? pointDistance(dimension.start, dimension.end) * calibration.unitsPerPixel
              : 0;
            const middle = {
              x: (dimension.start.x + dimension.end.x) / 2,
              y: (dimension.start.y + dimension.end.y) / 2,
            };
            return (
              <Group key={dimension.id} listening={false}>
                <Line
                  points={[dimension.start.x, dimension.start.y, dimension.end.x, dimension.end.y]}
                  stroke="#0EA5E9"
                  strokeWidth={lineWidth}
                  dash={[8 / stageScale, 5 / stageScale]}
                />
                <Circle x={dimension.start.x} y={dimension.start.y} radius={markerRadius} fill="#0EA5E9" />
                <Circle x={dimension.end.x} y={dimension.end.y} radius={markerRadius} fill="#0EA5E9" />
                {calibration && (
                  <Text
                    x={middle.x}
                    y={middle.y}
                    text={formatDistance(measuredDistance, calibration.unit)}
                    fontSize={labelFontSize}
                    fontStyle="bold"
                    fill="#0284C7"
                    stroke="#ffffff"
                    strokeWidth={3 / stageScale}
                    align="center"
                    width={120 / stageScale}
                    offsetX={60 / stageScale}
                    offsetY={18 / stageScale}
                  />
                )}
              </Group>
            );
          })}

          {draftPoints.length > 0 && (
            <Group listening={false}>
              {draftPoints.length === 2 && (
                <Line
                  points={[draftPoints[0].x, draftPoints[0].y, draftPoints[1].x, draftPoints[1].y]}
                  stroke="#F59E0B"
                  strokeWidth={lineWidth}
                  dash={[8 / stageScale, 5 / stageScale]}
                />
              )}
              {draftPoints.map((point, index) => (
                <Circle key={`${point.x}_${point.y}_${index}`} x={point.x} y={point.y} radius={markerRadius} fill="#F59E0B" />
              ))}
            </Group>
          )}
        </Layer>
      </Stage>

      <aside className="absolute left-3 top-20 z-50 max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#181818]/95 p-4 text-white shadow-2xl backdrop-blur">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">ম্যাপ পরিমাপ</h2>
          <p className="mt-1 text-xs text-white/55">Scale সেট করে distance ও plot area বের করুন।</p>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/5 p-1">
          {([
            ['pan', 'সরান', Hand],
            ['calibrate', 'স্কেল', Scale],
            ['distance', 'দূরত্ব', Ruler],
          ] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTool(id)}
              className={cn(
                'flex h-9 items-center justify-center gap-1 rounded-lg text-xs transition',
                tool === id ? 'bg-emerald-600 font-medium text-white' : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        {tool === 'calibrate' && (
          <div className="mt-4 space-y-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
            <div className="flex items-start gap-2 text-xs text-amber-100/80">
              <Crosshair className="mt-0.5 size-3.5 shrink-0" />
              পরিচিত একটি লাইনের দুই প্রান্তে click/tap করুন।
            </div>
            <div className="grid grid-cols-[1fr_5rem] gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={knownDistance}
                onChange={(event) => setKnownDistance(event.target.value)}
                placeholder="আসল দূরত্ব"
                className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-xs outline-none focus:border-amber-400/60"
              />
              <select
                value={knownUnit}
                onChange={(event) => setKnownUnit(event.target.value as StudioUnit)}
                className="h-9 rounded-lg border border-white/10 bg-[#222] px-2 text-xs outline-none"
              >
                <option value="ft">ফুট</option>
                <option value="m">মিটার</option>
              </select>
            </div>
            <button
              type="button"
              onClick={applyCalibration}
              disabled={draftPoints.length !== 2}
              className="h-9 w-full rounded-lg bg-amber-500 text-xs font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              স্কেল সেট করুন {draftDistance > 0 ? `(${Math.round(draftDistance)} px)` : ''}
            </button>
          </div>
        )}

        {calibration && (
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/55">বর্তমান স্কেল</span>
              <span className="font-medium text-emerald-400">
                {calibration.realDistance} {calibration.unit} = {Math.round(calibration.pixelDistance)} px
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold">Distance lines ({dimensions.length})</h3>
            {dimensions.length > 0 && (
              <button type="button" onClick={clearDimensions} className="text-[11px] text-red-400 hover:text-red-300">
                সব মুছুন
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            {dimensions.map((dimension, index) => (
              <div key={dimension.id} className="flex items-center justify-between rounded-lg bg-white/5 px-2.5 py-2 text-xs">
                <span className="text-sky-400">
                  {calibration
                    ? formatDistance(pointDistance(dimension.start, dimension.end) * calibration.unitsPerPixel, calibration.unit)
                    : `Line ${index + 1}`}
                </span>
                <button type="button" onClick={() => removeDimension(dimension.id)} aria-label="Distance মুছুন">
                  <Trash2 className="size-3.5 text-white/40 hover:text-red-400" />
                </button>
              </div>
            ))}
            {dimensions.length === 0 && <p className="py-2 text-center text-[11px] text-white/35">এখনও distance line নেই</p>}
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <h3 className="mb-2 text-xs font-semibold">Plot area ({polygonAreas.length})</h3>
          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {polygonAreas.map((plot) => (
              <div key={plot.id} className="rounded-lg bg-white/5 px-2.5 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium" style={{ color: plot.color }}>{plot.label}</span>
                  <span className="shrink-0 text-white/80">{calibration && formatArea(plot.area, calibration.unit)}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-white/35">{plot.layerName}</p>
              </div>
            ))}
            {!calibration && <p className="py-2 text-center text-[11px] text-white/35">Area দেখতে আগে scale সেট করুন</p>}
            {calibration && polygonAreas.length === 0 && <p className="py-2 text-center text-[11px] text-white/35">কোনো traced plot নেই</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}
