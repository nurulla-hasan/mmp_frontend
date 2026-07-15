import { getPixelWorker } from './pixelWorker';

/**
 * Parse a hex color string like "#aabbcc" or "#abc" to R,G,B.
 */
export function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '');
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Synchronous pixel removal — used as fallback when Web Worker is unavailable.
 * Mutates `data` in place.
 */
function processPixelsSync(
  data: Uint8ClampedArray,
  colors: Array<{ r: number; g: number; b: number }>,
  tolerance: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    for (const c of colors) {
      if (
        Math.abs(data[i]     - c.r) <= tolerance &&
        Math.abs(data[i + 1] - c.g) <= tolerance &&
        Math.abs(data[i + 2] - c.b) <= tolerance
      ) {
        data[i + 3] = 0;
        break;
      }
    }
  }
}

/**
 * Process pixels via Web Worker (non-blocking).
 * Falls back to sync if the worker is unavailable.
 *
 * Returns the processed Uint8ClampedArray (may be a different object than input).
 */
function processPixelsAsync(
  data: Uint8ClampedArray,
  colors: Array<{ r: number; g: number; b: number }>,
  tolerance: number,
): Promise<Uint8ClampedArray> {
  return new Promise((resolve) => {
    const worker = getPixelWorker();

    if (!worker) {
      // Sync fallback — blocks main thread but always works
      processPixelsSync(data, colors, tolerance);
      resolve(data);
      return;
    }

    // Copy the buffer so the caller's ImageData reference stays intact.
    // The copy is transferred to the worker zero-copy from JS engine perspective.
    const copy = data.buffer.slice(0) as ArrayBuffer;

    worker.addEventListener(
      'message',
      (e: MessageEvent<{ buffer: ArrayBuffer }>) => {
        resolve(new Uint8ClampedArray(e.data.buffer));
      },
      { once: true },
    );

    worker.postMessage({ type: 'removeBg', buffer: copy, colors, tolerance }, [copy]);
  });
}

/**
 * Remove target color(s) from a map image by making matching pixels transparent.
 *
 * Uses a Web Worker for non-blocking processing.
 * Falls back to synchronous processing if the worker is unavailable.
 *
 * @param img       Source HTMLImageElement
 * @param colors    Colors to remove. Auto-detected from edges if empty/undefined.
 * @param tolerance 0-255, colour distance threshold (default 60)
 * @param onProgress Optional 0-1 progress callback
 */
export function removeBackground(
  img: HTMLImageElement,
  colors?: Array<{ r: number; g: number; b: number }>,
  tolerance = 60,
  onProgress?: (pct: number) => void,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Auto-detect background colour from image edges if none provided
    let colorsToRemove = colors;
    if (!colorsToRemove || colorsToRemove.length === 0) {
      const edgeColor = detectEdgeColor(imageData.data, canvas.width, canvas.height);
      colorsToRemove = [{ r: Math.round(edgeColor.r), g: Math.round(edgeColor.g), b: Math.round(edgeColor.b) }];
      tolerance = edgeColor.isWhite ? 50 : 70;
    }

    onProgress?.(0.1);

    processPixelsAsync(imageData.data, colorsToRemove, tolerance)
      .then((processedData) => {
        onProgress?.(0.7);

        // Write processed pixels back to the canvas
        const newImageData = new ImageData(
          new Uint8ClampedArray(processedData.buffer as ArrayBuffer),
          canvas.width,
          canvas.height,
        );
        ctx.putImageData(newImageData, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          onProgress?.(0.9);
          const url = URL.createObjectURL(blob);
          const outImg = new window.Image();
          outImg.onload = () => {
            URL.revokeObjectURL(url);
            onProgress?.(1);
            resolve(outImg);
          };
          outImg.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to decode output image'));
          };
          outImg.src = url;
        }, 'image/png');
      })
      .catch(reject);
  });
}

/**
 * Detect the dominant background colour by sampling the edges of the image.
 * Returns the colour and whether it's likely a white/light background.
 */
function detectEdgeColor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { r: number; g: number; b: number; isWhite: boolean } {
  let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

  // Sample top edge
  for (let x = 0; x < width; x += 3) {
    const idx = x * 4;
    rTotal += data[idx]; gTotal += data[idx + 1]; bTotal += data[idx + 2];
    count++;
  }
  // Sample bottom edge
  const bottomRow = (height - 1) * width * 4;
  for (let x = 0; x < width; x += 3) {
    const idx = bottomRow + x * 4;
    rTotal += data[idx]; gTotal += data[idx + 1]; bTotal += data[idx + 2];
    count++;
  }
  // Sample left edge
  for (let y = 1; y < height - 1; y += 3) {
    const idx = y * width * 4;
    rTotal += data[idx]; gTotal += data[idx + 1]; bTotal += data[idx + 2];
    count++;
  }
  // Sample right edge
  for (let y = 1; y < height - 1; y += 3) {
    const idx = y * width * 4 + (width - 1) * 4;
    rTotal += data[idx]; gTotal += data[idx + 1]; bTotal += data[idx + 2];
    count++;
  }

  const r = rTotal / count;
  const g = gTotal / count;
  const b = bTotal / count;
  const isWhite = r > 180 && g > 180 && b > 180;

  return { r, g, b, isWhite };
}
