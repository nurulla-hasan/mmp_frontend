/**
 * Get the hex color of a pixel at (x, y) in an HTMLImageElement.
 * Uses a 1x1 canvas so sampling never allocates a full-size image buffer.
 */
export function getPixelColor(
  img: HTMLImageElement,
  x: number,
  y: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '#000000';

  // Clamp to image bounds
  const px = Math.round(Math.max(0, Math.min(x, img.naturalWidth - 1)));
  const py = Math.round(Math.max(0, Math.min(y, img.naturalHeight - 1)));

  ctx.drawImage(img, px, py, 1, 1, 0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  const hex = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
  return hex;
}
