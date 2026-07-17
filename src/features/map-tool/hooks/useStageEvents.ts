
import { useRef, useCallback, useLayoutEffect } from "react";
import type { Point, PinchStart } from "@/features/map-tool/types/map";
import type Konva from "konva";

import { useShallow } from 'zustand/shallow';
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
  const pinchStartRef = useRef<PinchStart & { mousePointTo?: Point }>({
    distance: 0,
    scale: 1,
    stagePos: { x: 0, y: 0 },
    centerClient: { x: 0, y: 0 },
    mousePointTo: { x: 0, y: 0 },
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
  // Track if mouse dragged to avoid click-after-drag
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const CLICK_MOVE_THRESHOLD = 5;

  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastDeviceRef = useRef<'mouse' | 'touch'>('touch');

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
    setStageScale,
  } = useMapStore(useShallow((s) => ({
    mode: s.mode,
    isPlotFinished: s.isPlotFinished,
    plotPoints: s.plotPoints,
    snapHint: s.snapHint,
    setSnapHint: s.setSnapHint,
    setIsPinching: s.setIsPinching,
    stageScale: s.stageScale,
    stagePos: s.stagePos,
    setStagePos: s.setStagePos,
    getStageCenterPoint: s.getStageCenterPoint,
    setStageScale: s.setStageScale,
  })));

  // Keep latest values in refs so callbacks don't go stale and don't need to be recreated.
  // useLayoutEffect runs synchronously after every render, before the browser paints,
  // so refs are always fresh when event handlers fire.
  const modeRef = useRef(mode);
  const isPlotFinishedRef = useRef(isPlotFinished);
  const plotPointsRef = useRef(plotPoints);
  const snapHintRef = useRef(snapHint);
  const stageScaleRef = useRef(stageScale);
  const stagePosRef = useRef(stagePos);

  useLayoutEffect(() => {
    modeRef.current = mode;
    isPlotFinishedRef.current = isPlotFinished;
    plotPointsRef.current = plotPoints;
    snapHintRef.current = snapHint;
    stageScaleRef.current = stageScale;
    stagePosRef.current = stagePos;
  });



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
        const store = useMapStore.getState();
        const pos = store.getStageTargetPoint();
        const first = curPoints[0];
        const near = Math.hypot(pos.x - first.x, pos.y - first.y) <= SNAP_DISTANCE;
        if (near !== curSnapHint) setSnapHint(near);
      } else if (curMode === "drawing_plot" && curSnapHint) {
        setSnapHint(false);
      }
    });
  }, [setSnapHint]);

  // onMouseMove — stable reference, no plotPoints in deps
  const onMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    lastDeviceRef.current = 'mouse';
    const store = useMapStore.getState();
    if (store.deviceType !== 'mouse') store.setDeviceType('mouse');
    
    const stage = e.target.getStage();
    if (stage) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
        const pos = {
          x: (pointer.x - store.stagePos.x) / store.stageScale,
          y: (pointer.y - store.stagePos.y) / store.stageScale,
        };
        lastPointerPosRef.current = pos;
        store.setPointerPos(pos);
      }
    }
    checkSnapThrottled();
  }, [checkSnapThrottled]);

  const onTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      lastDeviceRef.current = 'touch';
      const store = useMapStore.getState();
      if (store.deviceType !== 'touch') store.setDeviceType('touch');
      const touches = e.evt.touches;
      if (touches && touches.length >= 2) {
        isPinchingRef.current = true;
        setIsPinching(true);
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
            x: (pointerX - stagePos.x) / stageScale,
            y: (pointerY - stagePos.y) / stageScale,
          };
        }

        pinchStartRef.current = {
          distance: d,
          scale: stageScale,
          stagePos: { ...stagePos },
          centerClient,
          mousePointTo,
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
              const stage = document.querySelector('.konvajs-content')?.parentElement;
              if (stage && start.mousePointTo) {
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
    [checkSnapThrottled, setSnapHint, setStageScale, setStagePos],
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
            scale: stageScaleRef.current,
            stagePos: { ...stagePosRef.current },
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
          scale: stageScaleRef.current,
          stagePos: { ...stagePosRef.current },
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
          scale: stageScaleRef.current,
          stagePos: { ...stagePosRef.current },
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
    [setIsPinching, TAP_GRACE_MS, TAP_MIN_MS],
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

  const onMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only track left button on the stage itself (not on shapes)
      if (e.evt.button !== 0) return;
      if (e.target !== e.currentTarget) return;
      mouseDownPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
    },
    [],
  );

  const onClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Only left click, only on stage background (not shapes)
      if (e.evt.button !== 0) return;
      // Allow clicks on stage or on layers (background), but block clicks on named shapes
      const targetName = (e.target as Konva.Node).name?.() || '';
      const isStageOrLayer = e.target === e.currentTarget || targetName === '' || targetName === 'background-layer';
      if (!isStageOrLayer) return;

      // Ignore if user dragged (panned)
      if (mouseDownPosRef.current) {
        const dx = Math.abs(e.evt.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(e.evt.clientY - mouseDownPosRef.current.y);
        mouseDownPosRef.current = null;
        if (dx > CLICK_MOVE_THRESHOLD || dy > CLICK_MOVE_THRESHOLD) return;
      }

      const curMode = modeRef.current;
      const curFinished = isPlotFinishedRef.current;
      const curPoints = plotPointsRef.current;
      const store = useMapStore.getState();
      const stage = e.target.getStage();
      if (!stage) return;

      if (curMode === 'drawing_plot' && !curFinished) {
        const SNAP_DISTANCE = 20 / stageScaleRef.current;
        let pos = store.getStageCenterPoint();
        
        // If clicking with a mouse, use the exact click position
        if (lastDeviceRef.current === 'mouse') {
           const pointer = stage.getPointerPosition();
           if (pointer) {
             pos = {
               x: (pointer.x - store.stagePos.x) / store.stageScale,
               y: (pointer.y - store.stagePos.y) / store.stageScale,
             };
           }
        }

        const first = curPoints[0];
        // Use snapHint (already computed in checkSnapThrottled) OR distance check for safety
        const isNearFirst = (snapHintRef.current && curPoints.length >= 3) ||
          (first && Math.hypot(pos.x - first.x, pos.y - first.y) <= SNAP_DISTANCE && curPoints.length >= 3);

        if (isNearFirst) {
          store.finishPlot();
        } else {
          store.addPointAt(pos);
        }
      } else if (curMode === 'calibrating') {
        let pos = store.getStageCenterPoint();
        if (lastDeviceRef.current === 'mouse') {
           const pointer = stage.getPointerPosition();
           if (pointer) {
             pos = {
               x: (pointer.x - store.stagePos.x) / store.stageScale,
               y: (pointer.y - store.stagePos.y) / store.stageScale,
             };
           }
        }
        store.addPointAt(pos);
      }
    },
    [CLICK_MOVE_THRESHOLD],
  );

  return {
    onMouseMove,
    onMouseDown,
    onClick,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onDragMove,
    onDragEnd,
  };
};
