'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Crosshair,
  Download,
  FileUp,
  Globe2,
  ImageIcon,
  MapPinned,
  RotateCcw,
  RotateCw,
  Settings2,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { extractImageFromPDF } from '@/features/land-measurement/utils/pdfHelper';
import { useMediaQuery } from '@/hooks/useUtilityHooks';
import { ErrorToast, SuccessToast } from '@/lib/utils';
import type {
  AlignmentMode,
  ControlPair,
  GeoPoint,
  GeoTransform,
  MercatorPoint,
  Point2D,
} from '../types';
import {
  calculateResidualMeters,
  rotateGeoTransform,
  scaleGeoTransform,
  solveGeoTransform,
  translateGeoTransform,
} from '../utils/geoMath';
import { exportMouzaKmz } from '../utils/kmz';
import SourceMapCanvas from './SourceMapCanvas';
import WorldMapCanvas from './WorldMapCanvas';

type ActiveView = 'source' | 'world';
type InteractionTarget = 'map' | 'pdf';

type FloatingToolButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  mobile?: boolean;
};

function FloatingToolButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  mobile = false,
}: FloatingToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="inline-flex" />}
        className="focus:outline-none focus-visible:outline-none"
      >
        <Button
          type="button"
          variant={active ? 'default' : 'ghost'}
          size={mobile ? 'icon' : 'icon-lg'}
          disabled={disabled}
          onClick={onClick}
          className={active ? '' : 'text-muted-foreground'}
        >
          <Icon className={mobile ? 'size-4' : 'size-5'} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side={mobile ? 'top' : 'left'} sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Image read করা যায়নি'));
    reader.onerror = () => reject(new Error('Image read করা যায়নি'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load করা যায়নি'));
    image.src = src;
  });

const normalizeAsPng = (image: HTMLImageElement) => {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Image canvas তৈরি করা যায়নি');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/png');
};

export default function MouzaGeoStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [mapName, setMapName] = useState('mouza-map');
  const [loadingFile, setLoadingFile] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('source');
  const [interactionTarget, setInteractionTarget] =
    useState<InteractionTarget>('map');
  const [controlPairs, setControlPairs] = useState<ControlPair[]>([]);
  const [pendingSource, setPendingSource] = useState<Point2D | null>(null);
  const [alignmentMode, setAlignmentMode] =
    useState<AlignmentMode>('similarity');
  const [transform, setTransform] = useState<GeoTransform | null>(null);
  const [opacity, setOpacity] = useState(0.62);

  const imageSize = useMemo(
    () => ({
      width: image?.naturalWidth || image?.width || 0,
      height: image?.naturalHeight || image?.height || 0,
    }),
    [image],
  );

  const imageCenter = useMemo(
    () => ({ x: imageSize.width / 2, y: imageSize.height / 2 }),
    [imageSize],
  );

  const residual = useMemo(
    () =>
      transform ? calculateResidualMeters(transform, controlPairs) : null,
    [controlPairs, transform],
  );

  const resetAlignment = () => {
    setControlPairs([]);
    setPendingSource(null);
    setTransform(null);
    setAlignmentMode('similarity');
    setInteractionTarget('map');
  };

  const handleFile = async (file: File) => {
    setLoadingFile(true);

    try {
      const loadedImage =
        file.type === 'application/pdf'
          ? await extractImageFromPDF(file)
          : await loadImage(await toDataUrl(file));

      if (!loadedImage) throw new Error('PDF থেকে map পাওয়া যায়নি');

      const png = normalizeAsPng(loadedImage);
      const normalizedImage = await loadImage(png);

      setImage(normalizedImage);
      setImageDataUrl(png);
      setMapName(file.name.replace(/\.[^.]+$/, '') || 'mouza-map');
      resetAlignment();
      setActiveView('source');
      setSettingsOpen(false);
      SuccessToast('মৌজা ম্যাপ প্রস্তুত হয়েছে');
    } catch (error: unknown) {
      ErrorToast(
        error instanceof Error ? error.message : 'Map load করা যায়নি',
      );
    } finally {
      setLoadingFile(false);
    }
  };

  const fitTransform = (
    pairs: ControlPair[],
    mode: AlignmentMode,
    showToast = true,
  ) => {
    if (!image) return;

    try {
      const fitted = solveGeoTransform(pairs, imageSize, mode);
      setTransform(fitted);
      setAlignmentMode(mode);
      setInteractionTarget('map');

      if (showToast) {
        SuccessToast(
          mode === 'affine'
            ? 'Affine refinement apply হয়েছে'
            : 'Similarity alignment apply হয়েছে',
        );
      }
    } catch (error: unknown) {
      if (showToast) {
        ErrorToast(
          error instanceof Error ? error.message : 'Alignment করা যায়নি',
        );
      }
    }
  };

  const handleSourcePoint = (point: Point2D) => {
    setPendingSource(point);
    setActiveView('world');
    setInteractionTarget('map');
  };

  const handleWorldPoint = (world: GeoPoint) => {
    if (!pendingSource) return;

    const nextPairs = [
      ...controlPairs,
      {
        id: `geo_pair_${Date.now()}_${controlPairs.length}`,
        source: pendingSource,
        world,
      },
    ];

    setControlPairs(nextPairs);
    setPendingSource(null);

    if (nextPairs.length >= 2) {
      fitTransform(
        nextPairs,
        alignmentMode === 'affine' && nextPairs.length >= 3
          ? 'affine'
          : 'similarity',
        false,
      );
    }

    setActiveView('source');
  };

  const removePair = (id: string) => {
    const nextPairs = controlPairs.filter((pair) => pair.id !== id);
    setControlPairs(nextPairs);

    const required = alignmentMode === 'affine' ? 3 : 2;

    if (nextPairs.length >= required) {
      fitTransform(nextPairs, alignmentMode, false);
    } else if (nextPairs.length >= 2) {
      fitTransform(nextPairs, 'similarity', false);
    } else {
      setTransform(null);
    }
  };

  const handleTranslate = (delta: MercatorPoint) => {
    setTransform((current) =>
      current ? translateGeoTransform(current, delta) : current,
    );
  };

  const handleScale = (factor: number) => {
    setTransform((current) =>
      current
        ? scaleGeoTransform(current, imageCenter, factor)
        : current,
    );
  };

  const handleRotate = (angleRadians: number) => {
    setTransform((current) =>
      current
        ? rotateGeoTransform(current, imageCenter, angleRadians)
        : current,
    );
  };

  const handleExport = () => {
    if (!transform || !imageDataUrl || !image) {
      ErrorToast('KMZ export-এর আগে map align করুন');
      return;
    }

    exportMouzaKmz({
      transform,
      imageDataUrl,
      imageSize,
      name: mapName,
    });
    SuccessToast('KMZ export শুরু হয়েছে');
  };

  const settingsBody = (
    <div className="space-y-6 p-4">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            মৌজা ম্যাপ
          </h3>
          {image && <span className="text-xs text-primary">Ready</span>}
        </div>
        <button
          type="button"
          disabled={loadingFile}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <FileUp className="size-4" />
          {loadingFile
            ? 'Load হচ্ছে…'
            : image
              ? 'ম্যাপ পরিবর্তন'
              : 'PDF / Image আপলোড'}
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Control points
          </h3>
          <span className="font-mono text-xs text-muted-foreground">
            {controlPairs.length} pair
          </span>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          PDF-এ point দিলে World Map খুলবে। একই জায়গায় click করুন।
        </p>
        <div className="space-y-2">
          {controlPairs.map((pair, index) => (
            <div
              key={pair.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {pair.world.lat.toFixed(6)}, {pair.world.lng.toFixed(6)}
              </span>
              <button
                type="button"
                title="Point pair মুছুন"
                aria-label="Point pair মুছুন"
                onClick={() => removePair(pair.id)}
                className="text-muted-foreground transition hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {controlPairs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              PDF view-এ প্রথম point দিন
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alignment
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={controlPairs.length < 2}
            onClick={() => fitTransform(controlPairs, 'similarity')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-40"
          >
            Similarity
          </button>
          <button
            type="button"
            disabled={controlPairs.length < 3}
            onClick={() => fitTransform(controlPairs, 'affine')}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-40"
          >
            Affine refine
          </button>
        </div>

        {transform && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">
                {alignmentMode === 'affine' ? 'Affine' : 'Similarity'} active
              </span>
              <span className="font-mono text-muted-foreground">
                RMS {residual?.toFixed(2)}m
              </span>
            </div>
          </div>
        )}

        <label className="block text-xs text-muted-foreground">
          <span className="mb-1 flex justify-between">
            <span>PDF opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </span>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round(opacity * 100)}
            onChange={(event) =>
              setOpacity(Number(event.target.value) / 100)
            }
            className="w-full accent-primary"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          KMZ Export
        </h3>
        <label className="block text-xs text-muted-foreground">
          <span className="mb-1 block">ফাইলের নাম</span>
          <input
            value={mapName}
            onChange={(event) => setMapName(event.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          disabled={!transform || !imageDataUrl}
          onClick={handleExport}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
        >
          <Download className="size-4" />
          KMZ Export
        </button>
        <button
          type="button"
          onClick={resetAlignment}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Alignment reset
        </button>
      </section>
    </div>
  );

  const mapControlsDisabled =
    activeView !== 'world' || !transform || Boolean(pendingSource);

  const toolbar = (mobile: boolean) => (
    <>
      <FloatingToolButton
        icon={Settings2}
        label="ম্যাপ ও সেটিংস"
        active={settingsOpen}
        onClick={() => setSettingsOpen((open) => !open)}
        mobile={mobile}
      />
      <div
        className={
          mobile
            ? 'mx-0.5 h-6 w-px bg-border/60'
            : 'my-0.5 h-px w-6 bg-border/60'
        }
      />
      <FloatingToolButton
        icon={MapPinned}
        label="World Map control"
        active={
          activeView === 'world' &&
          interactionTarget === 'map' &&
          !mapControlsDisabled
        }
        disabled={mapControlsDisabled}
        onClick={() => setInteractionTarget('map')}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={Crosshair}
        label="PDF overlay control"
        active={
          activeView === 'world' &&
          interactionTarget === 'pdf' &&
          !mapControlsDisabled
        }
        disabled={mapControlsDisabled}
        onClick={() => setInteractionTarget('pdf')}
        mobile={mobile}
      />
      <div
        className={
          mobile
            ? 'mx-0.5 h-6 w-px bg-border/60'
            : 'my-0.5 h-px w-6 bg-border/60'
        }
      />
      <FloatingToolButton
        icon={ZoomOut}
        label="PDF ছোট করুন"
        disabled={!transform}
        onClick={() => handleScale(1 / 1.02)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={ZoomIn}
        label="PDF বড় করুন"
        disabled={!transform}
        onClick={() => handleScale(1.02)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCcw}
        label="PDF বামে ঘোরান"
        disabled={!transform}
        onClick={() => handleRotate(-Math.PI / 180)}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCw}
        label="PDF ডানে ঘোরান"
        disabled={!transform}
        onClick={() => handleRotate(Math.PI / 180)}
        mobile={mobile}
      />
      <div
        className={
          mobile
            ? 'mx-0.5 h-6 w-px bg-border/60'
            : 'my-0.5 h-px w-6 bg-border/60'
        }
      />
      <FloatingToolButton
        icon={Download}
        label="KMZ Export"
        disabled={!transform || !imageDataUrl}
        onClick={handleExport}
        mobile={mobile}
      />
      <FloatingToolButton
        icon={RotateCcw}
        label="Alignment reset"
        disabled={!image}
        onClick={resetAlignment}
        mobile={mobile}
      />
    </>
  );

  return (
    <div className="relative h-dvh min-h-0 overflow-hidden bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />

      <main className="absolute inset-0 min-h-0 min-w-0 overflow-hidden">
        {!image ? (
          <div className="grid h-full place-items-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Globe2 className="size-8" />
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold">
                মৌজা ম্যাপ Georeference করুন
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Settings থেকে PDF অথবা image upload করুন।
              </p>
              <button
                type="button"
                disabled={loadingFile}
                onClick={() => fileInputRef.current?.click()}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <FileUp className="size-4" />
                {loadingFile ? 'Load হচ্ছে…' : 'PDF / Image আপলোড'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`absolute inset-0 ${
                activeView === 'source'
                  ? 'visible'
                  : 'invisible pointer-events-none'
              }`}
            >
              <SourceMapCanvas
                image={image}
                controlPairs={controlPairs}
                pendingSource={pendingSource}
                active={activeView === 'source'}
                onPlacePoint={handleSourcePoint}
              />
            </div>

            <div
              className={`absolute inset-0 ${
                activeView === 'world'
                  ? 'visible'
                  : 'invisible pointer-events-none'
              }`}
            >
              <WorldMapCanvas
                active={activeView === 'world'}
                image={image}
                transform={transform}
                controlPairs={controlPairs}
                waitingForWorldPoint={Boolean(pendingSource)}
                opacity={opacity}
                interactionTarget={interactionTarget}
                onPlaceWorldPoint={handleWorldPoint}
                onTranslateOverlay={handleTranslate}
                onScaleOverlay={handleScale}
                onRotateOverlay={handleRotate}
              />
            </div>
          </>
        )}
      </main>

      <nav className="absolute left-1/2 top-3 z-40 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
        <Link
          href="/tools"
          title="টুলস পেজে ফিরুন"
          aria-label="টুলস পেজে ফিরুন"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <p className="hidden px-2 text-xs font-bold text-foreground sm:block">
          Mouza Geo Studio
        </p>
        <div className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          disabled={!image}
          onClick={() => setActiveView('source')}
          className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-40 ${
            activeView === 'source'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ImageIcon className="size-4" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          disabled={!image}
          onClick={() => setActiveView('world')}
          className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-40 ${
            activeView === 'world'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Globe2 className="size-4" />
          <span>World Map</span>
        </button>

        {transform && (
          <span className="ml-1 hidden rounded-lg bg-primary/10 px-2 py-2 text-[10px] font-semibold text-primary md:block">
            {alignmentMode === 'affine' ? 'Affine' : 'Aligned'}
          </span>
        )}
      </nav>

      <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/90 p-1.5 shadow-xl md:flex">
        {toolbar(false)}
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-40 flex w-max max-w-[95vw] -translate-x-1/2 items-center gap-1 overflow-x-auto whitespace-nowrap rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl md:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {toolbar(true)}
      </div>

      {settingsOpen && (
        <>
          <aside className="absolute left-4 top-4 z-50 hidden max-h-[calc(100dvh-2rem)] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card/95 text-card-foreground shadow-2xl backdrop-blur-md md:flex">
            <header className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h2 className="font-heading text-sm font-semibold">
                  ম্যাপ ও সেটিংস
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Point pair → Align → KMZ
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(false)}
                className="size-8 shrink-0 rounded-full"
              >
                <X className="size-4" />
              </Button>
            </header>
            <div className="overflow-y-auto" style={{ minHeight: 0 }}>
              {settingsBody}
            </div>
          </aside>

          {isMobile && (
            <div className="md:hidden">
              <Drawer
                open={settingsOpen}
                onOpenChange={(open) => {
                  if (!open) setSettingsOpen(false);
                }}
              >
                <DrawerPortal>
                  <DrawerOverlay className="md:hidden" />
                  <DrawerContent className="flex max-h-[85dvh] flex-col md:hidden">
                    <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
                      <div>
                        <h2 className="font-heading text-sm font-semibold">
                          ম্যাপ ও সেটিংস
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                          Point pair → Align → KMZ
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsOpen(false)}
                        className="size-8 shrink-0 rounded-full"
                      >
                        <X className="size-4" />
                      </Button>
                    </header>
                    <div
                      className="flex-1 overflow-y-auto"
                      style={{ minHeight: 0 }}
                    >
                      {settingsBody}
                    </div>
                  </DrawerContent>
                </DrawerPortal>
              </Drawer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

