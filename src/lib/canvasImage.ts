const DEFAULT_MAX_DIMENSION = 4096;
const DEFAULT_MAX_PIXELS = 12_000_000;

type CanvasImageLimits = {
  maxDimension?: number;
  maxPixels?: number;
};

export function getCanvasSafeScale(
  width: number,
  height: number,
  limits: CanvasImageLimits = {},
): number {
  if (width <= 0 || height <= 0) return 1;

  const maxDimension = limits.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const maxPixels = limits.maxPixels ?? DEFAULT_MAX_PIXELS;
  const dimensionScale = maxDimension / Math.max(width, height);
  const pixelScale = Math.sqrt(maxPixels / (width * height));

  return Math.min(1, dimensionScale, pixelScale);
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to encode canvas image'));
    }, type, quality);
  });
}

export function loadImageSource(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to decode image'));
    image.src = src;
  });
}

export async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await loadImageSource(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeImageForCanvas(
  image: HTMLImageElement,
  limits: CanvasImageLimits = {},
): Promise<HTMLImageElement> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const scale = getCanvasSafeScale(width, height, limits);
  if (scale >= 1) return image;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await blobToImage(await canvasToBlob(canvas));
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

export async function imageToObjectUrl(image: HTMLImageElement): Promise<string> {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  try {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context is unavailable');
    context.drawImage(image, 0, 0);
    return URL.createObjectURL(await canvasToBlob(canvas));
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}
