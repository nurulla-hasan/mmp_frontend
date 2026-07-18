/**
 * Shared Web Worker for background removal, line colorization and alpha cleanup.
 * Every response echoes its request id so concurrent jobs cannot consume each
 * other's buffers.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const workerScope = self as any;

type WorkerMessage =
  | {
      id: number;
      type: 'removeBg';
      buffer: ArrayBuffer;
      colors: { r: number; g: number; b: number }[];
      tolerance: number;
    }
  | {
      id: number;
      type: 'colorize';
      buffer: ArrayBuffer;
      targetR: number;
      targetG: number;
      targetB: number;
      threshold: number;
    }
  | {
      id: number;
      type: 'smoothAlpha';
      buffer: ArrayBuffer;
      edge0: number;
      edge1: number;
    };

workerScope.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    const data = new Uint8ClampedArray(message.buffer);

    if (message.type === 'removeBg') {
      const feather = 20;

      for (let i = 0; i < data.length; i += 4) {
        let minAlpha = 255;
        for (const color of message.colors) {
          const distance = Math.max(
            Math.abs(data[i] - color.r),
            Math.abs(data[i + 1] - color.g),
            Math.abs(data[i + 2] - color.b),
          );

          if (distance <= message.tolerance) {
            minAlpha = 0;
            break;
          }
          if (distance < message.tolerance + feather) {
            minAlpha = Math.min(
              minAlpha,
              Math.round(((distance - message.tolerance) / feather) * 255),
            );
          }
        }
        if (minAlpha < 255) data[i + 3] = minAlpha;
      }
    } else if (message.type === 'colorize') {
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;

        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (luminance < message.threshold) {
          data[i] = message.targetR;
          data[i + 1] = message.targetG;
          data[i + 2] = message.targetB;
        }
      }
    } else {
      const range = Math.max(message.edge1 - message.edge0, 0.01);
      for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i] / 255;
        const t = Math.max(0, Math.min(1, (alpha - message.edge0) / range));
        data[i] = Math.round(t * t * (3 - 2 * t) * 255);
      }
    }

    workerScope.postMessage({ id: message.id, buffer: data.buffer }, [data.buffer]);
  } catch (error) {
    workerScope.postMessage({
      id: message.id,
      error: error instanceof Error ? error.message : 'Pixel processing failed',
    });
  }
};
