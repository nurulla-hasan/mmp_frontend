import { StateCreator } from 'zustand';
import { ErrorToast } from '@/lib/utils';
import { extractImageFromPDF, detectPdfDpi } from '../../utils/pdfHelper';
import type { PdfDpiInfo } from '../../utils/pdfHelper';
import { detectImageAutoScaleHint, getPdfAutoScaleHint } from '../../utils/autoScale';
import type { AutoScaleHint } from '../../utils/autoScale';
import { computeImageHash, generateTilePyramidChunked, clearTileUrlCache, clearTiles, TILING_MIN_PIXEL_COUNT } from '../../utils/tiling';
import type { TilePyramidInfo } from '../../utils/tiling';

const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MAP_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

function detectMaxTextureSize(): number {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) return gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  } catch {
    // WebGL unavailable.
  }
  return 4096;
}

function getSafeMaxDimension(): number {
  return Math.min(detectMaxTextureSize(), 4096);
}

function downscaleImage(img: HTMLImageElement, maxPx: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const scale = Math.min(maxPx / w, maxPx / h, 1);
    if (scale >= 1) {
      resolve(img);
      return;
    }

    const cvs = document.createElement('canvas');
    cvs.width = Math.round(w * scale);
    cvs.height = Math.round(h * scale);
    const ctx = cvs.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas is not supported'));
      return;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

    const result = new window.Image();
    let objectUrl: string | null = null;
    result.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      cvs.width = 1;
      cvs.height = 1;
      resolve(result);
    };
    result.onerror = (error) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    cvs.toBlob((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        result.src = objectUrl;
      } else {
        result.src = cvs.toDataURL('image/png');
      }
    }, 'image/webp', 0.8);
  });
}

export interface ImageState {
  image: HTMLImageElement | null;
  _originalImage: HTMLImageElement | null;
  originalWidth: number;
  originalHeight: number;
  selectedFile: File | null;
  imageName: string;
  isProcessingFile: boolean;
  pdfDpiInfo: PdfDpiInfo | null;
  /** Trusted physical-density hint for the exact canvas coordinate system. */
  autoScaleHint: AutoScaleHint | null;
  tilePyramidInfo: TilePyramidInfo | null;
  isGeneratingTiles: boolean;
  tileProgress: number;
  _generationId: number;
  _activeTileHash: string | null;
}

export interface ImageActions {
  setImage: (image: HTMLImageElement | null) => void;
  setSelectedFile: (file: File | null) => void;
  setImageName: (name: string) => void;
  setAutoScaleHint: (hint: AutoScaleHint | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  processFile: (file: File) => Promise<boolean>;
  handleClearFile: () => Promise<void>;
  buildTilePyramid: () => Promise<void>;
}

export type ImageSlice = ImageState & ImageActions;

type CombinedScaleActions = {
  setScale?: (scale: number | null) => void;
};

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set, get) => ({
  image: null,
  _originalImage: null,
  originalWidth: 0,
  originalHeight: 0,
  selectedFile: null,
  imageName: 'map.jpg',
  isProcessingFile: false,
  pdfDpiInfo: null,
  autoScaleHint: null,
  tilePyramidInfo: null,
  isGeneratingTiles: false,
  tileProgress: 0,
  _generationId: 0,
  _activeTileHash: null,

  setImage: (image) => set({ image }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setImageName: (name) => set({ imageName: name }),
  setAutoScaleHint: (autoScaleHint) => set({ autoScaleHint }),

  handleImageUpload: async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const input = e.target;
    await get().processFile(file);
    input.value = '';
  },

  processFile: async (file: File) => {
    if (!ALLOWED_MAP_TYPES.has(file.type)) {
      ErrorToast('Only PDF, PNG, and JPG files are supported');
      return false;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      ErrorToast('File size is too large. Please upload a file smaller than 25 MB.');
      return false;
    }

    // Scale belongs to one exact raster. Never carry an old map's calibration
    // into a newly imported file.
    (get() as ImageSlice & CombinedScaleActions).setScale?.(null);
    try {
      localStorage.removeItem('mapScale');
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }

    const previousState = get();
    const generationId = previousState._generationId + 1;
    const previousHash = previousState.tilePyramidInfo?.imageHash ?? previousState._activeTileHash;

    if (previousHash) {
      clearTileUrlCache(previousHash);
      void clearTiles(previousHash).catch((error: unknown) => {
        console.error('Failed to clear previous map tiles:', error);
      });
    }

    set({
      _generationId: generationId,
      isProcessingFile: true,
      image: null,
      _originalImage: null,
      pdfDpiInfo: null,
      autoScaleHint: null,
      tilePyramidInfo: null,
      isGeneratingTiles: false,
      tileProgress: 0,
      _activeTileHash: null,
    });

    if (file.type === 'application/pdf') {
      set({ imageName: file.name || 'document.pdf' });
      try {
        const pdfBuffer = await file.arrayBuffer();
        const dpiInfo = await detectPdfDpi(pdfBuffer);
        const img = await extractImageFromPDF(pdfBuffer);
        const autoScaleHint = getPdfAutoScaleHint(dpiInfo, img.naturalWidth, img.naturalHeight);

        const safeMax = getSafeMaxDimension();
        let displayImg = img;
        if (img.naturalWidth > safeMax || img.naturalHeight > safeMax) {
          displayImg = await downscaleImage(img, safeMax);
        }
        if (get()._generationId !== generationId) return false;

        set({
          selectedFile: file,
          image: displayImg,
          _originalImage: img,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          pdfDpiInfo: dpiInfo,
          autoScaleHint,
          isProcessingFile: false,
        });
        get().buildTilePyramid();
        return true;
      } catch (error: unknown) {
        console.error('PDF processing failed:', error);
        if (get()._generationId === generationId) {
          set({ selectedFile: null, imageName: '', isProcessingFile: false, autoScaleHint: null });
          ErrorToast('Could not load PDF (file may be corrupted or invalid)');
        }
        return false;
      }
    }

    const imageScaleHintPromise = detectImageAutoScaleHint(file);
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    return new Promise<boolean>((resolve) => {
      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);
        try {
          const autoScaleHint = await imageScaleHintPromise;
          const safeMax = getSafeMaxDimension();
          let displayImg: HTMLImageElement = img;
          if (img.naturalWidth > safeMax || img.naturalHeight > safeMax) {
            displayImg = await downscaleImage(img, safeMax);
          }
          if (get()._generationId !== generationId) {
            resolve(false);
            return;
          }

          set({
            selectedFile: file,
            imageName: file.name || 'image',
            image: displayImg,
            _originalImage: img,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            pdfDpiInfo: null,
            autoScaleHint,
            isProcessingFile: false,
          });
          get().buildTilePyramid();
          resolve(true);
        } catch (error: unknown) {
          console.error('Map image preparation failed:', error);
          if (get()._generationId === generationId) {
            set({ selectedFile: null, imageName: '', isProcessingFile: false, autoScaleHint: null });
            ErrorToast('Could not prepare map image');
          }
          resolve(false);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        if (get()._generationId === generationId) {
          set({ selectedFile: null, imageName: '', isProcessingFile: false, autoScaleHint: null });
          ErrorToast('Could not decode map image');
        }
        resolve(false);
      };
    });
  },

  handleClearFile: async () => {
    set((state) => ({ _generationId: state._generationId + 1 }));
    const state = get();
    const hash = state.tilePyramidInfo?.imageHash ?? state._activeTileHash;
    if (hash) {
      clearTileUrlCache(hash);
      try {
        await clearTiles(hash);
      } catch (error: unknown) {
        console.error('Failed to clear tiles from IndexedDB:', error);
      }
    }
    set({
      image: null,
      _originalImage: null,
      originalWidth: 0,
      originalHeight: 0,
      selectedFile: null,
      imageName: '',
      pdfDpiInfo: null,
      autoScaleHint: null,
      isProcessingFile: false,
      tilePyramidInfo: null,
      isGeneratingTiles: false,
      tileProgress: 0,
      _activeTileHash: null,
    });
    (get() as ImageSlice & CombinedScaleActions).setScale?.(null);
    const fileInput = document.getElementById('map-upload') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  },

  buildTilePyramid: async () => {
    const state = get();
    const img = state._originalImage || state.image;
    if (!img) return;

    const totalPixels = img.naturalWidth * img.naturalHeight;
    if (totalPixels < TILING_MIN_PIXEL_COUNT) return;

    const generationId = state._generationId;
    const hash = await computeImageHash(img, state.imageName);
    if (get()._generationId !== generationId) return;

    set({ isGeneratingTiles: true, tileProgress: 0, _activeTileHash: hash });
    let lastReportedProgress = -1;

    try {
      const info = await generateTilePyramidChunked(
        img,
        hash,
        (percent) => {
          if (get()._generationId === generationId && percent !== lastReportedProgress) {
            lastReportedProgress = percent;
            set({ tileProgress: percent });
          }
        },
        8,
        () => get()._generationId !== generationId,
      );
      if (get()._generationId === generationId) {
        set({
          tilePyramidInfo: info,
          isGeneratingTiles: false,
          tileProgress: 100,
          _originalImage: null,
          _activeTileHash: null,
        });
      }
    } catch (error: unknown) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        console.error('Tile pyramid generation failed:', error);
      }
      if (get()._generationId === generationId) {
        set({ isGeneratingTiles: false, tileProgress: 0, _activeTileHash: null });
      }
    }
  },
});
