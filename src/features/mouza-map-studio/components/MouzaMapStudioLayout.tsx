'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Layers3, Loader2, Lock, Map, PenLine, Ruler, Sheet } from 'lucide-react';

import PantagraphLayout from '@/features/pantagraph/components/PantagraphLayout';
import TracerLayout from '@/features/tracer/components/TracerLayout';
import { usePantagraphStore } from '@/features/pantagraph/store/usePantagraphStore';
import { useTracerStore } from '@/features/tracer/store/useTracerStore';
import { cn, ErrorToast, SuccessToast } from '@/lib/utils';
import { useMouzaMapStudioStore, type StudioStep } from '../store/useMouzaMapStudioStore';
import { createStudioComposite } from '../utils/createStudioComposite';
import StudioMeasurementLayout from './StudioMeasurementLayout';
import StudioSheetLayout from './StudioSheetLayout';

const steps: Array<{
  id: StudioStep;
  label: string;
  icon: typeof Map;
  available: boolean;
}> = [
  { id: 'align', label: 'ম্যাপ মিলান', icon: Map, available: true },
  { id: 'trace', label: 'ট্রেস করুন', icon: PenLine, available: true },
  { id: 'measure', label: 'পরিমাপ', icon: Ruler, available: true },
  { id: 'layout', label: 'শিট তৈরি', icon: Sheet, available: true },
];

export default function MouzaMapStudioLayout() {
  const [isPreparing, setIsPreparing] = useState(false);
  const {
    step,
    compositeMeta,
    setStep,
    setCompositeMeta,
    setCalibration,
    clearDimensions,
  } = useMouzaMapStudioStore();
  const formerMap = usePantagraphStore((state) => state.formerMap);
  const currentMap = usePantagraphStore((state) => state.currentMap);
  const isLocked = usePantagraphStore((state) => state.isLocked);
  const polygonCount = useTracerStore((state) =>
    state.layers.reduce((total, layer) => total + layer.polygons.length, 0),
  );
  const tracerBackground = useTracerStore((state) => state.backgroundImage);

  const mapsReady = Boolean(formerMap && currentMap);

  const prepareTracing = async (targetStep: StudioStep = 'trace') => {
    if (!mapsReady) {
      ErrorToast('C.S এবং B.S—দুটি map-ই আগে upload করুন');
      return;
    }
    if (!isLocked) {
      ErrorToast('Alignment ঠিক করে map দুটিকে আগে lock করুন');
      return;
    }
    if (polygonCount > 0) {
      const shouldReplace = window.confirm(
        'Alignment আবার তৈরি করলে বর্তমান tracing মুছে যাবে। চালিয়ে যাবেন?',
      );
      if (!shouldReplace) return;
    }

    setIsPreparing(true);
    try {
      const composite = await createStudioComposite(usePantagraphStore.getState());
      if (polygonCount > 0) useTracerStore.getState().reset();
      useTracerStore.getState().setBackground(composite.image);
      setCalibration(null);
      clearDimensions();
      setCompositeMeta(composite.meta);
      setStep(targetStep);
      SuccessToast('Aligned map tracing-এর জন্য প্রস্তুত');
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : 'Tracing map তৈরি করা যায়নি');
    } finally {
      setIsPreparing(false);
    }
  };

  const openStep = (nextStep: StudioStep) => {
    if (nextStep === 'layout' && polygonCount === 0) {
      ErrorToast('শিট তৈরি করার আগে অন্তত একটি plot trace করুন');
      return;
    }
    if (nextStep !== 'align' && (!compositeMeta || !tracerBackground)) {
      void prepareTracing(nextStep);
      return;
    }
    setStep(nextStep);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {step === 'align' && <PantagraphLayout />}
      {step === 'trace' && <TracerLayout />}
      {step === 'measure' && <StudioMeasurementLayout />}
      {step === 'layout' && <StudioSheetLayout />}

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-3">
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
            <span className="whitespace-nowrap text-sm font-semibold">মৌজা ম্যাপ স্টুডিও</span>
          </div>

          {steps.map(({ id, label, icon: Icon, available }) => {
            const active = step === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!available || isPreparing}
                title={available ? label : `${label} — পরবর্তী ধাপ`}
                onClick={() => openStep(id)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium transition sm:px-3',
                  active && 'bg-primary text-primary-foreground shadow-sm',
                  !active && available && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  !available && 'cursor-not-allowed text-muted-foreground/45',
                )}
              >
                <Icon className="size-3.5" />
                <span className="whitespace-nowrap">{label}</span>
                {!available && <Lock className="size-3" />}
              </button>
            );
          })}

          {step === 'align' && (
            <button
              type="button"
              disabled={isPreparing}
              onClick={() => void prepareTracing()}
              className="ml-1 flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
            >
              {isPreparing ? <Loader2 className="size-3.5 animate-spin" /> : <PenLine className="size-3.5" />}
              <span className="whitespace-nowrap">ট্রেসিং শুরু করুন</span>
            </button>
          )}

          {step === 'trace' && compositeMeta && (
            <div className="ml-1 hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 text-xs font-medium text-emerald-600 lg:flex dark:text-emerald-400">
              <Check className="size-3.5" />
              Aligned map ready
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
