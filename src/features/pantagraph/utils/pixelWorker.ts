/**
 * Lazy singleton for the shared pixel-processing Web Worker.
 * Both bgRemover and colorizeImage share this single instance
 * (safe because the worker processes messages in FIFO order and
 * each caller attaches a `once` listener, so responses never mix).
 */
let _instance: Worker | null = null;
let _failed = false;

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
