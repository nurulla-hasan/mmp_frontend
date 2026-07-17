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
  const hasDraggedRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const isPinchingRef = useRef<boolean>(false);
  const lastPinchDistRef = useRef<number>(0);
  const pinchStartRef = useRef({
    distance: 0,
    scale: 1,
    mousePointTo: { x: 0, y: 0 },
  });

  const stageScaleRef = useRef(stageScale);
  const stagePosRef = useRef(stagePos);

  useLayoutEffect(() => {
    stageScaleRef.current = stageScale;
    stagePosRef.current = stagePos;
  });



  const onTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches && touches.length >= 2) {
        isPinchingRef.current = true;
        const d = getDistance(touches[0], touches[1]);
        lastPinchDistRef.current = d;
        const centerClient = getMidpoint(touches[0], touches[1]);
        const stage = document.querySelector('.konvajs-content')?.parentElement;
        let mousePointTo = { x: 0, y: 0 };
        
        if (stage) {
          const rect = stage.getBoundingClientRect();
          const pointerX = centerClient.x - rect.left;
          const pointerY = centerClient.y - rect.top;
          mousePointTo = {
            x: (pointerX - stagePosRef.current.x) / stageScaleRef.current,
            y: (pointerY - stagePosRef.current.y) / stageScaleRef.current,
          };
        }

        pinchStartRef.current = {
          distance: d,
          scale: stageScaleRef.current,
          mousePointTo,
        };
      } else if (touches && touches.length === 1) {
        hasDraggedRef.current = false;
        dragStartRef.current = {
          x: touches[0].clientX,
          y: touches[0].clientY,
          px: stagePosRef.current.x,
          py: stagePosRef.current.y,
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
              const stage = document.querySelector('.konvajs-content')?.parentElement;
              if (stage) {
                const rect = stage.getBoundingClientRect();
                const pointerX = centerClient.x - rect.left;
                const pointerY = centerClient.y - rect.top;
                
                setStageScale(clamped);
                setStagePos({
                  x: pointerX - start.mousePointTo.x * clamped,
                  y: pointerY - start.mousePointTo.y * clamped,
                });
              }
            }
            lastPinchDistRef.current = newDist;
          });
        }
      } else if (touches && touches.length === 1 && dragStartRef.current && !isPinchingRef.current) {
        const touch = touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        
        if (Math.hypot(dx, dy) > 10) {
          hasDraggedRef.current = true;
        }

        if (hasDraggedRef.current) {
          if (!pinchRafRef.current) {
            pinchRafRef.current = requestAnimationFrame(() => {
              pinchRafRef.current = 0;
              setStagePos({
                x: dragStartRef.current!.px + dx,
                y: dragStartRef.current!.py + dy,
              });
            });
          }
        }
      }
    },
    [setStageScale, setStagePos]
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
          mousePointTo: { x: 0, y: 0 },
        };
      }
      
      if (!touches || touches.length === 0) {
        dragStartRef.current = null;
      }
    },
    []
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    hasDraggedRef,
  };
};
