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
} from 'lucide-react';
import Link from 'next/link';

import { extractImageFromPDF } from '@/features/land-measurement/utils/pdfHelper';
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
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [mapName, setMapName] = useState('mouza-map');
  const [loadingFile, setLoadingFile] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
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
      setPanelOpen(false);
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
                Floating settings থেকে PDF অথবা image upload করুন।
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
            <div className={activeView === 'source' ? 'h-full' : 'hidden'}>
              <SourceMapCanvas
                image={image}
                controlPairs={controlPairs}
                pendingSource={pendingSource}
                active={activeView === 'source'}
                onPlacePoint={handleSourcePoint}
              />
            </div>

            <div className={activeView === 'world' ? 'h-full' : 'hidden'}>
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

        <div className="hidden min-w-0 px-2 sm:block">
          <p className="truncate text-xs font-bold text-foreground">
            Mouza Geo Studio
          </p>
        </div>

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

      <div className="absolute right-3 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => setPanelOpen((current) => !current)}
          className={`grid size-9 place-items-center rounded-lg transition ${
            panelOpen
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Settings2 className="size-4" />
        </button>

        <div className="mx-auto h-px w-6 bg-border" />

        <button
          type="button"
          title="Map control"
          aria-label="Map control"
          disabled={activeView !== 'world' || !transform || Boolean(pendingSource)}
          onClick={() => setInteractionTarget('map')}
          className={`grid size-9 place-items-center rounded-lg transition disabled:opacity-30 ${
            activeView === 'world' && interactionTarget === 'map'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <MapPinned className="size-4" />
        </button>

        <button
          type="button"
          title="PDF overlay control"
          aria-label="PDF overlay control"
          disabled={activeView !== 'world' || !transform || Boolean(pendingSource)}
          onClick={() => setInteractionTarget('pdf')}
          className={`grid size-9 place-items-center rounded-lg transition disabled:opacity-30 ${
            activeView === 'world' && interactionTarget === 'pdf'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Crosshair className="size-4" />
        </button>

        <div className="mx-auto h-px w-6 bg-border" />

        <button
          type="button"
          title="PDF ছোট করুন"
          aria-label="PDF ছোট করুন"
          disabled={!transform}
          onClick={() => handleScale(1 / 1.02)}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <ZoomOut className="size-4" />
        </button>

        <button
          type="button"
          title="PDF বড় করুন"
          aria-label="PDF বড় করুন"
          disabled={!transform}
          onClick={() => handleScale(1.02)}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <ZoomIn className="size-4" />
        </button>

        <button
          type="button"
          title="PDF বামে ঘোরান"
          aria-label="PDF বামে ঘোরান"
          disabled={!transform}
          onClick={() => handleRotate(-Math.PI / 180)}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <RotateCcw className="size-4" />
        </button>

        <button
          type="button"
          title="PDF ডানে ঘোরান"
          aria-label="PDF ডানে ঘোরান"
          disabled={!transform}
          onClick={() => handleRotate(Math.PI / 180)}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <RotateCw className="size-4" />
        </button>

        <div className="mx-auto h-px w-6 bg-border" />

        <button
          type="button"
          title="KMZ Export"
          aria-label="KMZ Export"
          disabled={!transform || !imageDataUrl}
          onClick={handleExport}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Download className="size-4" />
        </button>
      </div>

      {panelOpen && (
        <aside className="absolute inset-x-3 bottom-3 z-50 max-h-[70dvh] overflow-y-auto rounded-2xl border border-border bg-card/97 text-card-foreground shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-auto sm:left-4 sm:top-4 sm:max-h-[calc(100dvh-2rem)] sm:w-80">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
            <div>
              <h2 className="font-heading text-sm font-bold">Geo Settings</h2>
              <p className="text-[11px] text-muted-foreground">
                Point pair → Align → KMZ
              </p>
            </div>
            <button
              type="button"
              title="Settings বন্ধ করুন"
              aria-label="Settings বন্ধ করুন"
              onClick={() => setPanelOpen(false)}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </header>

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
        </aside>
      )}
    </div>
  );
}

