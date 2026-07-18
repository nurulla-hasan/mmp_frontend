'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Group, Image as KonvaImage, Layer, Line, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import {
  Crop,
  Eraser,
  Eye,
  EyeOff,
  Hand,
  Pencil,
  Redo2,
  RotateCcw,
  Type,
  Undo2,
} from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type StudioEditorTool,
  useMouzaMapStudioStore,
} from '../store/useMouzaMapStudioStore';

const MIN_SCALE = 0.03;
const MAX_SCALE = 16;
let strokeId = 0;
let textId = 0;

const toolDefinitions: Array<{
  id: StudioEditorTool;
  label: string;
  icon: typeof Hand;
}> = [
  { id: 'pan', label: 'সরান / Zoom', icon: Hand },
  { id: 'cleanup', label: 'Cleanup brush', icon: Eraser },
  { id: 'text', label: 'লেখা বসান', icon: Type },
  { id: 'mark', label: 'Mark আঁকুন', icon: Pencil },
];

export default function StudioEditorLayout({
  onOpenCrop,
}: {
  onOpenCrop: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const drawingStrokeRef = useRef<string | null>(null);
  const pinchRef = useRef<{
    distance: number;
    imagePoint: { x: number; y: number };
    scale: number;
  } | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [showEdits, setShowEdits] = useState(true);
  const [cleanupWidth, setCleanupWidth] = useState(36);
  const [markWidth, setMarkWidth] = useState(4);
  const [annotationColor, setAnnotationColor] = useState('#DC2626');
  const [fontSize, setFontSize] = useState(28);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const {
    editorImage,
    editorTool,
    editorStrokes,
    editorTexts,
    editorPast,
    editorFuture,
    setEditorTool,
    startEditorStroke,
    appendEditorStrokePoint,
    addEditorText,
    updateEditorText,
    moveEditorText,
    deleteEditorText,
    undoEditor,
    redoEditor,
    clearEditor,
  } = useMouzaMapStudioStore(useShallow((state) => ({
    editorImage: state.editorImage,
    editorTool: state.editorTool,
    editorStrokes: state.editorStrokes,
    editorTexts: state.editorTexts,
    editorPast: state.editorPast,
    editorFuture: state.editorFuture,
    setEditorTool: state.setEditorTool,
    startEditorStroke: state.startEditorStroke,
    appendEditorStrokePoint: state.appendEditorStrokePoint,
    addEditorText: state.addEditorText,
    updateEditorText: state.updateEditorText,
    moveEditorText: state.moveEditorText,
    deleteEditorText: state.deleteEditorText,
    undoEditor: state.undoEditor,
    redoEditor: state.redoEditor,
    clearEditor: state.clearEditor,
  })));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);
    setStageSize({ width: element.clientWidth, height: element.clientHeight });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!editorImage || stageSize.width === 0 || stageSize.height === 0) return;

    const imageWidth = editorImage.naturalWidth || editorImage.width;
    const imageHeight = editorImage.naturalHeight || editorImage.height;
    const scale = Math.min(
      (stageSize.width - 80) / imageWidth,
      (stageSize.height - 96) / imageHeight,
      1,
    );

    setStageScale(scale);
    setStagePosition({
      x: (stageSize.width - imageWidth * scale) / 2,
      y: (stageSize.height - imageHeight * scale) / 2,
    });
  }, [editorImage, stageSize]);

  const getImagePoint = useCallback(() => {
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) return null;

    return {
      x: (pointer.x - stagePosition.x) / stageScale,
      y: (pointer.y - stagePosition.y) / stageScale,
    };
  }, [stagePosition, stageScale]);

  const beginEdit = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if ('touches' in event.evt && event.evt.touches.length !== 1) return;
      if ('button' in event.evt && event.evt.button !== 0) return;
      if (editorTool === 'pan') return;

      const point = getImagePoint();
      if (!point) return;

      if (editorTool === 'text') {
        const id = `studio_text_${++textId}`;
        addEditorText({
          id,
          x: point.x,
          y: point.y,
          text: '',
          color: annotationColor,
          fontSize,
        });
        setEditingTextId(id);
        return;
      }

      const id = `studio_stroke_${++strokeId}`;
      drawingStrokeRef.current = id;
      startEditorStroke({
        id,
        kind: editorTool,
        points: [point],
        color: editorTool === 'cleanup' ? '#FFFFFF' : annotationColor,
        width: editorTool === 'cleanup' ? cleanupWidth : markWidth,
      });
    },
    [
      editorTool,
      getImagePoint,
      addEditorText,
      annotationColor,
      fontSize,
      startEditorStroke,
      cleanupWidth,
      markWidth,
    ],
  );

  const continueEdit = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const id = drawingStrokeRef.current;
      if (!id) return;
      if ('touches' in event.evt && event.evt.touches.length !== 1) {
        drawingStrokeRef.current = null;
        return;
      }

      const point = getImagePoint();
      if (point) appendEditorStrokePoint(id, point);
    },
    [appendEditorStrokePoint, getImagePoint],
  );

  const finishEdit = useCallback(() => {
    drawingStrokeRef.current = null;
  }, []);

  const getTouchGeometry = useCallback((touches: TouchList) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds || touches.length < 2) return null;

    const first = touches[0];
    const second = touches[1];
    const center = {
      x: (first.clientX + second.clientX) / 2 - bounds.left,
      y: (first.clientY + second.clientY) / 2 - bounds.top,
    };

    return {
      center,
      distance: Math.hypot(
        second.clientX - first.clientX,
        second.clientY - first.clientY,
      ),
    };
  }, []);

  const handleTouchStart = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.touches.length === 2) {
        event.evt.preventDefault();
        drawingStrokeRef.current = null;
        stageRef.current?.stopDrag();
        const geometry = getTouchGeometry(event.evt.touches);
        if (!geometry) return;

        pinchRef.current = {
          distance: geometry.distance,
          imagePoint: {
            x: (geometry.center.x - stagePosition.x) / stageScale,
            y: (geometry.center.y - stagePosition.y) / stageScale,
          },
          scale: stageScale,
        };
        return;
      }

      beginEdit(event);
    },
    [beginEdit, getTouchGeometry, stagePosition, stageScale],
  );

  const handleTouchMove = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.touches.length === 2 && pinchRef.current) {
        event.evt.preventDefault();
        const geometry = getTouchGeometry(event.evt.touches);
        if (!geometry) return;

        const nextScale = Math.max(
          MIN_SCALE,
          Math.min(
            MAX_SCALE,
            pinchRef.current.scale *
              (geometry.distance / Math.max(1, pinchRef.current.distance)),
          ),
        );

        setStageScale(nextScale);
        setStagePosition({
          x: geometry.center.x - pinchRef.current.imagePoint.x * nextScale,
          y: geometry.center.y - pinchRef.current.imagePoint.y * nextScale,
        });
        return;
      }

      continueEdit(event);
    },
    [continueEdit, getTouchGeometry],
  );

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
    finishEdit();
  }, [finishEdit]);

  const handleWheel = useCallback(
    (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!pointer) return;

      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(
          MAX_SCALE,
          stageScale * (event.evt.deltaY < 0 ? 1.12 : 1 / 1.12),
        ),
      );

      setStagePosition({
        x: pointer.x - (pointer.x - stagePosition.x) * (nextScale / stageScale),
        y: pointer.y - (pointer.y - stagePosition.y) * (nextScale / stageScale),
      });
      setStageScale(nextScale);
    },
    [stagePosition, stageScale],
  );

  const selectedText = editorTexts.find((item) => item.id === editingTextId);
  const textEditorPosition = selectedText
    ? {
        x: selectedText.x * stageScale + stagePosition.x,
        y: selectedText.y * stageScale + stagePosition.y,
      }
    : null;

  const controlLabel = editorTool === 'cleanup'
    ? 'Brush size'
    : editorTool === 'mark'
      ? 'Line size'
      : editorTool === 'text'
        ? 'Text size'
        : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#151515]"
      style={{
        touchAction: 'none',
        cursor:
          editorTool === 'pan'
            ? 'grab'
            : editorTool === 'text'
              ? 'text'
              : 'crosshair',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={stagePosition.x}
        y={stagePosition.y}
        scaleX={stageScale}
        scaleY={stageScale}
        draggable={editorTool === 'pan'}
        onDragEnd={(event) =>
          setStagePosition({ x: event.target.x(), y: event.target.y() })
        }
        onWheel={handleWheel}
        onMouseDown={beginEdit}
        onMouseMove={continueEdit}
        onMouseUp={finishEdit}
        onMouseLeave={finishEdit}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Layer>
          {editorImage && (
            <KonvaImage
              image={editorImage}
              listening={false}
              perfectDrawEnabled={false}
            />
          )}

          {showEdits && (
            <Group>
              {editorStrokes.map((stroke) => (
                <Line
                  key={stroke.id}
                  points={stroke.points.flatMap((point) => [point.x, point.y])}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  lineCap="round"
                  lineJoin="round"
                  perfectDrawEnabled={false}
                  listening={false}
                />
              ))}

              {editorTexts.map((item) =>
                item.text ? (
                  <Text
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    text={item.text}
                    fill={item.color}
                    fontSize={item.fontSize}
                    fontStyle="bold"
                    align="center"
                    width={240}
                    offsetX={120}
                    offsetY={item.fontSize / 2}
                    draggable={editorTool === 'pan'}
                    onDragEnd={(event) =>
                      moveEditorText(
                        item.id,
                        event.target.x(),
                        event.target.y(),
                      )
                    }
                    onDblClick={() => setEditingTextId(item.id)}
                    onDblTap={() => setEditingTextId(item.id)}
                  />
                ) : null,
              )}
            </Group>
          )}
        </Layer>
      </Stage>

      <div className="absolute right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-1 rounded-2xl border border-border bg-background/95 p-1.5 shadow-xl">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="একসাথে crop"
          onClick={onOpenCrop}
        >
          <Crop className="size-4" />
        </Button>

        <div className="mx-auto h-px w-7 bg-border" />

        {toolDefinitions.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant={editorTool === id ? 'default' : 'ghost'}
            size="icon"
            title={label}
            onClick={() => setEditorTool(id)}
          >
            <Icon className="size-4" />
          </Button>
        ))}

        <div className="mx-auto h-px w-7 bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={showEdits ? 'Original দেখুন' : 'Edited দেখুন'}
          onClick={() => setShowEdits((value) => !value)}
        >
          {showEdits ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Undo"
          disabled={editorPast.length === 0}
          onClick={undoEditor}
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Redo"
          disabled={editorFuture.length === 0}
          onClick={redoEditor}
        >
          <Redo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="সব edit মুছুন"
          disabled={editorStrokes.length === 0 && editorTexts.length === 0}
          onClick={() => {
            if (window.confirm('সব cleanup, text ও mark মুছে ফেলবেন?')) {
              clearEditor();
            }
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {controlLabel && (
        <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-background/95 px-4 py-2 text-xs shadow-xl">
          <span className="whitespace-nowrap font-medium">{controlLabel}</span>

          {editorTool === 'cleanup' && (
            <input
              type="range"
              min={8}
              max={100}
              value={cleanupWidth}
              onChange={(event) => setCleanupWidth(Number(event.target.value))}
            />
          )}

          {editorTool === 'mark' && (
            <input
              type="range"
              min={1}
              max={16}
              value={markWidth}
              onChange={(event) => setMarkWidth(Number(event.target.value))}
            />
          )}

          {editorTool === 'text' && (
            <input
              type="range"
              min={14}
              max={72}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          )}

          {editorTool !== 'cleanup' && (
            <input
              type="color"
              value={annotationColor}
              onChange={(event) => setAnnotationColor(event.target.value)}
              title="রং"
              className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          )}

          <span className="tabular-nums text-muted-foreground">
            {editorTool === 'cleanup'
              ? cleanupWidth
              : editorTool === 'mark'
                ? markWidth
                : fontSize}
            px
          </span>
        </div>
      )}

      {selectedText && textEditorPosition && (
        <div
          className="absolute z-40 -translate-x-1/2 -translate-y-full pb-3"
          style={{ left: textEditorPosition.x, top: textEditorPosition.y }}
        >
          <input
            autoFocus
            value={selectedText.text}
            placeholder="দাগ নম্বর / লেখা"
            onChange={(event) =>
              updateEditorText(selectedText.id, event.target.value)
            }
            onBlur={() => {
              if (!selectedText.text.trim()) deleteEditorText(selectedText.id);
              setEditingTextId(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === 'Escape') {
                event.currentTarget.blur();
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className={cn(
              'h-9 w-44 rounded-lg border bg-background/95 px-3 text-center text-sm font-semibold shadow-xl outline-none',
              'focus:ring-2 focus:ring-primary/40',
            )}
            style={{
              color: selectedText.color,
              borderColor: selectedText.color,
            }}
          />
        </div>
      )}

      {!editorImage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Aligned map প্রস্তুত হচ্ছে...
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border/50 bg-background/80 px-2 py-1 font-mono text-[10px] text-muted-foreground">
        {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
}
