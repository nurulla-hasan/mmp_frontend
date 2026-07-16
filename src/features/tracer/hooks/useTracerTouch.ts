import { useRef, useCallback, useLayoutEffect } from 'react';
import type Konva from 'konva';
import { clamp } from '@/lib/utils';

type ClientXY = { clientX: number; clientY: number };

const getDistance = (p1: ClientXY, p2: ClientXY) =>
  Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);

const getMidpoint = (p1: ClientXY, p2: ClientXY) => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
});

const STAGE_MIN_ZOOM = 0.01;
const STAGE_MAX_ZOOM = 10;

export const useTracerTouch = (
  stageScale: number,
  setStageScale: (s: number) => void,
  stagePos: { x: number; y: number },
  setStagePos: (p: { x: number; y: number }) => void
) => {
  const isPinchingRef = useRef<boolean>(false);
  const lastPinchDistRef = useRef<number>(0);
  const pinchStartRef = useRef({
    distance: 0,
    scale: 1,
    stagePos: { x: 0, y: 0 },
    centerClient: { x: 0, y: 0 },
  });

  const stageScaleRef = useRef(stageScale);
  const stagePosRef = useRef(stagePos);

  useLayoutEffect(() => {
    stageScaleRef.current = stageScale;
    stagePosRef.current = stagePos;
  });

  const zoomAtPoint = useCallback(
    (s: number, centerClient: { x: number; y: number }, meta: { scale: number; pos: { x: number; y: number } }) => {
      // Find the stage container to get bounding rect
      const stage = document.querySelector('.konvajs-content')?.parentElement;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const pointerX = centerClient.x - rect.left;
      const pointerY = centerClient.y - rect.top;
      
      const mousePointTo = {
        x: (pointerX - meta.pos.x) / meta.scale,
        y: (pointerY - meta.pos.y) / meta.scale,
      };
      
      setStageScale(s);
      setStagePos({
        x: pointerX - mousePointTo.x * s,
        y: pointerY - mousePointTo.y * s,
      });
    },
    [setStageScale, setStagePos]
  );

  const onTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches && touches.length >= 2) {
        isPinchingRef.current = true;
        const d = getDistance(touches[0], touches[1]);
        lastPinchDistRef.current = d;
        pinchStartRef.current = {
          distance: d,
          scale: stageScaleRef.current,
          stagePos: { ...stagePosRef.current },
          centerClient: getMidpoint(touches[0], touches[1]),
        };
      }
    },
    []
  );

  const pinchRafRef = useRef<number>(0);

  const onTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (e.evt.cancelable) {
        e.evt.preventDefault();
      }
      
      if (isPinchingRef.current && touches && touches.length >= 2) {
        const newDist = getDistance(touches[0], touches[1]);
        const start = pinchStartRef.current;
        const delta = Math.abs(newDist - (lastPinchDistRef.current || 0));
        if (delta < 0.5) return;
        
        if (!pinchRafRef.current) {
          pinchRafRef.current = window.requestAnimationFrame(() => {
            pinchRafRef.current = 0;
            if (start && start.distance > 0) {
              const rawScale = start.scale * (newDist / start.distance);
              const clamped = clamp(rawScale, STAGE_MIN_ZOOM, STAGE_MAX_ZOOM);
              const centerClient = getMidpoint(touches[0], touches[1]);
              zoomAtPoint(clamped, centerClient, {
                scale: start.scale,
                pos: start.stagePos,
              });
            }
            lastPinchDistRef.current = newDist;
          });
        }
      }
    },
    [zoomAtPoint]
  );

  const onTouchEnd = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (!touches || touches.length < 2) {
        isPinchingRef.current = false;
        lastPinchDistRef.current = 0;
        pinchStartRef.current = {
          distance: 0,
          scale: stageScaleRef.current,
          stagePos: { ...stagePosRef.current },
          centerClient: { x: 0, y: 0 },
        };
      }
    },
    []
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
