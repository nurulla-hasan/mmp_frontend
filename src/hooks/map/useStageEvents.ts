
import { useRef, useCallback } from "react";
import type { Point, PinchStart } from "@/features/map-tool/types/map";
import type Konva from "konva";

import { useMapStore } from "@/features/map-tool/store/useMapStore";
import { STAGE_MIN_ZOOM, STAGE_MAX_ZOOM } from "@/features/map-tool/utils/canvas";

type ClientXY = { clientX: number; clientY: number };

const getDistance = (p1: ClientXY, p2: ClientXY) =>
  Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);

const getMidpoint = (p1: ClientXY, p2: ClientXY) => ({
  x: (p1.clientX + p2.clientX) / 2,
  y: (p1.clientY + p2.clientY) / 2,
});
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const useStageEvents = () => {
  const isPinchingRef = useRef<boolean>(false);
  const lastPinchDistRef = useRef<number>(0);
  const pinchStartRef = useRef<PinchStart>({
    distance: 0,
    scale: 1,
    stagePos: { x: 0, y: 0 },
    centerClient: { x: 0, y: 0 },
  });
  const blockTapRef = useRef<boolean>(false);
  const pinchLastStartRef = useRef<number>(0);
  const touchSessionRef = useRef<{
    active: boolean;
    single: boolean;
    moved: boolean;
    startClient: Point;
    startTime: number;
  }>({
    active: false,
    single: true,
    moved: false,
    startClient: { x: 0, y: 0 },
    startTime: 0,
  });
  const pinchRafRef = useRef<number>(0);
  // rAF ref for snapHint throttle
  const snapRafRef = useRef<number>(0);

  const TAP_GRACE_MS = 200;
  const TAP_MIN_MS = 50;

  const {
    mode,
    isPlotFinished,
    plotPoints,
    snapHint,
    setSnapHint,
    setIsPinching,
    stageScale,
    stagePos,
    setStagePos,
    getStageCenterPoint,
    setStageScale,
  } = useMapStore();

  // Keep latest values in refs so callbacks don't go stale and don't need to be recreated
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const isPlotFinishedRef = useRef(isPlotFinished);
  isPlotFinishedRef.current = isPlotFinished;
  const plotPointsRef = useRef(plotPoints);
  plotPointsRef.current = plotPoints;
  const snapHintRef = useRef(snapHint);
  snapHintRef.current = snapHint;
  const stageScaleRef = useRef(stageScale);
  stageScaleRef.current = stageScale;

  const zoomAtPoint = useCallback(
    (s: number, p: Point, meta: { scale: number; pos: Point }) => {
      const stage = document.querySelector(".konvajs-content")?.parentElement;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const pointerX = p.x - rect.left;
      const pointerY = p.y - rect.top;
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
    [setStageScale, setStagePos],
  );

  // Helper: check snap and update only if changed (throttled via rAF)
  const checkSnapThrottled = useCallback(() => {
    if (snapRafRef.current) return; // already queued
    snapRafRef.current = requestAnimationFrame(() => {
      snapRafRef.current = 0;
      const curMode = modeRef.current;
      const curFinished = isPlotFinishedRef.current;
      const curPoints = plotPointsRef.current;
      const curSnapHint = snapHintRef.current;
      const SNAP_DISTANCE = 20 / stageScaleRef.current;

      if (curMode === "drawing_plot" && !curFinished && curPoints.length >= 3) {
        const pos = getStageCenterPoint();
        const first = curPoints[0];
        const near = Math.hypot(pos.x - first.x, pos.y - first.y) <= SNAP_DISTANCE;
        if (near !== curSnapHint) setSnapHint(near);
      } else if (curMode === "drawing_plot" && curSnapHint) {
        setSnapHint(false);
      }
    });
  }, [getStageCenterPoint, setSnapHint]);

  // onMouseMove — stable reference, no plotPoints in deps
  const onMouseMove = useCallback(() => {
    checkSnapThrottled();
  }, [checkSnapThrottled]);

  const onTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (touches && touches.length >= 2) {
        isPinchingRef.current = true;
        setIsPinching(true);
        const d = getDistance(touches[0], touches[1]);
        lastPinchDistRef.current = d;
        pinchStartRef.current = {
          distance: d,
          scale: stageScale,
          stagePos: { ...stagePos },
          centerClient: getMidpoint(touches[0], touches[1]),
        };
        blockTapRef.current = true;
        pinchLastStartRef.current = Date.now();
        touchSessionRef.current.active = false;
      } else if (touches && touches.length === 1) {
        touchSessionRef.current = {
          active: true,
          single: true,
          moved: false,
          startClient: { x: touches[0].clientX, y: touches[0].clientY },
          startTime: Date.now(),
        };
        pinchLastStartRef.current = 0;
      }
    },
    [setIsPinching, stageScale, stagePos],
  );

  const TOUCH_MOVE_THRESHOLD = 8;

  const onTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (isPinchingRef.current && touches && touches.length >= 2) {
        blockTapRef.current = true;
        const newDist = getDistance(touches[0], touches[1]);
        const start = pinchStartRef.current;
        const delta = Math.abs(newDist - (lastPinchDistRef.current || 0));
        if (delta < 0.5) return;
        if (!pinchRafRef.current) {
          pinchRafRef.current = requestAnimationFrame(() => {
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
      } else if (touches && touches.length === 1 && touchSessionRef.current?.active) {
        const start = touchSessionRef.current.startClient;
        const moved =
          Math.hypot(
            touches[0].clientX - start.x,
            touches[0].clientY - start.y,
          ) > TOUCH_MOVE_THRESHOLD;
        if (moved) touchSessionRef.current.moved = true;
      }

      // Throttled snap check for touch too
      if (touches && touches.length === 1) {
        checkSnapThrottled();
      } else if (modeRef.current === "drawing_plot" && snapHintRef.current) {
        setSnapHint(false);
      }
    },
    [zoomAtPoint, checkSnapThrottled, setSnapHint],
  );

  const onTouchEnd = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = e.evt.touches;
      if (isPinchingRef.current) {
        if (touches && touches.length === 1) {
          isPinchingRef.current = false;
          setIsPinching(false);
          lastPinchDistRef.current = 0;
          pinchStartRef.current = {
            distance: 0,
            scale: stageScale,
            stagePos: { ...stagePos },
            centerClient: { x: 0, y: 0 },
          };
          blockTapRef.current = false;
          touchSessionRef.current = {
            active: true,
            single: true,
            moved: false,
            startClient: { x: touches[0].clientX, y: touches[0].clientY },
            startTime: Date.now(),
          };
          return;
        }
        isPinchingRef.current = false;
        setIsPinching(false);
        lastPinchDistRef.current = 0;
        pinchStartRef.current = {
          distance: 0,
          scale: stageScale,
          stagePos: { ...stagePos },
          centerClient: { x: 0, y: 0 },
        };
        blockTapRef.current = false;
        touchSessionRef.current.active = false;
        return;
      }

      if (!touches || touches.length < 2) {
        isPinchingRef.current = false;
        setIsPinching(false);
        lastPinchDistRef.current = 0;
        pinchStartRef.current = {
          distance: 0,
          scale: stageScale,
          stagePos: { ...stagePos },
          centerClient: { x: 0, y: 0 },
        };
        if (blockTapRef.current) {
          blockTapRef.current = false;
          touchSessionRef.current.active = false;
          return;
        }
        if (
          touchSessionRef.current?.active &&
          touchSessionRef.current?.single &&
          !touchSessionRef.current?.moved
        ) {
          const now = Date.now();
          const dur = now - (touchSessionRef.current.startTime || now);
          const startTime = touchSessionRef.current.startTime || now;
          const pinchWithinWindow =
            (pinchLastStartRef.current || 0) >= startTime &&
            (pinchLastStartRef.current || 0) - startTime <= TAP_GRACE_MS;
          if (pinchWithinWindow || dur < TAP_MIN_MS) {
            touchSessionRef.current.active = false;
            return;
          }
        }
        touchSessionRef.current.active = false;
      }
    },
    [setIsPinching, stageScale, stagePos, TAP_GRACE_MS, TAP_MIN_MS],
  );

  const onDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== e.currentTarget) return;
      setStagePos(e.target.position());
      checkSnapThrottled();
    },
    [setStagePos, checkSnapThrottled],
  );

  const onDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (e.target !== e.currentTarget) return;
      setStagePos(e.target.position());
    },
    [setStagePos],
  );

  return {
    onMouseMove,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onDragMove,
    onDragEnd,
  };
};
