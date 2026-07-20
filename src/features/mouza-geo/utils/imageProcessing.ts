type PixelOptions = {
  sensitivity: number;
  lineColor: string;
};

function parseColor(color: string) {
  const hex = color.replace(/^#/, '');
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function abortError() {
  return new DOMException('Image processing বাতিল হয়েছে', 'AbortError');
}

export function processGeoPixelBuffer(
  data: Uint8ClampedArray,
  options: PixelOptions,
  signal?: AbortSignal,
) {
  return new Promise<Uint8ClampedArray>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    let worker: Worker;

    try {
      worker = new Worker(new URL('./geoPixelWorker', import.meta.url));
    } catch (error) {
      reject(error);
      return;
    }

    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort);
      worker.terminate();
    };
    const handleAbort = () => {
      cleanup();
      reject(abortError());
    };

    worker.onmessage = (event: MessageEvent<{ buffer: ArrayBuffer }>) => {
      cleanup();
      resolve(new Uint8ClampedArray(event.data.buffer));
    };
    worker.onerror = () => {
      cleanup();
      reject(new Error('Background worker চালু করা যায়নি'));
    };
    signal?.addEventListener('abort', handleAbort, { once: true });

    const buffer = data.buffer as ArrayBuffer;
    worker.postMessage(
      {
        buffer,
        sensitivity: options.sensitivity,
        lineColor: parseColor(options.lineColor),
      },
      [buffer],
    );
  });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Background preview তৈরি করা যায়নি'));
    }, 'image/png');
  });
}

function loadBlobImage(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Background preview load করা যায়নি'));
    };
    image.src = url;
  });
}

function getPreviewSize(image: HTMLImageElement) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const deviceMemory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const lowMemory = deviceMemory <= 4;
  const maxDimension = lowMemory ? 2560 : 4096;
  const maxPixels = lowMemory ? 4_000_000 : 8_000_000;
  const scale = Math.min(
    1,
    maxDimension / Math.max(sourceWidth, sourceHeight),
    Math.sqrt(maxPixels / (sourceWidth * sourceHeight)),
  );

  return {
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
}

export async function createProcessedPreview(
  image: HTMLImageElement,
  options: PixelOptions,
  signal?: AbortSignal,
) {
  const size = getPreviewSize(image);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) throw new Error('Background canvas তৈরি করা যায়নি');
  if (signal?.aborted) throw abortError();

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, size.width, size.height);
  const imageData = context.getImageData(0, 0, size.width, size.height);
  const processed = await processGeoPixelBuffer(
    imageData.data,
    options,
    signal,
  );

  if (signal?.aborted) throw abortError();

  context.putImageData(
    new ImageData(
      new Uint8ClampedArray(
        processed.buffer as ArrayBuffer,
        processed.byteOffset,
        processed.length,
      ),
      size.width,
      size.height,
    ),
    0,
    0,
  );

  const output = await loadBlobImage(await canvasToBlob(canvas));
  canvas.width = 1;
  canvas.height = 1;
  return output;
}
