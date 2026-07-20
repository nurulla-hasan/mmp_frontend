import { Download, FileUp, Trash2 } from 'lucide-react';

import type {
  AlignmentMode,
  ControlPair,
  GeoTransform,
} from '../types';

type SettingsPanelProps = {
  image: HTMLImageElement | null;
  loadingFile: boolean;
  controlPairs: ControlPair[];
  alignmentMode: AlignmentMode;
  transform: GeoTransform | null;
  opacity: number;
  residual: number | null;
  mapName: string;
  imageDataUrl: string | null;
  onUploadClick: () => void;
  onRemovePair: (id: string) => void;
  onSimilarityClick: () => void;
  onAffineClick: () => void;
  onOpacityChange: (value: number) => void;
  onMapNameChange: (name: string) => void;
  onExport: () => void;
  onResetAlignment: () => void;
};

export default function SettingsPanel({
  image,
  loadingFile,
  controlPairs,
  alignmentMode,
  transform,
  opacity,
  residual,
  mapName,
  imageDataUrl,
  onUploadClick,
  onRemovePair,
  onSimilarityClick,
  onAffineClick,
  onOpacityChange,
  onMapNameChange,
  onExport,
  onResetAlignment,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Map upload */}
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
          onClick={onUploadClick}
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

      {/* Control points */}
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
                onClick={() => onRemovePair(pair.id)}
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

      {/* Alignment */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Alignment
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={controlPairs.length < 2}
            onClick={onSimilarityClick}
            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-40"
          >
            Similarity
          </button>
          <button
            type="button"
            disabled={controlPairs.length < 3}
            onClick={onAffineClick}
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
              onOpacityChange(Number(event.target.value) / 100)
            }
            className="w-full accent-primary"
          />
        </label>
      </section>

      {/* KMZ Export */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          KMZ Export
        </h3>
        <label className="block text-xs text-muted-foreground">
          <span className="mb-1 block">ফাইলের নাম</span>
          <input
            value={mapName}
            onChange={(event) => onMapNameChange(event.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          disabled={!transform || !imageDataUrl}
          onClick={onExport}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
        >
          <Download className="size-4" />
          KMZ Export
        </button>
        <button
          type="button"
          onClick={onResetAlignment}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Alignment reset
        </button>
      </section>
    </div>
  );
}
