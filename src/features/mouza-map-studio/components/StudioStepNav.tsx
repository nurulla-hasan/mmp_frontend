'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Crop,
  Layers3,
  Loader2,
  Map,
  Paintbrush,
  Sheet,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { StudioStep } from '../store/useMouzaMapStudioStore';

const steps: Array<{
  id: StudioStep;
  label: string;
  icon: typeof Map;
}> = [
  { id: 'align', label: 'ম্যাপ মিলান', icon: Map },
  { id: 'edit', label: 'ফাইনাল এডিট', icon: Paintbrush },
  { id: 'layout', label: 'শিট তৈরি', icon: Sheet },
];

type StudioStepNavProps = {
  step: StudioStep;
  isPreparing: boolean;
  isLocked: boolean;
  compositeCrop: { x: number; y: number; width: number; height: number } | null;
  compositeMeta: { width: number; height: number } | null;
  onOpenStep: (step: StudioStep) => void;
  onOpenCrop: () => void;
  onClearCrop: () => void;
  onPrepareEditor: () => void;
};

export default function StudioStepNav({
  step,
  isPreparing,
  isLocked,
  compositeCrop,
  compositeMeta,
  onOpenStep,
  onOpenCrop,
  onClearCrop,
  onPrepareEditor,
}: StudioStepNavProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-100 flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-xl backdrop-blur">
        <Link
          href="/tools"
          aria-label="টুলস পেজে ফিরুন"
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <div className="hidden items-center gap-2 border-x border-border px-3 sm:flex">
          <Layers3 className="size-4 text-primary" />
          <span className="whitespace-nowrap text-sm font-semibold">
            মৌজা ম্যাপ স্টুডিও
          </span>
        </div>

        {steps.map(({ id, label, icon: Icon }) => {
          const active = step === id;
          return (
            <button
              key={id}
              type="button"
              disabled={isPreparing}
              onClick={() => onOpenStep(id)}
              className={cn(
                'flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition sm:px-3',
                active && 'bg-primary text-primary-foreground shadow-sm',
                !active &&
                  'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-3.5" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}

        {step === 'align' && isLocked && (
          <>
            <button
              type="button"
              disabled={isPreparing}
              onClick={onOpenCrop}
              className="ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-70"
            >
              {isPreparing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Crop className="size-3.5" />
              )}
              <span className="whitespace-nowrap">
                {compositeCrop ? 'একসাথে crop বদলান' : 'দুই ম্যাপ একসাথে crop'}
              </span>
            </button>

            {compositeCrop && (
              <button
                type="button"
                onClick={onClearCrop}
                title="একসাথে crop সরান"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-destructive"
              >
                <X className="size-3.5" />
              </button>
            )}
          </>
        )}

        {step === 'align' && (
          <button
            type="button"
            disabled={isPreparing}
            onClick={onPrepareEditor}
            className="ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
          >
            {isPreparing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Paintbrush className="size-3.5" />
            )}
            <span className="whitespace-nowrap">ফাইনাল এডিট শুরু করুন</span>
          </button>
        )}

        {step === 'edit' && compositeMeta && (
          <div className="ml-1 hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 text-xs font-medium text-emerald-600 lg:flex dark:text-emerald-400">
            <Check className="size-3.5" />
            Real aligned map ready
          </div>
        )}
      </div>
    </div>
  );
}
