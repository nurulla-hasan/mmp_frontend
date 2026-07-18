/**
 * Lazy singleton for the shared pixel-processing Web Worker.
 * Both bgRemover and colorizeImage share this single instance
 * (safe because the worker processes messages in FIFO order and
 * each caller attaches a `once` listener, so responses never mix).
 */
let _instance: Worker | null = null;
let _failed = false;
let _queue: Promise<void> = Promise.resolve();

export function getPixelWorker(): Worker | null {
  if (typeof window === 'undefined' || _failed) return null;
  if (_instance) return _instance;

  try {
    _instance = new Worker(new URL('./bgRemoverWorker', import.meta.url));
    _instance.onerror = () => {
      console.warn('[PixelWorker] Worker error — disabling, falling back to sync');
      _failed = true;
      _instance = null;
    };
    return _instance;
  } catch {
    _failed = true;
    return null;
  }
}

/**
 * Serialize jobs sent to the shared worker. A Worker broadcasts every response
 * to every message listener, so overlapping one-shot listeners can otherwise
 * consume another map's pixel buffer.
 */
export function runPixelWorkerTask(
  message: Record<string, unknown> & { buffer: ArrayBuffer },
): Promise<Uint8ClampedArray> | null {
  const worker = getPixelWorker();
  if (!worker) return null;

  const task = _queue.then(
    () =>
      new Promise<Uint8ClampedArray>((resolve, reject) => {
        const handleMessage = (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
          worker.removeEventListener('error', handleError);
          resolve(new Uint8ClampedArray(event.data.buffer));
        };
        const handleError = () => {
          worker.removeEventListener('message', handleMessage);
          reject(new Error('Pixel worker failed'));
        };

        worker.addEventListener('message', handleMessage, { once: true });
        worker.addEventListener('error', handleError, { once: true });
        worker.postMessage(message, [message.buffer]);
      }),
  );

  _queue = task.then(
    () => undefined,
    () => undefined,
  );

  return task;
}
