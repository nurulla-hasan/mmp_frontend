
import { Image as KonvaImage } from 'react-konva';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { TILING_MIN_PIXEL_COUNT } from '@/features/map-tool/utils/tiling';
import { TiledBackground } from './TiledBackground';

/** Images below this pixel area won't crash even low-end GPUs. */
const SAFE_FALLBACK_PIXELS = 2_000_000; // ~2 MP (e.g. 1920×1080)

export const StageBackground = () => {
  const { image, tilePyramidInfo, isGeneratingTiles } = useMapStore();
  if (!image) return null;

  // Use tiled rendering for large images that have been tiled
  const useTiling = tilePyramidInfo !== null;
  if (useTiling) {
    return <TiledBackground />;
  }

  // While tiles are generating, only show the image if it's GPU-safe
  const totalPixels = image.naturalWidth * image.naturalHeight;
  if (isGeneratingTiles && totalPixels > SAFE_FALLBACK_PIXELS) {
    return null; // Wait for tiles — don't risk GPU crash
  }

  // Fall back to single KonvaImage for small images
  return <KonvaImage image={image} imageSmoothingEnabled={false} perfectDrawEnabled={false} />;
};
