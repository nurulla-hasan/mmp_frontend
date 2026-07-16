import { getPixelWorker } from './pixelWorker';

/**
 * Canvas-based utility that replaces dark pixels (map lines) with a chosen colour.
 *
 * Uses a shared Web Worker for non-blocking pixel processing.
 * Falls back to synchronous processing if the worker is unavailable.
 *
 * @param img       Source HTMLImageElement (e.g. a bg-removed map)
 * @param color     Target hex colour (e.g. '#DC2626'). When '#000000', returns the original.
 * @param threshold Luminance threshold 0-255 (default 200). Higher = more pixels changed.
 */
export function colorizeImage(
  img: HTMLImageElement,
  color: string,
  threshold = 200,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Black = original colour → return as-is
    if (color === '#000000' || color === '#000') {
      resolve(img);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    canvas.width  = img.naturalWidth  || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Parse target colour
    const hex    = color.replace(/^#/, '');
    const targetR = parseInt(hex.slice(0, 2), 16);
    const targetG = parseInt(hex.slice(2, 4), 16);
    const targetB = parseInt(hex.slice(4, 6), 16);

    const worker = getPixelWorker();

    const finish = (processedData: Uint8ClampedArray) => {
      const newImageData = new ImageData(
        new Uint8ClampedArray(processedData.buffer as ArrayBuffer),
        canvas.width,
        canvas.height,
      );
      ctx.putImageData(newImageData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('Failed to create blob')); return; }
        const url = URL.createObjectURL(blob);
        const outImg = new window.Image();
        outImg.onload = () => { URL.revokeObjectURL(url); resolve(outImg); };
        outImg.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
        outImg.src = url;
      }, 'image/png');
    };

    if (!worker) {
      // Sync fallback — blocks main thread
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue; // skip fully transparent only
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < threshold) {
          data[i]     = targetR;
          data[i + 1] = targetG;
          data[i + 2] = targetB;
        }
      }
      finish(data);
      return;
    }

    // Transfer a copy to the worker (zero-copy transfer to worker thread)
    // Copy exact elements to avoid buffer padding issues
    const copy = new Uint8ClampedArray(imageData.data).buffer as ArrayBuffer;

    worker.addEventListener(
      'message',
      (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
        finish(new Uint8ClampedArray(e.data.buffer));
      },
      { once: true },
    );

    worker.postMessage({ type: 'colorize', buffer: copy, targetR, targetG, targetB, threshold }, [copy]);
  });
}
