'use client';

import Link from 'next/link';
import { ArrowLeft, Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ToolTopNavProps = {
  title: string;
  icon?: LucideIcon;
  children?: ReactNode;
  backHref?: string;
  backLabel?: string;
  backButtonId?: string;
  className?: string;
};

export function ToolTopNav({
  title,
  icon: Icon,
  children,
  backHref = '/tools',
  backLabel = 'টুলস পেজে ফিরুন',
  backButtonId,
  className,
}: ToolTopNavProps) {
  return (
    <nav
      className={cn(
        'fixed left-1/2 top-0 z-50 mt-2 flex w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 items-center gap-1 rounded-xl border border-border/80 bg-background/85 p-1.5 shadow-xl shadow-black/5 backdrop-blur-xl supports-backdrop-filter:bg-background/70',
        className,
      )}
    >
      <Button
        id={backButtonId}
        nativeButton={false}
        render={<Link href={backHref} />}
        variant="ghost"
        size="icon"
        title={backLabel}
        aria-label={backLabel}
      >
        <ArrowLeft className="size-4" />
      </Button>

      <div className="mx-1 h-6 w-px shrink-0 bg-border/70" />

      <div
        className={cn(
          'shrink-0 items-center gap-2 px-1',
          children ? 'hidden sm:flex' : 'flex',
        )}
      >
        {Icon && <Icon className="size-4 text-primary" />}
        <span className="max-w-40 truncate whitespace-nowrap text-xs font-semibold text-foreground/85 sm:max-w-none">
          {title}
        </span>
      </div>

      {children && (
        <>
          <div className="mx-1 hidden h-6 w-px shrink-0 bg-border/70 sm:block" />
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {children}
          </div>
        </>
      )}
    </nav>
  );
}

type ToolEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function ToolEmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: ToolEmptyStateProps) {
  return (
    <div className={cn('grid h-full place-items-center p-6', className)}>
      <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-background/85 p-6 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-8" />
        </div>
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </div>
        {actions && <div className="mt-5 flex flex-col gap-2">{actions}</div>}
      </div>
    </div>
  );
}

type ToolLoadingOverlayProps = {
  title?: string;
  description?: string;
};

export function ToolLoadingOverlay({
  title = 'ম্যাপ লোড হচ্ছে',
  description = 'একটু সময় লাগতে পারে',
}: ToolLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-background/75 p-6">
      <div className="flex min-w-60 flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-center shadow-xl">
        <Loader2 className="size-8 animate-spin text-primary" />
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ToolToolbarDivider({
  orientation = 'vertical',
}: {
  orientation?: 'vertical' | 'horizontal';
}) {
  return orientation === 'vertical' ? (
    <div className="mx-0.5 h-6 w-px shrink-0 bg-border/60" />
  ) : (
    <div className="my-0.5 h-px w-6 shrink-0 bg-border/60" />
  );
}
