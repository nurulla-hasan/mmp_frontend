import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, PDFName } from 'pdf-lib';

// PDF.js worker — CDN (no extra file copy needed)
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;

export interface PdfDpiInfo {
  /** Estimated scanning DPI of the PDF's embedded image */
  dpi: number;
  /** Page width in inches */
  pageWidthInches: number;
  /** Page height in inches */
  pageHeightInches: number;
  /** Page width in PDF points (1pt = 1/72 inch) */
  pageWidthPoints: number;
  /** Page height in PDF points */
  pageHeightPoints: number;
  /** Native pixel width of the embedded scanned image */
  imageWidthPx: number;
  /** Native pixel height of the embedded scanned image */
  imageHeightPx: number;
}

/**
 * Detects the scanning DPI of a PDF by extracting the first page's
 * embedded image XObject dimensions via pdf-lib, then comparing
 * against the page's physical size.
 *
 * How it works:
 * - PDF page size is measured in `points` (1pt = 1/72 inch)
 * - Embedded scanned images have native pixel dimensions stored
 *   in the XObject dictionary (Width / Height)
 * - DPI = image_pixel_width / (page_width_points / 72)
 *
 * Best for scanned PDFs like Bangladesh mouza maps.
 * Returns `null` if the PDF has no detectable embedded image.
 */
/**
 * Detects the scanning DPI of a PDF by extracting the first page's
 * embedded image XObject dimensions via pdf-lib, then comparing
 * against the page's physical size.
 *
 * How it works:
 * - PDF page size is measured in `points` (1pt = 1/72 inch)
 * - Embedded scanned images have native pixel dimensions stored
 *   in the XObject dictionary (Width / Height)
 * - DPI = image_pixel_width / (page_width_points / 72)
 *
 * For Bangladesh mouza maps (scanned PDFs), this reliably returns
 * the scan DPI (usually 200, 300, or 600 DPI).
 *
 * Returns `null` if no embedded image XObject is found.
 */
type PdfSource = File | ArrayBuffer;

const MAX_PDF_RENDER_DIMENSION = 4096;
const MAX_PDF_RENDER_PIXELS = 12_000_000;

const readPdfBytes = async (source: PdfSource): Promise<ArrayBuffer> => {
  if (source instanceof File) {
    if (source.size > MAX_PDF_SIZE_BYTES) {
      throw new Error('PDF file is too large');
    }
    return source.arrayBuffer();
  }

  if (source.byteLength > MAX_PDF_SIZE_BYTES) {
    throw new Error('PDF file is too large');
  }

  return source;
};

export async function detectPdfDpi(source: PdfSource): Promise<PdfDpiInfo | null> {
  try {
    const buffer = await readPdfBytes(source);
    const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), {
      ignoreEncryption: true,
    });
    const firstPage = pdfDoc.getPages()[0];
    if (!firstPage) return null;

    const { width: pageWidthPts, height: pageHeightPts } = firstPage.getSize();
    const pageWidthInches = pageWidthPts / 72;
    const pageHeightInches = pageHeightPts / 72;
    let imageW = 0;
    let imageH = 0;

    if (typeof pdfDoc.context?.enumerateIndirectObjects === 'function') {
      for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = obj as any;
        if (!stream?.dict?.get) continue;

        const subtype = stream.dict.get(PDFName.of('Subtype'));
        if (subtype?.toString() !== '/Image') continue;

        const wNum = stream.dict.get(PDFName.of('Width'));
        const hNum = stream.dict.get(PDFName.of('Height'));
        const width = typeof wNum?.asNumber === 'function' ? wNum.asNumber() : 0;
        const height = typeof hNum?.asNumber === 'function' ? hNum.asNumber() : 0;

        if (width > pageWidthPts && width > imageW) {
          imageW = width;
          imageH = height;
        }
      }
    }

    if (imageW <= 0 || pageWidthInches <= 0) return null;

    return {
      dpi: Math.round(imageW / pageWidthInches),
      pageWidthInches,
      pageHeightInches,
      pageWidthPoints: Math.round(pageWidthPts),
      pageHeightPoints: Math.round(pageHeightPts),
      imageWidthPx: imageW,
      imageHeightPx: imageH,
    };
  } catch (error) {
    console.error('DPI detection error:', error);
    return null;
  }
}

export const extractImageFromPDF = async (
  source: PdfSource,
): Promise<HTMLImageElement> => {
  const buffer = await readPdfBytes(source);
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  try {
    const baseViewport = page.getViewport({ scale: 1 });
    const dimensionScale =
      MAX_PDF_RENDER_DIMENSION /
      Math.max(baseViewport.width, baseViewport.height);
    const pixelScale = Math.sqrt(
      MAX_PDF_RENDER_PIXELS /
      Math.max(1, baseViewport.width * baseViewport.height),
    );
    const renderScale = Math.max(
      0.1,
      Math.min(4, dimensionScale, pixelScale),
    );
    const viewport = page.getViewport({ scale: renderScale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is not supported');
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Unable to encode rendered PDF page'));
      }, 'image/png');
    });
    const objectUrl = URL.createObjectURL(blob);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const result = new window.Image();
      result.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      };
      result.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      result.src = objectUrl;
    });

    canvas.width = 1;
    canvas.height = 1;
    return image;
  } finally {
    page.cleanup();
    await loadingTask.destroy();
  }
};
