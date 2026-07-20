import { ArrowLeft, Globe2, ImageIcon } from 'lucide-react';
import Link from 'next/link';

import type { AlignmentMode, GeoTransform } from '../types';

type GeoStudioTopNavProps = {
  image: HTMLImageElement | null;
  activeView: 'source' | 'world';
  alignmentMode: AlignmentMode;
  transform: GeoTransform | null;
  onSourceClick: () => void;
  onWorldClick: () => void;
};

export default function GeoStudioTopNav({
  image,
  activeView,
  alignmentMode,
  transform,
  onSourceClick,
  onWorldClick,
}: GeoStudioTopNavProps) {
  return (
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
        onClick={onSourceClick}
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
        onClick={onWorldClick}
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
  );
}
