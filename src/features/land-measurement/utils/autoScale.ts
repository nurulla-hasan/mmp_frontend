import type { PdfDpiInfo } from './pdfHelper';

export const DEFAULT_MOUZA_FEET_PER_MAP_INCH = 330;
const MIN_SAFE_IMAGE_DPI = 100;
const MIN_SAFE_PDF_DPI = 72;
const MAX_SAFE_DPI = 1200;
const MAX_AXIS_MISMATCH_RATIO = 0.02;

export type AutoScaleSource = 'jpeg-jfif' | 'png-phys' | 'pdf-page';

export type AutoScaleHint = {
  source: AutoScaleSource;
  dpi: number;
};

export type MouzaScaleOption = {
  inchesPerMile: number;
  feetPerMapInch: number;
  label: string;
  detail: string;
};

export const MOUZA_SCALE_OPTIONS: MouzaScaleOption[] = [
  { inchesPerMile: 16, feetPerMapInch: 330, label: '১৬ ইঞ্চি = ১ মাইল', detail: '১ ইঞ্চি = ৩৩০ ফুট' },
  { inchesPerMile: 32, feetPerMapInch: 165, label: '৩২ ইঞ্চি = ১ মাইল', detail: '১ ইঞ্চি = ১৬৫ ফুট' },
  { inchesPerMile: 64, feetPerMapInch: 82.5, label: '৬৪ ইঞ্চি = ১ মাইল', detail: '১ ইঞ্চি = ৮২.৫ ফুট' },
  { inchesPerMile: 80, feetPerMapInch: 66, label: '৮০ ইঞ্চি = ১ মাইল', detail: '১ ইঞ্চি = ৬৬ ফুট' },
];

function validDpiPair(x: number, y: number, minDpi: number): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < minDpi || y < minDpi || x > MAX_SAFE_DPI || y > MAX_SAFE_DPI) return false;
  const average = (x + y) / 2;
  return average > 0 && Math.abs(x - y) / average <= MAX_AXIS_MISMATCH_RATIO;
}

function buildHint(source: AutoScaleSource, x: number, y: number, minDpi: number): AutoScaleHint | null {
  if (!validDpiPair(x, y, minDpi)) return null;
  return { source, dpi: (x + y) / 2 };
}

function readJfifDpi(bytes: Uint8Array): AutoScaleHint | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 3 < bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    if (offset >= bytes.length) break;

    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 1 >= bytes.length) break;

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2) break;
    const dataStart = offset + 2;
    const dataEnd = offset + segmentLength;
    if (dataEnd > bytes.length) break;

    const isJfif = marker === 0xe0
      && dataEnd - dataStart >= 12
      && bytes[dataStart] === 0x4a
      && bytes[dataStart + 1] === 0x46
      && bytes[dataStart + 2] === 0x49
      && bytes[dataStart + 3] === 0x46
      && bytes[dataStart + 4] === 0x00;

    if (isJfif) {
      const unit = bytes[dataStart + 7];
      let x = (bytes[dataStart + 8] << 8) | bytes[dataStart + 9];
      let y = (bytes[dataStart + 10] << 8) | bytes[dataStart + 11];
      if (unit === 2) {
        x *= 2.54;
        y *= 2.54;
      } else if (unit !== 1) {
        return null;
      }
      return buildHint('jpeg-jfif', x, y, MIN_SAFE_IMAGE_DPI);
    }

    offset = dataEnd;
  }

  return null;
}

function readPngDpi(bytes: Uint8Array): AutoScaleHint | null {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length < 8 || !signature.every((value, index) => bytes[index] === value)) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset, false);
    const typeOffset = offset + 4;
    const dataOffset = offset + 8;
    const end = dataOffset + length + 4;
    if (end > bytes.length) break;

    const type = String.fromCharCode(
      bytes[typeOffset],
      bytes[typeOffset + 1],
      bytes[typeOffset + 2],
      bytes[typeOffset + 3],
    );
    if (type === 'pHYs' && length >= 9) {
      const xPpm = view.getUint32(dataOffset, false);
      const yPpm = view.getUint32(dataOffset + 4, false);
      const unit = bytes[dataOffset + 8];
      if (unit !== 1) return null;
      const xDpi = xPpm * 0.0254;
      const yDpi = yPpm * 0.0254;
      return buildHint('png-phys', xDpi, yDpi, MIN_SAFE_IMAGE_DPI);
    }
    if (type === 'IEND') break;
    offset = end;
  }

  return null;
}

export async function detectImageAutoScaleHint(file: File): Promise<AutoScaleHint | null> {
  try {
    const header = new Uint8Array(await file.slice(0, 128 * 1024).arrayBuffer());
    if (file.type === 'image/jpeg') return readJfifDpi(header);
    if (file.type === 'image/png') return readPngDpi(header);
    return null;
  } catch {
    return null;
  }
}

export function getPdfAutoScaleHint(
  info: PdfDpiInfo | null,
  renderedWidth: number,
  renderedHeight: number,
): AutoScaleHint | null {
  if (!info || info.pageWidthInches <= 0 || info.pageHeightInches <= 0) return null;
  const dpiX = renderedWidth / info.pageWidthInches;
  const dpiY = renderedHeight / info.pageHeightInches;
  return buildHint('pdf-page', dpiX, dpiY, MIN_SAFE_PDF_DPI);
}

export function scalePxPerFtFromHint(hint: AutoScaleHint, feetPerMapInch: number): number | null {
  if (!Number.isFinite(feetPerMapInch) || feetPerMapInch <= 0) return null;
  const value = hint.dpi / feetPerMapInch;
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function autoScaleSourceLabel(source: AutoScaleSource): string {
  if (source === 'pdf-page') return 'PDF পেজের মাপ';
  if (source === 'png-phys') return 'PNG-এর physical DPI';
  return 'JPG-এর DPI';
}
