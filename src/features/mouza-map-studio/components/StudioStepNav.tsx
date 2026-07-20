'use client';

import Link from 'next/link';
import { ArrowLeft, Crop, Map, Paintbrush, Sheet, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
//   compositeMeta,
  onOpenStep,
  onOpenCrop,
  onClearCrop,
//   onPrepareEditor,
}: StudioStepNavProps) {
  return (
    <nav className="fixed left-1/2 top-0 z-50 mt-2 -translate-x-1/2 w-fit flex items-center gap-1 rounded-xl border border-border/80 bg-background/80 px-3 py-2 shadow-2xl shadow-black/5 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          render={<Link href="/tools" />}
          aria-label="টুলস পেজে ফিরুন"
        >
          <ArrowLeft className="size-4" />
        </Button>

        {steps.map(({ id, label, icon: Icon }) => {
          const active = step === id;
          return (
            <Button
              key={id}
              variant={active ? 'default' : 'ghost'}
              size="default"
              disabled={isPreparing}
              onClick={() => onOpenStep(id)}
            >
              <Icon className="size-3.5" />
              <span className="whitespace-nowrap">{label}</span>
            </Button>
          );
        })}

        {step === 'align' && isLocked && (
          <>
            <Button
              variant="outline"
              size="default"
              loading={isPreparing}
              loadingText={compositeCrop ? 'একসাথে crop বদলান' : 'দুই ম্যাপ একসাথে crop'}
              onClick={onOpenCrop}
            >
              <Crop className="size-3.5" />
              <span className="whitespace-nowrap">
                {compositeCrop ? 'একসাথে crop বদলান' : 'দুই ম্যাপ একসাথে crop'}
              </span>
            </Button>

            {compositeCrop && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClearCrop}
                title="একসাথে crop সরান"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </>
        )}

        {/* {step === 'edit' && compositeMeta && (
          <div className="ml-1 hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 text-xs font-medium text-emerald-600 lg:flex dark:text-emerald-400">
            <Check className="size-3.5" />
            Real aligned map ready
          </div>
        )} */}
    </nav>
  );
}
