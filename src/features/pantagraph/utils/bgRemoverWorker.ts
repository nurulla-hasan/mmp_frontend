/**
 * Web Worker — pixel-processing background thread.
 * Handles both background removal and line colorization so the main
 * thread is never blocked by heavy ImageData loops.
 *
 * Protocol (all messages use Transferable ArrayBuffers for zero-copy):
 *
 *  → { type: 'removeBg',  buffer, colors: [{r,g,b}], tolerance }
 *  ← { buffer }
 *
 *  → { type: 'colorize',  buffer, targetR, targetG, targetB, threshold }
 *  ← { buffer }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = self as any;

ctx.onmessage = (e: MessageEvent) => {
  const msg = e.data as
    | { type: 'removeBg'; buffer: ArrayBuffer; colors: { r: number; g: number; b: number }[]; tolerance: number }
    | { type: 'colorize'; buffer: ArrayBuffer; targetR: number; targetG: number; targetB: number; threshold: number };

  if (msg.type === 'removeBg') {
    const data = new Uint8ClampedArray(msg.buffer);
    const { colors, tolerance } = msg;

    const feather = 20;

    for (let i = 0; i < data.length; i += 4) {
      let minAlpha = 255;
      for (const c of colors) {
        const dist = Math.max(
          Math.abs(data[i]     - c.r),
          Math.abs(data[i + 1] - c.g),
          Math.abs(data[i + 2] - c.b)
        );

        if (dist <= tolerance) {
          minAlpha = 0;
          break;
        } else if (dist < tolerance + feather) {
          const alpha = Math.round(((dist - tolerance) / feather) * 255);
          if (alpha < minAlpha) minAlpha = alpha;
        }
      }
      if (minAlpha < 255) {
        data[i + 3] = minAlpha;
      }
    }

    ctx.postMessage({ buffer: data.buffer }, [data.buffer]);

  } else if (msg.type === 'colorize') {
    const data = new Uint8ClampedArray(msg.buffer);
    const { targetR, targetG, targetB, threshold } = msg;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) continue; // skip fully transparent only
      
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < threshold) {
        data[i]     = targetR;
        data[i + 1] = targetG;
        data[i + 2] = targetB;
      }
    }

    ctx.postMessage({ buffer: data.buffer }, [data.buffer]);
  }
};
