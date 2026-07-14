
import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Circle, Line } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { StageCalibration } from './StageCalibration';
import { StagePlots } from './StagePlots';
import { StageActivePlot } from './StageActivePlot';
import {
  TILE_SIZE,
  getVisibleTiles,
  getTilePosition,
  getOrCreateTileUrl,
  loadTileImage,
  cleanupTileUrls,
} from '@/features/map-tool/utils/tiling';
import type { TilePyramidInfo } from '@/features/map-tool/utils/tiling';

const MAGNIFIER_RADIUS = 55;
const ZOOM_FACTOR = 2.5;

/** A single tile rendered inside the magnifier. */
interface MagTile {
  key: string;
  x: number;
  y: number;
  scaleFactor: number;
  element: HTMLImageElement;
}

export const StageMagnifier = memo(() => {
  const { image, isMagnifierEnabled, stagePos, stageScale, stageSize, tilePyramidInfo } =
    useMapStore(
      useShallow((s) => ({
        image: s.image,
        isMagnifierEnabled: s.isMagnifierEnabled,
        stagePos: s.stagePos,
        stageScale: s.stageScale,
        stageSize: s.stageSize,
        tilePyramidInfo: s.tilePyramidInfo,
      }))
    );

  // ── All hooks must be before early return ──
  const screenCenterX = stageSize.width / 2;
  const screenCenterY = stageSize.height / 2;

  const { localCenterX, localCenterY, localMagX, localMagY } = useMemo(() => {
    const lcx = (screenCenterX - stagePos.x) / stageScale;
    const lcy = (screenCenterY - stagePos.y) / stageScale;
    const screenMagX = stageSize.width - MAGNIFIER_RADIUS - 16;
    const screenMagY = MAGNIFIER_RADIUS + 16;
    return {
      localCenterX: lcx,
      localCenterY: lcy,
      localMagX: (screenMagX - stagePos.x) / stageScale,
      localMagY: (screenMagY - stagePos.y) / stageScale,
    };
  }, [screenCenterX, screenCenterY, stagePos.x, stagePos.y, stageScale, stageSize.width]);

  const clipFunc = useMemo(
    () => (ctx: any) => {
      ctx.arc(0, 0, MAGNIFIER_RADIUS / stageScale, 0, Math.PI * 2, false);
    },
    [stageScale],
  );

  const crosshairPoints = useMemo(() => [-10 / stageScale, 0, 10 / stageScale, 0], [stageScale]);
  const crosshairStrokeWidth = useMemo(() => 2 / stageScale, [stageScale]);
  const borderStrokeWidth = useMemo(() => 3 / stageScale, [stageScale]);

  // ── Tile-aware magnifier content ──
  const [magTiles, setMagTiles] = useState<MagTile[]>([]);
  const magMountedRef = useRef(true);
  const magTicketRef = useRef(0);

  useEffect(() => {
    magMountedRef.current = true;
    return () => { magMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!tilePyramidInfo || !image) return;

    const hash = tilePyramidInfo.imageHash;
    // Magnifier viewport: a small area around the center at 2.5x zoom
    // The magnifier shows (MAGNIFIER_RADIUS*2 / stageScale) image-px diameter
    const magViewDiameter = (MAGNIFIER_RADIUS * 2) / stageScale;
    const magViewport = {
      x: localCenterX - magViewDiameter / 2,
      y: localCenterY - magViewDiameter / 2,
      width: magViewDiameter,
      height: magViewDiameter,
    };

    // At 2.5x zoom inside magnifier, effective scale for tile selection is higher
    const magScale = stageScale * ZOOM_FACTOR;
    const coords = getVisibleTiles(magViewport, magScale, tilePyramidInfo, 0);
    const ticket = ++magTicketRef.current;

    (async () => {
      try {
        const newKeys = new Set<string>();
        const results = await Promise.all(
          coords.map(async (coord) => {
            const key = `${hash}:${coord.level}:${coord.row}:${coord.col}`;
            newKeys.add(key);
            const pos = getTilePosition(coord, tilePyramidInfo);
            const url = await getOrCreateTileUrl(hash, coord.level, coord.row, coord.col);
            const element = await loadTileImage(url);
            return { key, x: pos.x, y: pos.y, scaleFactor: pos.scaleFactor, element };
          }),
        );

        if (ticket === magTicketRef.current && magMountedRef.current) {
          setMagTiles(results);
          cleanupTileUrls(hash, newKeys);
        }
      } catch {
        // Tiles not ready yet — keep previous
      }
    })();
  }, [tilePyramidInfo, image, localCenterX, localCenterY, stageScale]);

  const useTiling = tilePyramidInfo !== null && magTiles.length > 0;

  const magnifiedContent = useMemo(
    () => {
      if (!image) return null;

      const imageContent = useTiling ? (
        magTiles.map((t) => (
          <KonvaImage
            key={t.key}
            x={t.x}
            y={t.y}
            image={t.element}
            width={TILE_SIZE}
            height={TILE_SIZE}
            scaleX={t.scaleFactor}
            scaleY={t.scaleFactor}
            imageSmoothingEnabled={false}
            perfectDrawEnabled={false}
          />
        ))
      ) : (
        <KonvaImage image={image} width={image.width} height={image.height} />
      );

      return (
        <Group scaleX={ZOOM_FACTOR} scaleY={ZOOM_FACTOR}>
          <Group x={-localCenterX} y={-localCenterY}>
            {imageContent}
            <StageCalibration />
            <StagePlots />
            <StageActivePlot />
          </Group>
        </Group>
      );
    },
    [image, useTiling, magTiles, localCenterX, localCenterY],
  );
  // ── End hooks ──

  if (!isMagnifierEnabled || !image || !stageSize.width) return null;

  return (
    <Group x={localMagX} y={localMagY} clipFunc={clipFunc}>
      <Circle radius={MAGNIFIER_RADIUS / stageScale} fill="white" />

      {magnifiedContent}

      <Line points={crosshairPoints} stroke="red" strokeWidth={crosshairStrokeWidth} />
      <Line points={crosshairPoints} stroke="red" strokeWidth={crosshairStrokeWidth} rotation={90} />

      <Circle radius={MAGNIFIER_RADIUS / stageScale} stroke="rgba(0,0,0,0.5)" strokeWidth={borderStrokeWidth} />
    </Group>
  );
});
