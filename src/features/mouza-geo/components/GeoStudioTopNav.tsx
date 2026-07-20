import { ArrowLeft, Globe2, ImageIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    <nav className="fixed left-1/2 top-0 z-50 mt-2 -translate-x-1/2 w-fit flex items-center rounded-xl border border-border/80 bg-background/80 px-3 py-2 shadow-2xl shadow-black/5 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <Button
        nativeButton={false}
        render={<Link href="/tools" />}
        variant="ghost"
        size="icon-lg"
        title="টুলস পেজে ফিরুন"
        aria-label="টুলস পেজে ফিরুন"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <div className="mx-2 hidden h-6 sm:block">
        <Separator orientation="vertical" />
      </div>
      <p className="hidden px-1 text-xs font-bold text-foreground/80 sm:block">
        Mouza Geo Studio
      </p>
      <div className="mx-2 h-6">
        <Separator orientation="vertical" />
      </div>

      <Button
        variant={activeView === 'source' ? 'default' : 'ghost'}
        size="sm"
        disabled={!image}
        onClick={onSourceClick}
      >
        <ImageIcon className="size-3.5" />
        PDF
      </Button>

      <Button
        variant={activeView === 'world' ? 'default' : 'ghost'}
        size="sm"
        disabled={!image}
        onClick={onWorldClick}
      >
        <Globe2 className="size-3.5" />
        World Map
      </Button>

      {transform && (
        <Badge
          variant="default"
          className="ml-auto hidden bg-primary/10 text-primary md:block text-[10px] px-2 py-0.5"
        >
          {alignmentMode === 'affine' ? 'Affine' : 'Aligned'}
        </Badge>
      )}
    </nav>
  );
}
