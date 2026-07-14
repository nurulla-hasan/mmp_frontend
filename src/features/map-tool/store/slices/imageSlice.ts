import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { extractImageFromPDF, detectPdfDpi } from '../../utils/pdfHelper';
import type { PdfDpiInfo } from '../../utils/pdfHelper';
import { computeImageHash, generateTilePyramidChunked, clearTileUrlCache, clearTiles, TILING_MIN_PIXEL_COUNT } from '../../utils/tiling';
import type { TilePyramidInfo } from '../../utils/tiling';

const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MAP_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

export interface ImageState {
  image: HTMLImageElement | null;
  selectedFile: File | null;
  imageName: string;
  isProcessingFile: boolean;
  /** Detected DPI info from PDF (only for PDF imports) */
  pdfDpiInfo: PdfDpiInfo | null;
  // Tiling
  tilePyramidInfo: TilePyramidInfo | null;
  isGeneratingTiles: boolean;
  tileProgress: number;
  /** Monotonic counter to discard stale tile generation completions. */
  _generationId: number;
}

export interface ImageActions {
  setImage: (image: HTMLImageElement | null) => void;
  setSelectedFile: (file: File | null) => void;
  setImageName: (name: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  processFile: (file: File) => Promise<boolean>;
  handleClearFile: () => Promise<void>;
  // Tiling
  buildTilePyramid: () => Promise<void>;
}

export type ImageSlice = ImageState & ImageActions;

export const createImageSlice: StateCreator<ImageSlice, [], [], ImageSlice> = (set, get, _store) => ({
  // State
  image: null,
  selectedFile: null,
  imageName: 'map.jpg',
  isProcessingFile: false,
  pdfDpiInfo: null,
  tilePyramidInfo: null,
  isGeneratingTiles: false,
  tileProgress: 0,
  _generationId: 0,

  // Actions
  setImage: (image) => set({ image }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setImageName: (name) => set({ imageName: name }),

  handleImageUpload: async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const input = e.target;
    await get().processFile(file);

    // Reset input value so same file can be selected again
    if (input) input.value = '';
  },

  processFile: async (file: File) => {
    if (!ALLOWED_MAP_TYPES.has(file.type)) {
      toast.error('শুধু পিডিএফ (PDF), পিএনজি (PNG) এবং জেপিজি (JPG) ফাইল আপলোড করা যাবে');
      return false;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error('ফাইলটি অনেক বড়। দয়া করে ২৫ মেগাবাইটের (25 MB) কম সাইজের ফাইল আপলোড করুন।');
      return false;
    }

    set({ isProcessingFile: true, image: null });

    if (file.type === 'application/pdf') {
      set({ imageName: file.name || 'document.pdf' });
      try {
        const [img, dpiInfo] = await Promise.all([
          extractImageFromPDF(file),
          detectPdfDpi(file),
        ]);
        set({ selectedFile: file, image: img, pdfDpiInfo: dpiInfo, isProcessingFile: false });
        if (dpiInfo) {
          console.info(`📐 PDF DPI detected: ${dpiInfo.dpi} DPI (page: ${dpiInfo.pageWidthInches.toFixed(1)}"×${dpiInfo.pageHeightInches.toFixed(1)}", image: ${dpiInfo.imageWidthPx}×${dpiInfo.imageHeightPx}px)`);
        }
        // Start tile building in the background
        get().buildTilePyramid();
        return true;
      } catch {
        set({ selectedFile: null, imageName: '', isProcessingFile: false });
        toast.error('PDF লোড করা যায়নি (ফাইলটি ক্ষতিগ্রস্ত বা অবৈধ হতে পারে)');
        return false;
      }
    } else {
      return new Promise<boolean>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          if (typeof event.target?.result !== 'string') {
            set({ isProcessingFile: false });
            toast.error('ম্যাপের ছবি লোড করা যায়নি');
            resolve(false);
            return;
          }
          img.src = event.target.result;
          img.onload = () => {
            set({ selectedFile: file, imageName: file.name || 'image', image: img, isProcessingFile: false });
            // Start tile building in the background
            get().buildTilePyramid();
            resolve(true);
          };
          img.onerror = () => {
            set({ selectedFile: null, imageName: '', isProcessingFile: false });
            toast.error('ম্যাপের ছবি ডিকোড করা যায়নি');
            resolve(false);
          };
        };
        reader.onerror = () => {
          set({ selectedFile: null, imageName: '', isProcessingFile: false });
          toast.error('ম্যাপের ছবি পড়া যায়নি');
          resolve(false);
        };
        reader.readAsDataURL(file);
      });
    }
  },

  handleClearFile: async () => {
    // Bump generation counter to cancel any in-flight tile build
    set((s) => ({ _generationId: s._generationId + 1 }));
    // Clear tile caches and IndexedDB tiles if we had a pyramid
    const state = get();
    if (state.tilePyramidInfo) {
      const hash = state.tilePyramidInfo.imageHash;
      clearTileUrlCache(hash);
      try {
        await clearTiles(hash);
      } catch (err) {
        console.error('Failed to clear tiles from IndexedDB:', err);
      }
    }
    set({ image: null, selectedFile: null, imageName: '', pdfDpiInfo: null, isProcessingFile: false, tilePyramidInfo: null, isGeneratingTiles: false, tileProgress: 0 });
    const fileInput = document.getElementById('map-upload') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  },

  buildTilePyramid: async () => {
    const state = get();
    const img = state.image;
    if (!img) return;

    // Only tile for images above the pixel threshold
    const totalPixels = img.naturalWidth * img.naturalHeight;
    if (totalPixels < TILING_MIN_PIXEL_COUNT) return;

    const hash = await computeImageHash(img, state.imageName);
    const generationId = state._generationId;

    set({ isGeneratingTiles: true, tileProgress: 0 });

    try {
      const info = await generateTilePyramidChunked(
        img,
        hash,
        (percent) => {
          // Only update progress if still the active generation
          if (get()._generationId === generationId) {
            set({ tileProgress: percent });
          }
        },
        12,
      );
      // Only commit result if still the active generation
      if (get()._generationId === generationId) {
        set({ tilePyramidInfo: info, isGeneratingTiles: false, tileProgress: 100 });
      }
    } catch (err) {
      console.error('Tile pyramid generation failed:', err);
      // Only reset state if still the active generation
      if (get()._generationId === generationId) {
        set({ isGeneratingTiles: false, tileProgress: 0 });
      }
    }
  },
});
