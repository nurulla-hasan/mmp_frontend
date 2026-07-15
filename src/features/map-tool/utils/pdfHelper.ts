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
export async function detectPdfDpi(file: File): Promise<PdfDpiInfo | null> {
  if (file.size > MAX_PDF_SIZE_BYTES) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (!(event.target?.result instanceof ArrayBuffer)) {
          console.warn('DPI detect: no ArrayBuffer');
          resolve(null);
          return;
        }
        const pdfBytes = new Uint8Array(event.target.result);
        console.log(`DPI detect: loaded ${pdfBytes.length} bytes`);

        // ── pdf-lib: extract page size + scan XObject images ──
        const pdfDoc = await PDFDocument.load(pdfBytes, {
          ignoreEncryption: true,
        });
        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
          console.warn('DPI detect: PDF has no pages');
          resolve(null);
          return;
        }

        const firstPage = pages[0];
        const { width: pageWidthPts, height: pageHeightPts } = firstPage.getSize();
        const pageWidthInches = pageWidthPts / 72;
        const pageHeightInches = pageHeightPts / 72;

        console.log(`DPI detect: page = ${pageWidthPts}×${pageHeightPts} pts (${pageWidthInches.toFixed(2)}"×${pageHeightInches.toFixed(2)}")`);

        // Scan ALL indirect objects for image XObjects
        let imageW = 0;
        let imageH = 0;
        let xObjectCount = 0;

        if (typeof pdfDoc.context?.enumerateIndirectObjects === 'function') {
          for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stream = obj as any;
            if (stream?.dict?.get) {
              const subtype = stream.dict.get(PDFName.of('Subtype'));
              if (subtype?.toString() === '/Image') {
                xObjectCount++;
                const wNum = stream.dict.get(PDFName.of('Width'));
                const hNum = stream.dict.get(PDFName.of('Height'));
                const w = typeof wNum?.asNumber === 'function' ? wNum.asNumber() : 0;
                const h = typeof hNum?.asNumber === 'function' ? hNum.asNumber() : 0;
                console.log(`DPI detect: XObject #${xObjectCount} = ${w}×${h}`);

                // Only consider images larger than the page itself
                // (filters out small icons, stamps, logos)
                if (w > pageWidthPts && w > imageW) {
                  imageW = w;
                  imageH = h;
                }
              }
            }
          }
        } else {
          console.warn('DPI detect: enumerateIndirectObjects not available');
        }

        console.log(`DPI detect: found ${xObjectCount} image XObjects, best = ${imageW}×${imageH}`);

        if (imageW > 0 && pageWidthInches > 0) {
          const rawDpi = imageW / pageWidthInches;
          const dpi = Math.round(rawDpi);
          console.log(`DPI detect: DPI = ${imageW} / ${pageWidthInches.toFixed(2)} = ${rawDpi.toFixed(1)} → ${dpi}`);
          resolve({
            dpi,
            pageWidthInches,
            pageHeightInches,
            pageWidthPoints: Math.round(pageWidthPts),
            pageHeightPoints: Math.round(pageHeightPts),
            imageWidthPx: imageW,
            imageHeightPx: imageH,
          });
        } else {
          console.warn('DPI detect: no image XObject found larger than page');
          resolve(null);
        }
      } catch (error) {
        console.error('DPI detection error:', error);
        resolve(null);
      }
    };
    reader.onerror = (err) => {
      console.error('DPI detect: FileReader error', err);
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });
}

export const extractImageFromPDF = async (file: File): Promise<HTMLImageElement> => {
  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error("PDF file is too large");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (!(event.target?.result instanceof ArrayBuffer)) {
          throw new Error("Unable to read PDF data");
        }
        const typedarray = new Uint8Array(event.target.result);
        const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 4.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error("Canvas is not supported");
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        
        const img = new window.Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
          resolve(img);
        };
        img.onerror = (err) => {
          reject(err);
        };
      } catch (error) {
        console.error("Error processing PDF:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};
