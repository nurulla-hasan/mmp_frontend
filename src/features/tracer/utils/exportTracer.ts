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
): void {
  const targetLayers = which === 'all' ? layers : layers.filter(l => l.id === which);
  const fontSize = Math.max(18, referenceW / 80);

  ctx.save();
  ctx.translate(-offsetX, -offsetY);

  for (const layer of targetLayers) {
    if (!layer.visible) continue;

    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.lineWidth * 2.5; // upscale for print
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
        const c = centroid(poly.points);
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
  canvas.width = croppedW;
  canvas.height = croppedH;
  const ctx = canvas.getContext('2d')!;

  // 3. White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, croppedW, croppedH);

  drawLayersOnCanvas(ctx, layers, which, referenceW, minX, minY);
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
  const w = canvas.width;
  const h = canvas.height;

  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
  const imgData = await blobToBase64(blob);

  const pdf = new jsPDF({
    orientation: w > h ? 'landscape' : 'portrait',
    unit: 'px',
    format: [w, h],
  });
  pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
  pdf.save('tracer-map.pdf');
}

export async function exportAsPNG(
  layers: TracerLayer[],
  bgImage: HTMLImageElement | null,
  which: 'all' | string = 'all',
): Promise<void> {
  const canvas = buildCanvas(layers, bgImage, which);
  if (!canvas) return; // nothing to export
  const blob = await canvasToBlob(canvas, 'image/png');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tracer-map${which !== 'all' ? `-${which}` : ''}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
