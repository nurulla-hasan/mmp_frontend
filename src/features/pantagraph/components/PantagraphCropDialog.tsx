'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { CropIcon, Loader2, Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  blobToImage,
  getCanvasSafeScale,
  loadImageSource,
  resizeImageForCanvas,
} from '@/lib/canvasImage';

// ─── Types ────────────────────────────────────────────────────────────────────
type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'body';

interface Rect { x: number; y: number; w: number; h: number }

interface ImageLayout {
  scale: number;
  offsetX: number;
  offsetY: number;
  dispW: number;
  dispH: number;
}

export interface PantagraphCropResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PantagraphCropDialogProps {
  open: boolean;
  imageSrc: string;
  mapLabel: string;
  preserveResolution?: boolean;
  onClose: () => void;
  onDone: (img: HTMLImageElement, crop?: PantagraphCropResult) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// const HANDLE_PX = 14;
const HIT_AREA = 24; // Increased for easier grabbing
const MIN_SEL = 20;

const CURSOR: Record<HandleType, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  e: 'e-resize', se: 'se-resize', s: 's-resize',
  sw: 'sw-resize', w: 'w-resize', body: 'move',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getClientPos(e: MouseEvent | TouchEvent) {
  if ('touches' in e) {
    const t = e.touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { x: t.clientX, y: t.clientY };
  }
  return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
}

function hitHandle(cx: number, cy: number, s: Rect): HandleType | null {
  const { x, y, w, h } = s;
  const near = (a: number, b: number) => Math.abs(a - b) <= HIT_AREA;
  const midX = x + w / 2;
  const midY = y + h / 2;

  if (near(cx, x)     && near(cy, y))     return 'nw';
  if (near(cx, x + w) && near(cy, y))     return 'ne';
  if (near(cx, x)     && near(cy, y + h)) return 'sw';
  if (near(cx, x + w) && near(cy, y + h)) return 'se';
  if (near(cx, midX)  && near(cy, y))     return 'n';
  if (near(cx, midX)  && near(cy, y + h)) return 's';
  if (near(cx, x)     && near(cy, midY))  return 'w';
  if (near(cx, x + w) && near(cy, midY))  return 'e';
  if (cx > x && cx < x + w && cy > y && cy < y + h) return 'body';
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PantagraphCropDialog({
  open, imageSrc, mapLabel, preserveResolution = false, onClose, onDone,
}: PantagraphCropDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);

  const layoutRef = useRef<ImageLayout | null>(null);
  const selRef    = useRef<Rect>({ x: 0, y: 0, w: 100, h: 100 });

  const [layout,  setLayout]  = useState<ImageLayout | null>(null);
  const [sel,     setSel]     = useState<Rect>({ x: 0, y: 0, w: 100, h: 100 });
  const [cursor,  setCursor]  = useState('crosshair');
  const [isBusy,  setIsBusy]  = useState(false);

  const ready = layout !== null;

  // keep refs in sync
  useEffect(() => { selRef.current = sel; }, [sel]);

  // ── compute image layout inside container ─────────────────────────────────
  const computeLayout = useCallback(() => {
    const container = containerRef.current;
    const img       = imgRef.current;
    if (!container || !img || !img.naturalWidth) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale   = Math.min(cw / iw, ch / ih);
    const dispW   = iw * scale;
    const dispH   = ih * scale;
    const offsetX = (cw - dispW) / 2;
    const offsetY = (ch - dispH) / 2;

    const newLayout: ImageLayout = { scale, offsetX, offsetY, dispW, dispH };
    layoutRef.current = newLayout;

    const initSel: Rect = { x: offsetX, y: offsetY, w: dispW, h: dispH };
    selRef.current = initSel;
    setSel(initSel);
    setLayout(newLayout);
  }, []);

  // Reset when closed; compute when opened
  useEffect(() => {
    if (!open) {
      // defer reset to avoid setState-in-effect warning
      const t = setTimeout(() => setLayout(null), 0);
      return () => clearTimeout(t);
    }
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) computeLayout();
  }, [open, computeLayout]);

  // ── drag ──────────────────────────────────────────────────────────────────
  const dragRef = useRef<{
    handle: HandleType;
    startSel: Rect;
    startX: number;
    startY: number;
  } | null>(null);

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const container = containerRef.current;
    const layout    = layoutRef.current;
    if (!container || !layout) return;

    const rect = container.getBoundingClientRect();
    const raw  = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    const cx = raw.x - rect.left;
    const cy = raw.y - rect.top;

    const handle = hitHandle(cx, cy, selRef.current);
    if (!handle) return;

    e.preventDefault();
    dragRef.current = {
      handle,
      startSel: { ...selRef.current },
      startX: cx,
      startY: cy,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      const layout    = layoutRef.current;
      if (!container || !layout) return;

      const rect = container.getBoundingClientRect();
      const raw  = getClientPos(e);
      const cx   = raw.x - rect.left;
      const cy   = raw.y - rect.top;

      if (!dragRef.current) {
        const h = hitHandle(cx, cy, selRef.current);
        setCursor(h ? CURSOR[h] : 'default');
        return;
      }

      e.preventDefault();

      const { handle, startSel, startX, startY } = dragRef.current;
      const dx = cx - startX;
      const dy = cy - startY;
      const { offsetX, offsetY, dispW, dispH } = layout;

      const clX = (v: number) => Math.max(offsetX, Math.min(offsetX + dispW, v));
      const clY = (v: number) => Math.max(offsetY, Math.min(offsetY + dispH, v));

      let { x, y, w, h } = startSel;

      switch (handle) {
        case 'nw': {
          const nx = clX(x + dx); const ny = clY(y + dy);
          w = Math.max(MIN_SEL, x + w - nx); h = Math.max(MIN_SEL, y + h - ny);
          x = x + w - w; // keep right edge
          x = nx; y = ny;
          break;
        }
        case 'ne': {
          const ny = clY(y + dy);
          h = Math.max(MIN_SEL, y + h - ny); y = ny;
          w = Math.max(MIN_SEL, clX(startSel.x + startSel.w + dx) - x);
          break;
        }
        case 'sw': {
          const nx = clX(x + dx);
          w = Math.max(MIN_SEL, x + w - nx); x = nx;
          h = Math.max(MIN_SEL, clY(startSel.y + startSel.h + dy) - y);
          break;
        }
        case 'se':
          w = Math.max(MIN_SEL, clX(x + w + dx) - x);
          h = Math.max(MIN_SEL, clY(y + h + dy) - y);
          break;
        case 'n': {
          const ny = clY(y + dy);
          h = Math.max(MIN_SEL, y + h - ny); y = ny;
          break;
        }
        case 's':
          h = Math.max(MIN_SEL, clY(y + h + dy) - y);
          break;
        case 'w': {
          const nx = clX(x + dx);
          w = Math.max(MIN_SEL, x + w - nx); x = nx;
          break;
        }
        case 'e':
          w = Math.max(MIN_SEL, clX(x + w + dx) - x);
          break;
        case 'body':
          x = Math.max(offsetX, Math.min(offsetX + dispW - w, x + dx));
          y = Math.max(offsetY, Math.min(offsetY + dispH - h, y + dy));
          break;
      }

      const next: Rect = { x, y, w, h };
      selRef.current = next;
      setSel(next);
    };

    const onUp = () => { dragRef.current = null; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []); // stable — reads from refs

  // ── crop ─────────────────────────────────────────────────────────────────
  const handleCrop = useCallback(async () => {
    const layout = layoutRef.current;
    const s      = selRef.current;
    if (!layout) return;
    setIsBusy(true);
    try {
      const { scale, offsetX, offsetY } = layout;
      const px = Math.max(0, Math.round((s.x - offsetX) / scale));
      const py = Math.max(0, Math.round((s.y - offsetY) / scale));
      const pw = Math.round(s.w / scale);
      const ph = Math.round(s.h / scale);

      const src = await loadImageSource(imageSrc);
      const outputScale = preserveResolution ? 1 : getCanvasSafeScale(pw, ph);

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(pw * outputScale));
      canvas.height = Math.max(1, Math.round(ph * outputScale));

      try {
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(src, px, py, pw, ph, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((result) => {
            if (result) resolve(result);
            else reject(new Error('toBlob failed'));
          }, 'image/png');
        });
        onDone(await blobToImage(blob), { x: px, y: py, width: pw, height: ph });
        onClose();
      } finally {
        canvas.width = 1;
        canvas.height = 1;
      }
    } catch (e) {
      console.error('Crop failed:', e);
    } finally {
      setIsBusy(false);
    }
  }, [imageSrc, preserveResolution, onDone, onClose]);

  // ── skip ─────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(async () => {
    if (preserveResolution) {
      onClose();
      return;
    }

    setIsBusy(true);
    try {
      const img = await resizeImageForCanvas(await loadImageSource(imageSrc));
      onDone(img);
      onClose();
    } catch (e) {
      console.error('Skip failed:', e);
    } finally {
      setIsBusy(false);
    }
  }, [imageSrc, preserveResolution, onDone, onClose]);

  // ── handle positions for render ───────────────────────────────────────────
  const handles: { id: HandleType; cx: number; cy: number }[] = ready ? [
    { id: 'nw', cx: sel.x,           cy: sel.y           },
    { id: 'n',  cx: sel.x + sel.w/2, cy: sel.y           },
    { id: 'ne', cx: sel.x + sel.w,   cy: sel.y           },
    { id: 'e',  cx: sel.x + sel.w,   cy: sel.y + sel.h/2 },
    { id: 'se', cx: sel.x + sel.w,   cy: sel.y + sel.h   },
    { id: 's',  cx: sel.x + sel.w/2, cy: sel.y + sel.h   },
    { id: 'sw', cx: sel.x,           cy: sel.y + sel.h   },
    { id: 'w',  cx: sel.x,           cy: sel.y + sel.h/2 },
  ] : [];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isBusy) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-6xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-primary" />
            {mapLabel} ক্রপ করুন
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            যেকোনো হ্যান্ডেল টেনে প্রয়োজনীয় অংশ নির্বাচন করুন — চাইলে শুধু একটি দিক কাটতে পারেন।
          </p>
        </DialogHeader>

        {/* ── Crop area ── */}
        <div
          ref={containerRef}
          className="relative w-full bg-black/90 select-none touch-none"
          style={{ height: '65vh', cursor }}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
        >
          {/* Source image */}
          <Image
            ref={imgRef}
            src={imageSrc}
            alt="crop preview"
            fill
            unoptimized
            className="object-contain pointer-events-none"
            onLoad={computeLayout}
          />

          {ready && (
            <>
              {/* ── Dark overlay strips ── */}
              {/* Top */}
              <div className="absolute z-10 pointer-events-none bg-black/60"
                style={{ left: 0, top: 0, right: 0, height: sel.y }} />
              {/* Bottom */}
              <div className="absolute z-10 pointer-events-none bg-black/60"
                style={{ left: 0, top: sel.y + sel.h, right: 0, bottom: 0 }} />
              {/* Left */}
              <div className="absolute z-10 pointer-events-none bg-black/60"
                style={{ left: 0, top: sel.y, width: sel.x, height: sel.h }} />
              {/* Right */}
              <div className="absolute z-10 pointer-events-none bg-black/60"
                style={{ left: sel.x + sel.w, top: sel.y, right: 0, height: sel.h }} />

              {/* ── Selection border ── */}
              <div className="absolute z-20 pointer-events-none border-4 border-destructive shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
                style={{ left: sel.x, top: sel.y, width: sel.w, height: sel.h }}>
                {/* Rule-of-thirds guides */}
                <div className="absolute inset-0 pointer-events-none mix-blend-difference">
                  <div className="absolute border-l-2 border-white/40 h-full" style={{ left: '33.33%' }} />
                  <div className="absolute border-l-2 border-white/40 h-full" style={{ left: '66.66%' }} />
                  <div className="absolute border-t-2 border-white/40 w-full" style={{ top: '33.33%' }} />
                  <div className="absolute border-t-2 border-white/40 w-full" style={{ top: '66.66%' }} />
                </div>
              </div>

              {/* ── Drag handles ── */}
              {/* Note: the visual handles are rendered exactly at the edges/corners. The mouse events are captured by the main container, which checks distance using hitHandle. So we don't need pointer events on these divs. */}
              {handles.map(({ id, cx, cy }) => {
                // Corner handles get filled circles, Edge handles get thick bars
                let cls = "absolute z-30 pointer-events-none shadow-md ";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let style: any = { cursor: CURSOR[id] };
                const thick = 6;
                const length = 32;
                const circleSize = 24;

                if (id === 'nw') {
                  cls += 'rounded-full bg-destructive border-2 border-white';
                  style = { ...style, width: circleSize, height: circleSize, left: cx - circleSize/2, top: cy - circleSize/2 };
                } else if (id === 'ne') {
                  cls += 'rounded-full bg-destructive border-2 border-white';
                  style = { ...style, width: circleSize, height: circleSize, left: cx - circleSize/2, top: cy - circleSize/2 };
                } else if (id === 'sw') {
                  cls += 'rounded-full bg-destructive border-2 border-white';
                  style = { ...style, width: circleSize, height: circleSize, left: cx - circleSize/2, top: cy - circleSize/2 };
                } else if (id === 'se') {
                  cls += 'rounded-full bg-destructive border-2 border-white';
                  style = { ...style, width: circleSize, height: circleSize, left: cx - circleSize/2, top: cy - circleSize/2 };
                } else if (id === 'n') {
                  cls += 'bg-destructive border border-white';
                  style = { ...style, width: length, height: thick, left: cx - length/2, top: cy - thick/2 };
                } else if (id === 's') {
                  cls += 'bg-destructive border border-white';
                  style = { ...style, width: length, height: thick, left: cx - length/2, top: cy - thick/2 };
                } else if (id === 'w') {
                  cls += 'bg-destructive border border-white';
                  style = { ...style, width: thick, height: length, left: cx - thick/2, top: cy - length/2 };
                } else if (id === 'e') {
                  cls += 'bg-destructive border border-white';
                  style = { ...style, width: thick, height: length, left: cx - thick/2, top: cy - length/2 };
                }

                return <div key={id} className={cls} style={style} />;
              })}
            </>
          )}
        </div>

        {/* Size info bar */}
        <div className="px-5 py-2 border-t border-border bg-muted/30 text-[10px] font-mono text-muted-foreground flex items-center justify-between">
          <span>
            {layout
              ? `${Math.round(sel.w / layout.scale)} × ${Math.round(sel.h / layout.scale)} px`
              : 'লোড হচ্ছে...'}
          </span>
          <span className="text-[9px] text-muted-foreground/60">
            কোণার বা পাশের হ্যান্ডেল টেনে যেকোনো দিক কাটুন
          </span>
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-4 bg-muted/10 border-t border-border flex flex-row items-center justify-between gap-2">
          <button
            onClick={handleSkip}
            disabled={isBusy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            পুরো ইমেজ ব্যবহার করুন
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isBusy}>
              বাতিল
            </Button>
            <Button size="sm" onClick={handleCrop} disabled={isBusy || !ready}>
              {isBusy
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />প্রক্রিয়াজাত...</>
                : <><CropIcon className="w-3.5 h-3.5 mr-1.5" />ক্রপ করুন</>
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
