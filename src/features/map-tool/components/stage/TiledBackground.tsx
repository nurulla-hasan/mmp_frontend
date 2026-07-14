import { memo, useState, useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { useDebounce } from '@/hooks/use-debounce';
import { TILE_SIZE, type TileCoord } from '@/features/map-tool/utils/tiling/types';
import {
  getVisibleTiles,
  getTilePosition,
  getOrCreateTileUrl,
  cleanupTileUrls,
  loadTileImage,
} from '@/features/map-tool/utils/tiling/visibleTiles';

interface TileRender {
  key: string;
  x: number;
  y: number;
  scaleFactor: number;
  element: HTMLImageElement;
}

/**
 * Renders a background image using tiling.
 * Only visible tiles at the appropriate pyramid level are rendered,
 * dramatically reducing GPU memory for large images.
 */
export const TiledBackground = memo(() => {
  const tilePyramidInfo = useMapStore((s) => s.tilePyramidInfo);
  const stagePos = useMapStore((s) => s.stagePos);
  const stageScale = useMapStore((s) => s.stageScale);
  const stageSize = useMapStore((s) => s.stageSize);

  // Debounce stage values so we don't recompute tiles on every pixel of pan
  const debouncedPos = useDebounce(stagePos, 80);
  const debouncedScale = useDebounce(stageScale, 80);
  const debouncedSize = useDebounce(stageSize, 200);

  const [tileImages, setTileImages] = useState<TileRender[]>([]);
  const mountedRef = useRef(true);
  const pendingRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Recompute visible tiles when debounced viewport changes
  useEffect(() => {
    if (!tilePyramidInfo) {
      setTileImages([]);
      return;
    }

    const hash = tilePyramidInfo.imageHash;
    // Use debounced values for computation
    const viewport = {
      x: -debouncedPos.x / debouncedScale,
      y: -debouncedPos.y / debouncedScale,
      width: debouncedSize.width / debouncedScale,
      height: debouncedSize.height / debouncedScale,
    };

    const coords = getVisibleTiles(viewport, debouncedScale, tilePyramidInfo);
    const ticket = ++pendingRef.current;
    const newKeys = new Set<string>();

    // Clean up stale tile URLs immediately — free GPU memory before loading new tiles
    cleanupTileUrls(hash, newKeys);

    (async () => {
      try {
        const results = await Promise.all(
          coords.map(async (coord: TileCoord) => {
            const key = `${hash}:${coord.level}:${coord.row}:${coord.col}`;
            newKeys.add(key);
            const pos = getTilePosition(coord, tilePyramidInfo);
            const url = await getOrCreateTileUrl(hash, coord.level, coord.row, coord.col);
            const element = await loadTileImage(url);
            return { key, x: pos.x, y: pos.y, scaleFactor: pos.scaleFactor, element };
          }),
        );

        if (ticket === pendingRef.current && mountedRef.current) {
          setTileImages(results);
        }
      } catch {
        // Tile not yet cached (generation still in progress) — keep previous set
      }
    })();
  }, [tilePyramidInfo, debouncedPos, debouncedScale, debouncedSize]);

  if (!tileImages.length) return null;

  return (
    <>
      {tileImages.map((tile) => (
        <KonvaImage
          key={tile.key}
          x={tile.x}
          y={tile.y}
          image={tile.element}
          width={TILE_SIZE}
          height={TILE_SIZE}
          scaleX={tile.scaleFactor}
          scaleY={tile.scaleFactor}
          imageSmoothingEnabled={false}
          perfectDrawEnabled={false}
        />
      ))}
    </>
  );
});

TiledBackground.displayName = 'TiledBackground';
