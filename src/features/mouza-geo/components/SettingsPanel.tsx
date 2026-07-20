import { Download, FileUp, Loader2, Trash2 } from 'lucide-react';

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
  backgroundRemoved: boolean;
  processingBackground: boolean;
  backgroundSensitivity: number;
  lineColor: string;
  residual: number | null;
  mapName: string;
  imageDataUrl: string | null;
  onUploadClick: () => void;
  onRemovePair: (id: string) => void;
  onSimilarityClick: () => void;
  onAffineClick: () => void;
  onBackgroundRemovedChange: (value: boolean) => void;
  onBackgroundSensitivityChange: (value: number) => void;
  onLineColorChange: (value: string) => void;
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
  backgroundRemoved,
  processingBackground,
  backgroundSensitivity,
  lineColor,
  residual,
  mapName,
  imageDataUrl,
  onUploadClick,
  onRemovePair,
  onSimilarityClick,
  onAffineClick,
  onBackgroundRemovedChange,
  onBackgroundSensitivityChange,
  onLineColorChange,
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

        <div className="space-y-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              PDF background সরান
              {processingBackground && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={backgroundRemoved}
              aria-label="PDF background সরান"
              onClick={() => onBackgroundRemovedChange(!backgroundRemoved)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                backgroundRemoved ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 rounded-full bg-background shadow-sm transition-transform ${
                  backgroundRemoved ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {backgroundRemoved && (
            <div className="space-y-3">
              <label className="block text-xs text-muted-foreground">
                <span className="mb-1 flex justify-between">
                  <span>লাইন ধরার মাত্রা</span>
                  <span className="font-mono">{backgroundSensitivity}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={backgroundSensitivity}
                  onChange={(event) =>
                    onBackgroundSensitivityChange(Number(event.target.value))
                  }
                  className="w-full accent-primary"
                />
              </label>

              <div className="space-y-2">
                <span className="block text-xs text-muted-foreground">
                  লাইনের রং
                </span>
                <div className="flex gap-2">
                  {[
                    { value: '#000000', label: 'কালো' },
                    { value: '#DC2626', label: 'লাল' },
                    { value: '#16A34A', label: 'সবুজ' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      title={option.label}
                      aria-label={`${option.label} লাইন`}
                      aria-pressed={lineColor === option.value}
                      onClick={() => onLineColorChange(option.value)}
                      className={`size-8 rounded-full border-2 transition ${
                        lineColor === option.value
                          ? 'scale-110 border-primary ring-2 ring-primary/25'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: option.value }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[10px] leading-4 text-muted-foreground">
                কমালে শুধু গাঢ় কালো, বাড়ালে ফিকে ও পুরোনো line-ও থাকবে।
              </p>
            </div>
          )}
        </div>
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
          disabled={!transform || !imageDataUrl || processingBackground}
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
