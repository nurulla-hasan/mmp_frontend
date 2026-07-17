import jsPDF from 'jspdf';
import { TracerLayer, centroid } from '../store/useTracerStore';

// ── Shared drawing helper ─────────────────────────────────────────────────────

function drawLayersOnCanvas(
  ctx: CanvasRenderingContext2D,
  layers: TracerLayer[],
  which: 'all' | string,
  referenceW: number,
  offsetX: number = 0,
  offsetY: number = 0,
  totalW: number = 0,
): void {
  const targetLayers = which === 'all' ? layers : layers.filter(l => l.id === which);

  // Proportional sizing so output looks consistent on A4 paper (~180mm usable width)
  const A4_USABLE = 180;
  const fontSize = totalW > 0
    ? Math.max(4, 3 * totalW / A4_USABLE)
    : Math.max(6, referenceW / 320);

  ctx.save();
  ctx.translate(-offsetX, -offsetY);

  // Sort: CS layer last so it draws on top
  const sorted = [...targetLayers].sort((a, b) => (a.id === 'cs' ? 1 : b.id === 'cs' ? -1 : 0));

  for (const layer of sorted) {
    if (!layer.visible) continue;

    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = layer.color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const poly of layer.polygons) {
      if (poly.points.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(poly.points[0].x, poly.points[0].y);
      for (let i = 1; i < poly.points.length; i++) ctx.lineTo(poly.points[i].x, poly.points[i].y);
      ctx.closePath();
      ctx.stroke();

      if (poly.label) {
        const c = poly.labelX != null && poly.labelY != null
          ? { x: poly.labelX, y: poly.labelY }
          : centroid(poly.points);
        ctx.fillText(poly.label, c.x, c.y);
      }
    }
  }

  ctx.restore();
}

function buildCanvas(
  layers: TracerLayer[],
  bgImage: HTMLImageElement | null,
  which: 'all' | string,
): HTMLCanvasElement | null {
  const targetLayers = which === 'all' ? layers : layers.filter(l => l.id === which);

  // 1. Find bounding box of all polygons
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasPolygons = false;

  for (const layer of targetLayers) {
    if (!layer.visible) continue;
    for (const poly of layer.polygons) {
      if (poly.points.length < 2) continue;
      hasPolygons = true;
      for (const pt of poly.points) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
    }
  }

  if (!hasPolygons) return null;

  // 2. Add padding around the drawing
  const padding = 60;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const croppedW = maxX - minX;
  const croppedH = maxY - minY;
  const referenceW = bgImage?.naturalWidth ?? 2480;

  const canvas = document.createElement('canvas');
  let canvasW = croppedW;
  let canvasH = croppedH;
  let drawScale = 1;
  
  const maxDimension = Math.max(canvasW, canvasH);
  const TARGET_DIM = 3000; // Ensure high resolution for crisp PDF/PNG
  const MAX_DIM = 4000;    // Prevent out-of-memory on massive exports
  
  if (maxDimension > 0) {
    if (maxDimension < TARGET_DIM) {
      drawScale = TARGET_DIM / maxDimension;
    } else if (maxDimension > MAX_DIM) {
      drawScale = MAX_DIM / maxDimension;
    }
  }
  
  canvasW = Math.round(canvasW * drawScale);
  canvasH = Math.round(canvasH * drawScale);
  
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(drawScale, drawScale);

  // 3. White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, croppedW, croppedH);

  drawLayersOnCanvas(ctx, layers, which, referenceW, minX, minY, croppedW);
  return canvas;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), type, quality),
  );
}

// ── Public exports ────────────────────────────────────────────────────────────

export async function exportAsPDF(
  layers: TracerLayer[],
  bgImage: HTMLImageElement | null,
  which: 'all' | string = 'all',
): Promise<void> {
  const canvas = buildCanvas(layers, bgImage, which);
  if (!canvas) return; // nothing to export
  const cw = canvas.width;
  const ch = canvas.height;

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.98);
  const imgData = await blobToBase64(blob);

  // Always use Portrait A4 (210 × 297 mm) as expected by users
  const A4_W = 210;
  const A4_H = 297;
  const margin = 15;
  const maxW = A4_W - margin * 2;
  const maxH = A4_H - margin * 2;

  // Scale to fit while maintaining aspect ratio
  const scale = Math.min(maxW / cw, maxH / ch);
  const imgW = cw * scale;
  const imgH = ch * scale;
  const offsetX = (A4_W - imgW) / 2;
  const offsetY = (A4_H - imgH) / 2;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgW, imgH);
  pdf.save(`tracer-map${which !== 'all' ? `-${which}` : ''}.pdf`);
}

export async function exportAsPNG(
  layers: TracerLayer[],
  bgImage: HTMLImageElement | null,
  which: 'all' | string = 'all',
): Promise<void> {
  const sourceCanvas = buildCanvas(layers, bgImage, which);
  if (!sourceCanvas) return; // nothing to export
  const cw = sourceCanvas.width;
  const ch = sourceCanvas.height;

  // Always use Portrait A4 size at 300 DPI (2480 x 3508)
  const A4_W = 2480;
  const A4_H = 3508;
  const margin = 177; // ~15mm at 300 DPI

  const a4Canvas = document.createElement('canvas');
  a4Canvas.width = A4_W;
  a4Canvas.height = A4_H;
  const ctx = a4Canvas.getContext('2d')!;

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_W, A4_H);

  const maxW = A4_W - margin * 2;
  const maxH = A4_H - margin * 2;
  const scale = Math.min(maxW / cw, maxH / ch);
  
  const imgW = cw * scale;
  const imgH = ch * scale;
  const offsetX = (A4_W - imgW) / 2;
  const offsetY = (A4_H - imgH) / 2;

  ctx.drawImage(sourceCanvas, offsetX, offsetY, imgW, imgH);

  const blob = await canvasToBlob(a4Canvas, 'image/png');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tracer-map${which !== 'all' ? `-${which}` : ''}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
