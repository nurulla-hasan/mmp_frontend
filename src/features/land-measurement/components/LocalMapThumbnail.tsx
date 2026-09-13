'use client';

import { useEffect, useState } from 'react';
import { FileImage } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getLocalCalculationThumbnail } from '@/features/land-measurement/utils/localMapStorage';

type LocalMapThumbnailProps = {
  calculationId: string;
  alt?: string;
  className?: string;
};

export function LocalMapThumbnail({
  calculationId,
  alt = 'Saved mouza map thumbnail',
  className,
}: LocalMapThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void getLocalCalculationThumbnail(calculationId)
      .then((blob) => {
        if (!active || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [calculationId]);

  return (
    <div
      className={cn(
        'relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/50 text-muted-foreground',
        className,
      )}
    >
      {src ? (
        // The thumbnail is a browser-local Blob URL, so Next/Image optimization does not apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className='absolute inset-0 size-full object-contain'
          onError={() => setSrc(null)}
        />
      ) : (
        <FileImage className='size-5 opacity-70' aria-hidden='true' />
      )}
    </div>
  );
}
