import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { useShallow } from 'zustand/shallow';
import { useDebounce } from '@/features/land-measurement/hooks/use-debounce';
import { TILE_SIZE, type TileCoord } from '@/features/land-measurement/utils/tiling/types';
import {
  getVisibleTiles,
  getTilePosition,
  getOrCreateTileUrl,
  loadTileImage,
} from '@/features/land-measurement/utils/tiling/visibleTiles';

interface TileRender {
  key: string;
  x: number;
  y: number;
  scaleFactor: number;
  element: HTMLImageElement;
}

const VIEWPORT_POSITION_STEP_PX = 24;
const quantizePosition = (value: number) =>
  Math.round(value / VIEWPORT_POSITION_STEP_PX) * VIEWPORT_POSITION_STEP_PX;
const quantizeScale = (value: number) => {
  const safe = Math.max(value, 0.0001);
  return Math.exp(Math.round(Math.log(safe) * 32) / 32);
};

/**
 * Renders a background image using tiling.
 * Only visible tiles at the appropriate pyramid level are rendered.
 */
export const TiledBackground = memo(() => {
  // Tile selection does not need every pixel of stage movement. Selecting
  // quantized primitives here prevents this component from re-rendering for
  // every raw pan/zoom store update while the Konva stage itself still moves smoothly.
  const { tilePyramidInfo, viewportX, viewportY, viewportScale, stageSize } = useMapStore(
    useShallow((s) => ({
      tilePyramidInfo: s.tilePyramidInfo,
      viewportX: quantizePosition(s.stagePos.x),
      viewportY: quantizePosition(s.stagePos.y),
      viewportScale: quantizeScale(s.stageScale),
      stageSize: s.stageSize,
    }))
  );

  const stagePos = useMemo(
    () => ({ x: viewportX, y: viewportY }),
    [viewportX, viewportY],
  );

  // Debounce viewport changes so tile lookup/loading does not chase interaction frames.
  const debouncedPos = useDebounce(stagePos, 80);
  const debouncedScale = useDebounce(viewportScale, 80);
  const debouncedSize = useDebounce(stageSize, 200);

  const [tileImages, setTileImages] = useState<TileRender[]>([]);
  const mountedRef = useRef(true);
  const pendingRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!tilePyramidInfo) {
      setTileImages([]);
      return;
    }

    const hash = tilePyramidInfo.imageHash;
    const viewport = {
      x: -debouncedPos.x / debouncedScale,
      y: -debouncedPos.y / debouncedScale,
      width: debouncedSize.width / debouncedScale,
      height: debouncedSize.height / debouncedScale,
    };

    const coords = getVisibleTiles(viewport, debouncedScale, tilePyramidInfo);
    const ticket = ++pendingRef.current;
    (async () => {
      try {
        const results = await Promise.all(
          coords.map(async (coord: TileCoord) => {
            const key = `${hash}:${coord.level}:${coord.row}:${coord.col}`;
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
        // Tile not yet cached (generation still in progress) — keep previous set.
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
