import { blobToImage } from '@/lib/canvasImage';
import { runPixelTask } from './pixelWorker';

function colorizeSync(
  data: Uint8ClampedArray,
  targetR: number,
  targetG: number,
  targetB: number,
  threshold: number,
): void {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (luminance < threshold) {
      data[i] = targetR;
      data[i + 1] = targetG;
      data[i + 2] = targetB;
    }
  }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode colorized image'));
    }, 'image/png');
  });
}

function createImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageData {
  const view = new Uint8ClampedArray(
    data.buffer as ArrayBuffer,
    data.byteOffset,
    data.length,
  );
  return new ImageData(view, width, height);
}

/** Replace dark map pixels with a chosen color in the shared worker. */
export async function colorizeImage(
  img: HTMLImageElement,
  color: string,
  threshold = 200,
): Promise<HTMLImageElement> {
  if (color === '#000000' || color === '#000') return img;

  const canvas = document.createElement('canvas');
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  canvas.width = width;
  canvas.height = height;

  try {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D context not available');

    context.drawImage(img, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const hex = color.replace(/^#/, '');
    const targetR = parseInt(hex.slice(0, 2), 16);
    const targetG = parseInt(hex.slice(2, 4), 16);
    const targetB = parseInt(hex.slice(4, 6), 16);

    const task = runPixelTask(imageData.data, {
      type: 'colorize',
      targetR,
      targetG,
      targetB,
      threshold,
    });

    let processedData: Uint8ClampedArray = imageData.data;
    if (task) {
      try {
        processedData = await task;
      } catch {
        colorizeSync(processedData, targetR, targetG, targetB, threshold);
      }
    } else {
      colorizeSync(processedData, targetR, targetG, targetB, threshold);
    }

    context.putImageData(createImageData(processedData, width, height), 0, 0);
    return await blobToImage(await canvasToBlob(canvas));
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}
