/**
 * Get the hex color of a pixel at (x, y) in an HTMLImageElement.
 * Uses a hidden canvas to sample the exact pixel.
 */
export function getPixelColor(
  img: HTMLImageElement,
  x: number,
  y: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#000000';

  ctx.drawImage(img, 0, 0);

  // Clamp to image bounds
  const px = Math.round(Math.max(0, Math.min(x, img.naturalWidth - 1)));
  const py = Math.round(Math.max(0, Math.min(y, img.naturalHeight - 1)));

  const pixel = ctx.getImageData(px, py, 1, 1).data;
  const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
  return hex;
}
