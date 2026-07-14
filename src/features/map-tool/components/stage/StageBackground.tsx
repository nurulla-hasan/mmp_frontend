
import { Image as KonvaImage } from 'react-konva';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { TILING_MIN_PIXEL_COUNT } from '@/features/map-tool/utils/tiling';
import { TiledBackground } from './TiledBackground';

export const StageBackground = () => {
  const { image, tilePyramidInfo } = useMapStore();
  if (!image) return null;

  // Use tiled rendering for large images that have been tiled
  const useTiling = tilePyramidInfo !== null;
  if (useTiling) {
    return <TiledBackground />;
  }

  // Fall back to single KonvaImage for small images or while tiles are generating
  return <KonvaImage image={image} imageSmoothingEnabled={false} perfectDrawEnabled={false} />;
};
