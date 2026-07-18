
import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { Group, Image as KonvaImage, Circle, Line } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { useDebounce } from '@/features/land-measurement/hooks/use-debounce';
import { StageCalibration } from './StageCalibration';
import { StagePlots } from './StagePlots';
import { StageActivePlot } from './StageActivePlot';
import {
  TILE_SIZE,
  getVisibleTiles,
  getTilePosition,
  getOrCreateTileUrl,
  loadTileImage,
} from '@/features/land-measurement/utils/tiling';

const MAGNIFIER_RADIUS = 55;
const ZOOM_FACTOR = 2.5;
const DISABLED_STAGE_POS = { x: 0, y: 0 };
const DISABLED_STAGE_SIZE = { width: 0, height: 0 };

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
        image: s.isMagnifierEnabled ? s.image : null,
        isMagnifierEnabled: s.isMagnifierEnabled,
        stagePos: s.isMagnifierEnabled ? s.stagePos : DISABLED_STAGE_POS,
        stageScale: s.isMagnifierEnabled ? s.stageScale : 1,
        stageSize: s.isMagnifierEnabled ? s.stageSize : DISABLED_STAGE_SIZE,
        tilePyramidInfo: s.isMagnifierEnabled ? s.tilePyramidInfo : null,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (ctx: any) => {
      ctx.arc(0, 0, MAGNIFIER_RADIUS / stageScale, 0, Math.PI * 2, false);
    },
    [stageScale],
  );

  const crosshairPoints = useMemo(() => [-10 / stageScale, 0, 10 / stageScale, 0], [stageScale]);
  const crosshairStrokeWidth = useMemo(() => 2 / stageScale, [stageScale]);
  const borderStrokeWidth = useMemo(() => 3 / stageScale, [stageScale]);
  const debouncedCenterX = useDebounce(localCenterX, 60);
  const debouncedCenterY = useDebounce(localCenterY, 60);
  const debouncedStageScale = useDebounce(stageScale, 60);

  // ── Tile-aware magnifier content ──
  const [magTiles, setMagTiles] = useState<MagTile[]>([]);
  const magMountedRef = useRef(true);
  const magTicketRef = useRef(0);

  useEffect(() => {
    magMountedRef.current = true;
    return () => { magMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!isMagnifierEnabled || !tilePyramidInfo || !image) {
      setMagTiles((current) => (current.length > 0 ? [] : current));
      return;
    }

    const hash = tilePyramidInfo.imageHash;
    // Magnifier viewport: a small area around the center at 2.5x zoom
    // The magnifier shows (MAGNIFIER_RADIUS*2 / stageScale) image-px diameter
    const magViewDiameter = (MAGNIFIER_RADIUS * 2) / debouncedStageScale;
    const magViewport = {
      x: debouncedCenterX - magViewDiameter / 2,
      y: debouncedCenterY - magViewDiameter / 2,
      width: magViewDiameter,
      height: magViewDiameter,
    };

    // At 2.5x zoom inside magnifier, effective scale for tile selection is higher
    const magScale = debouncedStageScale * ZOOM_FACTOR;
    const coords = getVisibleTiles(magViewport, magScale, tilePyramidInfo, 0);
    const ticket = ++magTicketRef.current;

    (async () => {
      try {
        const results = await Promise.all(
          coords.map(async (coord) => {
            const key = `${hash}:${coord.level}:${coord.row}:${coord.col}`;
            const pos = getTilePosition(coord, tilePyramidInfo);
            const url = await getOrCreateTileUrl(hash, coord.level, coord.row, coord.col);
            const element = await loadTileImage(url);
            return { key, x: pos.x, y: pos.y, scaleFactor: pos.scaleFactor, element };
          }),
        );

        if (ticket === magTicketRef.current && magMountedRef.current) {
          setMagTiles(results);
        }
      } catch {
        // Tiles not ready yet — keep previous
      }
    })();
  }, [
    isMagnifierEnabled,
    tilePyramidInfo,
    image,
    debouncedCenterX,
    debouncedCenterY,
    debouncedStageScale,
  ]);

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

StageMagnifier.displayName = 'StageMagnifier';

