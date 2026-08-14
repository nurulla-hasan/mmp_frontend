import { Globe2, ImageIcon, MapPinned } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToolTopNav } from '@/components/tools/tool-workspace-ui';
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
    <ToolTopNav title="মৌজা জিও স্টুডিও" icon={MapPinned}>
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
        বিশ্ব মানচিত্র
      </Button>

      {transform && (
        <Badge
          variant="default"
          className="ml-1 hidden bg-primary/10 px-2 py-0.5 text-[10px] text-primary md:block"
        >
          {alignmentMode === 'affine' ? 'আফাইন' : 'অ্যালাইন্ড'}
        </Badge>
      )}
    </ToolTopNav>
  );
}
