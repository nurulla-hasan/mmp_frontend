import { useState, useRef, useCallback } from 'react';
import { clampNumber } from '@/features/land-measurement/utils/geometry';

export const usePanZoom = (minZoom = 0.45, maxZoom = 20) => {
  const [pagePan, setPagePan] = useState({ x: 0, y: 0 });
  const [pageZoom, setPageZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const pagePinchRef = useRef({
    active: false,
    distance: 0,
    zoom: 1,
    midpoint: { x: 0, y: 0 },
  });

  const startPan = useCallback((clientX: number, clientY: number) => {
    setIsPanning(true);
    dragStartRef.current = { x: clientX, y: clientY, panX: pagePan.x, panY: pagePan.y };
  }, [pagePan]);

  const movePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning) return;
    const start = dragStartRef.current;
    setPagePan({
      x: start.panX + clientX - start.x,
      y: start.panY + clientY - start.y,
    });
  }, [isPanning]);

  const stopPan = useCallback(() => setIsPanning(false), []);

  const getTouchDistance = (first: React.Touch, second: React.Touch) => Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  
  const getTouchMidpoint = (first: React.Touch, second: React.Touch) => ({
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  });

  const startPagePinch = useCallback((first: React.Touch, second: React.Touch) => {
    setIsPanning(false);
    pagePinchRef.current = {
      active: true,
      distance: getTouchDistance(first, second),
      zoom: pageZoom,
      midpoint: getTouchMidpoint(first, second),
    };
  }, [pageZoom]);

  const movePagePinch = useCallback((first: React.Touch, second: React.Touch) => {
    const pinch = pagePinchRef.current;
    if (!pinch.active || pinch.distance <= 0) return;
    const nextMidpoint = getTouchMidpoint(first, second);
    const nextZoom = clampNumber(pinch.zoom * (getTouchDistance(first, second) / pinch.distance), minZoom, maxZoom);
    setPageZoom(nextZoom);
    setPagePan((prev) => ({
      x: prev.x + nextMidpoint.x - pinch.midpoint.x,
      y: prev.y + nextMidpoint.y - pinch.midpoint.y,
    }));
    pagePinchRef.current.midpoint = nextMidpoint;
  }, [minZoom, maxZoom]);

  const stopPagePinch = useCallback(() => {
    pagePinchRef.current.active = false;
  }, []);

  return {
    pagePan,
    pageZoom,
    setPageZoom,
    isPanning,
    startPan,
    movePan,
    stopPan,
    startPagePinch,
    movePagePinch,
    stopPagePinch,
  };
};

