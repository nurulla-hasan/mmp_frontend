type RGBColor = { r: number; g: number; b: number };

export type PixelWorkerTask =
  | { type: 'removeBg'; colors: RGBColor[]; tolerance: number }
  | { type: 'colorize'; targetR: number; targetG: number; targetB: number; threshold: number }
  | { type: 'smoothAlpha'; edge0: number; edge1: number };

type WorkerResponse = {
  id: number;
  buffer?: ArrayBuffer;
  error?: string;
};

type PendingRequest = {
  resolve: (data: Uint8ClampedArray) => void;
  reject: (error: Error) => void;
};

let instance: Worker | null = null;
let failed = false;
let nextRequestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

function rejectAllPending(error: Error): void {
  for (const request of pendingRequests.values()) request.reject(error);
  pendingRequests.clear();
}

function getPixelWorker(): Worker | null {
  if (typeof window === 'undefined' || failed) return null;
  if (instance) return instance;

  try {
    const worker = new Worker(new URL('./bgRemoverWorker', import.meta.url));

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, buffer, error } = event.data;
      const request = pendingRequests.get(id);
      if (!request) return;

      pendingRequests.delete(id);
      if (error || !buffer) {
        request.reject(new Error(error || 'Pixel worker returned no data'));
        return;
      }
      request.resolve(new Uint8ClampedArray(buffer));
    };

    worker.onerror = (event) => {
      console.warn('[PixelWorker] Worker error — falling back to sync processing');
      failed = true;
      worker.terminate();
      instance = null;
      rejectAllPending(new Error(event.message || 'Pixel worker failed'));
    };

    instance = worker;
    return worker;
  } catch {
    failed = true;
    return null;
  }
}

/**
 * Sends one pixel task to the shared worker and matches the response by id.
 * Returns null when workers are unavailable so callers can use a sync fallback.
 */
export function runPixelTask(
  data: Uint8ClampedArray,
  task: PixelWorkerTask,
): Promise<Uint8ClampedArray> | null {
  const worker = getPixelWorker();
  if (!worker) return null;

  const id = ++nextRequestId;
  const buffer = new Uint8ClampedArray(data).buffer as ArrayBuffer;

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    try {
      worker.postMessage({ id, ...task, buffer }, [buffer]);
    } catch (error) {
      pendingRequests.delete(id);
      reject(error instanceof Error ? error : new Error('Failed to contact pixel worker'));
    }
  });
}
