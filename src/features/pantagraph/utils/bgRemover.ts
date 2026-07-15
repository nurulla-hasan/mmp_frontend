const MAX_PIXELS = 3_000_000; // ~ 1732×1732 — max pixels to process synchronously

/**
 * Parse a hex color string like "#aabbcc" or "#abc" to R,G,B.
 */
function parseHex(hex: string): { r: number; g: number; b: number } {
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
 * Process a single ImageData buffer — make matching pixels transparent.
 * Mutates `data` in place for speed.
 */
function processPixels(
  data: Uint8ClampedArray,
  targetR: number,
  targetG: number,
  targetB: number,
  tolerance: number
): void {
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - targetR);
    const dg = Math.abs(data[i + 1] - targetG);
    const db = Math.abs(data[i + 2] - targetB);

    if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
      data[i + 3] = 0; // transparent
    }
  }
}

/**
 * Process a large ImageData in chunks using requestAnimationFrame
 * so the main thread stays responsive.
 */
function processPixelsChunked(
  data: Uint8ClampedArray,
  targetR: number,
  targetG: number,
  targetB: number,
  tolerance: number
): Promise<void> {
  return new Promise((resolve) => {
    const total = data.length;
    const chunkSize = MAX_PIXELS * 4; // 4 channels per pixel
    let offset = 0;

    function nextChunk(): void {
      const end = Math.min(offset + chunkSize, total);
      for (let i = offset; i < end; i += 4) {
        const dr = Math.abs(data[i] - targetR);
        const dg = Math.abs(data[i + 1] - targetG);
        const db = Math.abs(data[i + 2] - targetB);

        if (dr <= tolerance && dg <= tolerance && db <= tolerance) {
          data[i + 3] = 0;
        }
      }
      offset = end;
      if (offset < total) {
        requestAnimationFrame(nextChunk);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(nextChunk);
  });
}

/**
 * Remove a target color (typically background) from a map image
 * by making matching pixels transparent.
 *
 * Performance notes:
 * - Images smaller than ~3M pixels are processed in one synchronous pass.
 * - Larger images are chunked via requestAnimationFrame (non-blocking).
 * - Uses canvas.toBlob() + URL.createObjectURL instead of toDataURL().
 *
 * @param img - Source HTMLImageElement
 * @param targetColor - Hex color string like "#ffffff". If omitted, auto-detects from edges.
 * @param tolerance - 0-255, how close a pixel must be to targetColor (default 60)
 * @param onProgress - Optional callback with 0-1 progress
 * @returns A new HTMLImageElement with transparent background
 */
export function removeBackground(
  img: HTMLImageElement,
  targetColor?: string,
  tolerance = 60,
  onProgress?: (pct: number) => void
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixelCount = canvas.width * canvas.height;

    let targetR: number;
    let targetG: number;
    let targetB: number;

    if (targetColor) {
      const parsed = parseHex(targetColor);
      targetR = parsed.r;
      targetG = parsed.g;
      targetB = parsed.b;
    } else {
      // Auto-detect background color from edges
      const edgeColor = detectEdgeColor(data, canvas.width, canvas.height);
      targetR = Math.round(edgeColor.r);
      targetG = Math.round(edgeColor.g);
      targetB = Math.round(edgeColor.b);
      tolerance = edgeColor.isWhite ? 50 : 70;
    }

    onProgress?.(0.1);

    const processPromise =
      pixelCount > MAX_PIXELS
        ? processPixelsChunked(data, targetR, targetG, targetB, tolerance)
        : Promise.resolve(processPixels(data, targetR, targetG, targetB, tolerance));

    processPromise
      .then(() => {
        onProgress?.(0.7);
        ctx.putImageData(imageData, 0, 0);

        // Use toBlob() instead of toDataURL() — async, no base64 overhead
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
 * Detect the dominant background color by sampling the edges of the image.
 * Returns the color and whether it's likely a white/light background.
 */
function detectEdgeColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { r: number; g: number; b: number; isWhite: boolean } {
  let rTotal = 0;
  let gTotal = 0;
  let bTotal = 0;
  let count = 0;

  // Sample top edge
  for (let x = 0; x < width; x += 3) {
    const idx = x * 4;
    rTotal += data[idx];
    gTotal += data[idx + 1];
    bTotal += data[idx + 2];
    count++;
  }

  // Sample bottom edge
  const bottomRow = (height - 1) * width * 4;
  for (let x = 0; x < width; x += 3) {
    const idx = bottomRow + x * 4;
    rTotal += data[idx];
    gTotal += data[idx + 1];
    bTotal += data[idx + 2];
    count++;
  }

  // Sample left edge (minus corners already sampled)
  for (let y = 1; y < height - 1; y += 3) {
    const idx = y * width * 4;
    rTotal += data[idx];
    gTotal += data[idx + 1];
    bTotal += data[idx + 2];
    count++;
  }

  // Sample right edge (minus corners already sampled)
  for (let y = 1; y < height - 1; y += 3) {
    const idx = y * width * 4 + (width - 1) * 4;
    rTotal += data[idx];
    gTotal += data[idx + 1];
    bTotal += data[idx + 2];
    count++;
  }

  const r = rTotal / count;
  const g = gTotal / count;
  const b = bTotal / count;

  // Check if background is white/light (all channels > 180)
  const isWhite = r > 180 && g > 180 && b > 180;

  return { r, g, b, isWhite };
}
