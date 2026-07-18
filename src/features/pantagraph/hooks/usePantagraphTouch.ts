import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type Konva from 'konva';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';
import { clamp } from '@/lib/utils';

type ClientPoint = { x: number; y: number };
type TouchPoint = { clientX: number; clientY: number };

const STAGE_MIN_ZOOM = 0.01;
const STAGE_MAX_ZOOM = 10;

const getDistance = (first: TouchPoint, second: TouchPoint) =>
  Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);

const getMidpoint = (first: TouchPoint, second: TouchPoint): ClientPoint => ({
  x: (first.clientX + second.clientX) / 2,
  y: (first.clientY + second.clientY) / 2,
});

export const usePantagraphTouch = (
  stageRef: RefObject<Konva.Stage | null>,
) => {
  const isPinchingRef = useRef(false);
  const blockTapRef = useRef(false);
  const resetTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinchRafRef = useRef(0);
  const latestPinchRef = useRef<{ distance: number; center: ClientPoint } | null>(null);
  const pinchStartRef = useRef({
    distance: 0,
    scale: 1,
    mousePointTo: { x: 0, y: 0 },
    stageRect: null as DOMRect | null,
  });

  const { stageScale, stagePos, setStageViewport } = usePantagraphStore(
    useShallow((state) => ({
      stageScale: state.stageScale,
      stagePos: state.stagePos,
      setStageViewport: state.setStageViewport,
    })),
  );

  const stageScaleRef = useRef(stageScale);
  const stagePosRef = useRef(stagePos);

  useLayoutEffect(() => {
    stageScaleRef.current = stageScale;
    stagePosRef.current = stagePos;
  }, [stageScale, stagePos]);

  useEffect(() => () => {
    if (pinchRafRef.current) cancelAnimationFrame(pinchRafRef.current);
    if (resetTapTimerRef.current) clearTimeout(resetTapTimerRef.current);
  }, []);

  const onTouchStart = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = event.evt.touches;
      if (touches.length < 2) {
        if (!isPinchingRef.current) blockTapRef.current = false;
        return;
      }

      event.evt.preventDefault();
      isPinchingRef.current = true;
      blockTapRef.current = true;
      if (resetTapTimerRef.current) clearTimeout(resetTapTimerRef.current);

      const distance = getDistance(touches[0], touches[1]);
      const center = getMidpoint(touches[0], touches[1]);
      const stageRect = stageRef.current?.container().getBoundingClientRect() ?? null;
      const pointerX = stageRect ? center.x - stageRect.left : 0;
      const pointerY = stageRect ? center.y - stageRect.top : 0;

      pinchStartRef.current = {
        distance,
        scale: stageScaleRef.current,
        mousePointTo: {
          x: (pointerX - stagePosRef.current.x) / stageScaleRef.current,
          y: (pointerY - stagePosRef.current.y) / stageScaleRef.current,
        },
        stageRect,
      };
      latestPinchRef.current = { distance, center };
    },
    [stageRef],
  );

  const onTouchMove = useCallback(
    (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (event.evt.cancelable) event.evt.preventDefault();
      const touches = event.evt.touches;
      if (!isPinchingRef.current || touches.length < 2) return;

      latestPinchRef.current = {
        distance: getDistance(touches[0], touches[1]),
        center: getMidpoint(touches[0], touches[1]),
      };
      if (pinchRafRef.current) return;

      pinchRafRef.current = requestAnimationFrame(() => {
        pinchRafRef.current = 0;
        const latest = latestPinchRef.current;
        const start = pinchStartRef.current;
        if (!latest || start.distance <= 0 || !start.stageRect) return;

        const scale = clamp(
          start.scale * (latest.distance / start.distance),
          STAGE_MIN_ZOOM,
          STAGE_MAX_ZOOM,
        );
        const pointerX = latest.center.x - start.stageRect.left;
        const pointerY = latest.center.y - start.stageRect.top;
        setStageViewport(scale, {
          x: pointerX - start.mousePointTo.x * scale,
          y: pointerY - start.mousePointTo.y * scale,
        });
      });
    },
    [setStageViewport],
  );

  const onTouchEnd = useCallback((event: Konva.KonvaEventObject<TouchEvent>) => {
    if (event.evt.touches.length >= 2) return;

    const wasPinching = isPinchingRef.current;
    isPinchingRef.current = false;
    latestPinchRef.current = null;
    pinchStartRef.current = {
      distance: 0,
      scale: stageScaleRef.current,
      mousePointTo: { x: 0, y: 0 },
      stageRect: null,
    };

    if (wasPinching) {
      if (resetTapTimerRef.current) clearTimeout(resetTapTimerRef.current);
      resetTapTimerRef.current = setTimeout(() => {
        blockTapRef.current = false;
        resetTapTimerRef.current = null;
      }, 250);
    }
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, blockTapRef };
};
