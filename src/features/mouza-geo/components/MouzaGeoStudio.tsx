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
  Trash2,
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
  const [activeView, setActiveView] = useState<ActiveView>('source');
  const [interactionTarget, setInteractionTarget] =
    useState<InteractionTarget>('map');
  const [controlPairs, setControlPairs] = useState<ControlPair[]>([]);
  const [pendingSource, setPendingSource] = useState<Point2D | null>(null);
  const [alignmentMode, setAlignmentMode] =
    useState<AlignmentMode>('similarity');
  const [transform, setTransform] = useState<GeoTransform | null>(null);
  const [opacity, setOpacity] = useState(0.62);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
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
      transform
        ? calculateResidualMeters(transform, controlPairs)
        : null,
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
    <div className="grid h-dvh min-h-0 grid-cols-1 overflow-hidden bg-background lg:grid-cols-[320px_1fr]">
      <aside className="z-30 max-h-[45dvh] overflow-y-auto border-b border-border bg-card p-4 text-card-foreground lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <Link
            href="/tools"
            aria-label="টুলস পেজে ফিরুন"
            className="grid size-9 place-items-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-bold">Mouza Geo Studio</h1>
            <p className="text-xs text-muted-foreground">World align → KMZ export</p>
          </div>
        </div>

        <section className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ১. মৌজা ম্যাপ
            </h2>
            {image && <span className="text-xs text-primary">Ready</span>}
          </div>
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
          <button
            type="button"
            disabled={loadingFile}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <FileUp className="size-4" />
            {loadingFile ? 'Load হচ্ছে…' : image ? 'ম্যাপ পরিবর্তন' : 'PDF / Image আপলোড'}
          </button>
        </section>

        <section className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ২. Control points
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {controlPairs.length} pair
            </span>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            PDF-এ point দিলে Google Map নিজে খুলবে। একই জায়গায় click করুন।
          </p>
          <div className="space-y-2">
            {controlPairs.map((pair, index) => (
              <div
                key={pair.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {pair.world.lat.toFixed(6)}, {pair.world.lng.toFixed(6)}
                </span>
                <button
                  type="button"
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

        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ৩. Alignment
          </h2>
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
              onChange={(event) => setOpacity(Number(event.target.value) / 100)}
              className="w-full accent-primary"
            />
          </label>
          {transform && (
            <div className="grid grid-cols-4 gap-2">
              <button type="button" title="PDF ছোট করুন" onClick={() => handleScale(1 / 1.02)} className="grid h-9 place-items-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"><ZoomOut className="size-4" /></button>
              <button type="button" title="PDF বড় করুন" onClick={() => handleScale(1.02)} className="grid h-9 place-items-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"><ZoomIn className="size-4" /></button>
              <button type="button" title="বামে ঘোরান" onClick={() => handleRotate(-Math.PI / 180)} className="grid h-9 place-items-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"><RotateCcw className="size-4" /></button>
              <button type="button" title="ডানে ঘোরান" onClick={() => handleRotate(Math.PI / 180)} className="grid h-9 place-items-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"><RotateCw className="size-4" /></button>
            </div>
          )}
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            ৪. KMZ Export
          </h2>
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
      </aside>

      <main className="relative min-h-0 min-w-0 overflow-hidden">
        <div className="absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={() => setActiveView('source')}
            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${activeView === 'source' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <ImageIcon className="size-4" /> PDF Map
          </button>
          <button
            type="button"
            onClick={() => setActiveView('world')}
            className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${activeView === 'world' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <Globe2 className="size-4" /> Google Map
          </button>
          {activeView === 'world' && transform && !pendingSource && (
            <div className="ml-1 flex items-center gap-1 border-l border-border pl-2">
              <button
                type="button"
                onClick={() => setInteractionTarget('map')}
                className={`flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold ${interactionTarget === 'map' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <MapPinned className="size-3.5" /> Map
              </button>
              <button
                type="button"
                onClick={() => setInteractionTarget('pdf')}
                className={`flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-semibold ${interactionTarget === 'pdf' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Crosshair className="size-3.5" /> PDF Overlay
              </button>
            </div>
          )}
        </div>

        {!image ? (
          <div className="grid h-full place-items-center p-6">
            <div className="max-w-md text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Globe2 className="size-8" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold">মৌজা ম্যাপ Georeference করুন</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                শুরু করতে sidebar থেকে PDF অথবা image upload করুন।
              </p>
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
                apiKey={apiKey}
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
    </div>
  );
}
