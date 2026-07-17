
import { memo } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
// import { TILING_MIN_PIXEL_COUNT } from '@/features/land-measurement/utils/tiling';
import { TiledBackground } from './TiledBackground';

/** Images below this pixel area won't crash even low-end GPUs. */

export const StageBackground = memo(function StageBackground() {
  const { image, tilePyramidInfo, originalWidth, originalHeight } = useMapStore(useShallow((s) => ({
    image: s.image,
    tilePyramidInfo: s.tilePyramidInfo,
    isGeneratingTiles: s.isGeneratingTiles,
    originalWidth: s.originalWidth,
    originalHeight: s.originalHeight,
  })));
  if (!image) return null;

  // Use tiled rendering for large images that have been tiled
  const useTiling = tilePyramidInfo !== null;
  if (useTiling) {
    return <TiledBackground />;
  }

  // The user requested to see the map while tiles are generating, 
  // so we won't return null here even if totalPixels > SAFE_FALLBACK_PIXELS.
  // if (isGeneratingTiles && totalPixels > SAFE_FALLBACK_PIXELS) {
  //   return null; 
  // }

  // Fall back to single KonvaImage for small images
  return (
    <KonvaImage 
      image={image} 
      width={originalWidth || image.naturalWidth}
      height={originalHeight || image.naturalHeight}
      imageSmoothingEnabled={true} 
      perfectDrawEnabled={false} 
    />
  );
});

