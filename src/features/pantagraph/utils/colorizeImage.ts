/**
 * Canvas-based utility that replaces dark pixels (map lines) with a chosen color.
 *
 * Processes the image ONCE on a canvas — no per-frame Konva filter overhead.
 * Already-transparent pixels (alpha < 128) are skipped.
 *
 * @param img  Source HTMLImageElement (e.g. a bg-removed map)
 * @param color  Target hex color (e.g. '#DC2626'). When '#000000', returns original.
 * @param threshold  Luminance threshold 0-255 (default 200). Higher = more pixels changed.
 */
export function colorizeImage(
  img: HTMLImageElement,
  color: string,
  threshold = 200,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // If black (original), return as-is
    if (color === '#000000' || color === '#000') {
      resolve(img);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw image onto canvas
    ctx.drawImage(img, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Parse target color
    const hex = color.replace(/^#/, '');
    const targetR = parseInt(hex.slice(0, 2), 16);
    const targetG = parseInt(hex.slice(2, 4), 16);
    const targetB = parseInt(hex.slice(4, 6), 16);

    // Process pixels
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];

      // Skip transparent pixels
      if (alpha < 128) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Perceived luminance
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // Replace dark pixels (map lines) with target color
      if (luminance < threshold) {
        data[i] = targetR;
        data[i + 1] = targetG;
        data[i + 2] = targetB;
        // Alpha unchanged
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Convert to HTMLImageElement
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const outImg = new window.Image();
      outImg.onload = () => {
        URL.revokeObjectURL(url);
        resolve(outImg);
      };
      outImg.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image decode failed'));
      };
      outImg.src = url;
    }, 'image/png');
  });
}
