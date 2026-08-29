'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Group, Image as KonvaImage, Layer, Line, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { useShallow } from 'zustand/shallow';

import { ConfirmationModal } from '@/components/common/confirmation-modal';
import {
  useMouzaMapStudioStore,
} from '../store/useMouzaMapStudioStore';
import StudioEditorToolbar from './StudioEditorToolbar';
import StudioEditorControls from './StudioEditorControls';
import StudioEditorTextInput from './StudioEditorTextInput';

const MIN_SCALE = 0.03;
const MAX_SCALE = 16;
let strokeId = 0;
let textId = 0;

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
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [prevImageSrc, setPrevImageSrc] = useState<string | null>(null);

  const {
    editorImage,
    editorTool,
    editorStrokes,
    editorTexts,
    editorFontSize,
    editorPast,
    editorFuture,
    setEditorTool,
    startEditorStroke,
    appendEditorStrokePoint,
    addEditorText,
    updateEditorText,
    setEditorFontSize,
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
    editorFontSize: state.editorFontSize,
    editorPast: state.editorPast,
    editorFuture: state.editorFuture,
    setEditorTool: state.setEditorTool,
    startEditorStroke: state.startEditorStroke,
    appendEditorStrokePoint: state.appendEditorStrokePoint,
    addEditorText: state.addEditorText,
    updateEditorText: state.updateEditorText,
    setEditorFontSize: state.setEditorFontSize,
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
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));

      if (isTyping || (!event.ctrlKey && !event.metaKey)) return;

      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redoEditor();
        } else {
          undoEditor();
        }
        return;
      }

      if (key === 'y') {
        event.preventDefault();
        redoEditor();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [undoEditor, redoEditor]);

  // Auto-fit image when it first loads or stage resizes — computed during render
  // to avoid setState inside an effect.
  if (editorImage && stageSize.width > 0 && stageSize.height > 0) {
    const currentSrc = editorImage.src;
    if (currentSrc !== prevImageSrc) {
      setPrevImageSrc(currentSrc);
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
    }
  }

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

      // Text is intentionally created only by double-click/double-tap.
      if (editorTool === 'text') return;

      const point = getImagePoint();
      if (!point) return;

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
      annotationColor,
      startEditorStroke,
      cleanupWidth,
      markWidth,
    ],
  );

  const addTextAtPointer = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (editorTool !== 'text') return;
      if ('touches' in event.evt && event.evt.touches.length > 1) return;
      if ('button' in event.evt && event.evt.button !== 0) return;

      const point = getImagePoint();
      if (!point) return;

      const id = `studio_text_${++textId}`;
      addEditorText({
        id,
        x: point.x,
        y: point.y,
        text: '',
        color: annotationColor,
        fontSize: editorFontSize,
      });
      setEditingTextId(id);
    },
    [editorTool, getImagePoint, addEditorText, annotationColor, editorFontSize],
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
  const textEditorPosition = useMemo(
    () =>
      selectedText
        ? {
            x: selectedText.x * stageScale + stagePosition.x,
            y: selectedText.y * stageScale + stagePosition.y,
          }
        : null,
    [selectedText, stageScale, stagePosition],
  );

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
        onDragEnd={(event) => {
          // Text drags bubble through Konva. Only a drag of the Stage itself
          // may update the map viewport position.
          if (event.target !== event.currentTarget) return;
          setStagePosition({ x: event.target.x(), y: event.target.y() });
        }}
        onWheel={handleWheel}
        onDblClick={addTextAtPointer}
        onDblTap={addTextAtPointer}
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
                    onDblClick={(event) => {
                      event.cancelBubble = true;
                      setEditingTextId(item.id);
                    }}
                    onDblTap={(event) => {
                      event.cancelBubble = true;
                      setEditingTextId(item.id);
                    }}
                  />
                ) : null,
              )}
            </Group>
          )}
        </Layer>
      </Stage>

      <StudioEditorToolbar
        editorTool={editorTool}
        showEdits={showEdits}
        canUndo={editorPast.length > 0}
        canRedo={editorFuture.length > 0}
        hasContent={editorStrokes.length > 0 || editorTexts.length > 0}
        onSelectTool={setEditorTool}
        onToggleShowEdits={() => setShowEdits((value) => !value)}
        onUndo={undoEditor}
        onRedo={redoEditor}
        onClear={() => setShowClearConfirmation(true)}
        onOpenCrop={onOpenCrop}
      />

      <StudioEditorControls
        editorTool={editorTool}
        cleanupWidth={cleanupWidth}
        markWidth={markWidth}
        fontSize={editorFontSize}
        annotationColor={annotationColor}
        onChangeCleanupWidth={setCleanupWidth}
        onChangeMarkWidth={setMarkWidth}
        onChangeFontSize={setEditorFontSize}
        onChangeAnnotationColor={setAnnotationColor}
      />

      {selectedText && textEditorPosition && (
        <StudioEditorTextInput
          selectedText={selectedText}
          x={textEditorPosition.x}
          y={textEditorPosition.y}
          onChange={(id, text) => updateEditorText(id, text)}
          onBlur={(id) => {
            const text = editorTexts.find((item) => item.id === id);
            if (text && !text.text.trim()) deleteEditorText(id);
            setEditingTextId(null);
          }}
        />
      )}

      {!editorImage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Aligned map প্রস্তুত হচ্ছে...
        </div>
      )}

      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border/50 bg-background/80 px-2 py-1 font-mono text-xs text-muted-foreground">
        {Math.round(stageScale * 100)}%
      </div>

      <ConfirmationModal
        open={showClearConfirmation}
        onOpenChange={setShowClearConfirmation}
        trigger={null}
        title="সব edit মুছে ফেলবেন?"
        description="সব cleanup, text ও mark মুছে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
        confirmText="সব মুছুন"
        cancelText="বাতিল"
        variant="destructive"
        onConfirm={() => {
          clearEditor();
          setEditingTextId(null);
          setShowClearConfirmation(false);
        }}
      />
    </div>
  );
}
