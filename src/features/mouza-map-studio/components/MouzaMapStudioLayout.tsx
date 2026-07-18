'use client';

import { useState } from 'react';
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

import PantagraphLayout from '@/features/pantagraph/components/PantagraphLayout';
import {
  PantagraphCropDialog,
  type PantagraphCropResult,
} from '@/features/pantagraph/components/PantagraphCropDialog';
import { usePantagraphStore } from '@/features/pantagraph/store/usePantagraphStore';
import { cn, ErrorToast, SuccessToast } from '@/lib/utils';
import {
  useMouzaMapStudioStore,
  type StudioCompositeCrop,
  type StudioCompositeMeta,
  type StudioStep,
} from '../store/useMouzaMapStudioStore';
import {
  createStudioComposite,
  cropStudioComposite,
} from '../utils/createStudioComposite';
import StudioEditorLayout from './StudioEditorLayout';
import StudioSheetLayout from './StudioSheetLayout';

const steps: Array<{
  id: StudioStep;
  label: string;
  icon: typeof Map;
}> = [
  { id: 'align', label: 'ম্যাপ মিলান', icon: Map },
  { id: 'edit', label: 'ফাইনাল এডিট', icon: Paintbrush },
  { id: 'layout', label: 'শিট তৈরি', icon: Sheet },
];

const imageToCropObjectUrl = (image: HTMLImageElement) =>
  new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Crop preview তৈরি করা যায়নি'));
      return;
    }

    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      canvas.width = 1;
      canvas.height = 1;
      if (blob) resolve(URL.createObjectURL(blob));
      else reject(new Error('Crop preview তৈরি করা যায়নি'));
    }, 'image/png');
  });

const hasSameCompositeGeometry = (
  previous: StudioCompositeMeta | null,
  next: StudioCompositeMeta,
) =>
  Boolean(
    previous &&
      previous.width === next.width &&
      previous.height === next.height &&
      previous.outputScale === next.outputScale &&
      previous.bounds.minX === next.bounds.minX &&
      previous.bounds.minY === next.bounds.minY &&
      previous.bounds.maxX === next.bounds.maxX &&
      previous.bounds.maxY === next.bounds.maxY,
  );

export default function MouzaMapStudioLayout() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [cropSource, setCropSource] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);

  const {
    step,
    compositeMeta,
    compositeCrop,
    editorImage,
    editorStrokes,
    editorTexts,
    setStep,
    setCompositeMeta,
    setCompositeCrop,
    setEditorImage,
    resetEditorContent,
  } = useMouzaMapStudioStore();

  const formerMap = usePantagraphStore((state) => state.formerMap);
  const currentMap = usePantagraphStore((state) => state.currentMap);
  const isLocked = usePantagraphStore((state) => state.isLocked);

  const mapsReady = Boolean(formerMap && currentMap);
  const hasEditorContent =
    editorStrokes.length > 0 || editorTexts.length > 0;

  const prepareEditor = async (
    targetStep: StudioStep = 'edit',
    cropOverride: StudioCompositeCrop | null = compositeCrop,
    contentAlreadyReset = false,
  ) => {
    if (!mapsReady) {
      ErrorToast('C.S এবং B.S—দুটি map-ই আগে upload করুন');
      return;
    }

    if (!isLocked) {
      ErrorToast('Alignment ঠিক করে map দুটিকে আগে lock করুন');
      return;
    }

    setIsPreparing(true);
    try {
      const baseComposite = await createStudioComposite(
        usePantagraphStore.getState(),
      );
      const composite = cropOverride
        ? await cropStudioComposite(baseComposite, cropOverride)
        : baseComposite;
      const geometryChanged = !hasSameCompositeGeometry(
        compositeMeta,
        composite.meta,
      );

      if (hasEditorContent && geometryChanged && !contentAlreadyReset) {
        const shouldReplace = window.confirm(
          'Crop বা alignment-এর আকার বদলেছে। নতুন map বসালে বর্তমান cleanup, text ও mark মুছে যাবে। চালিয়ে যাবেন?',
        );
        if (!shouldReplace) return;
        resetEditorContent();
      }

      setEditorImage(composite.image);
      setCompositeMeta(composite.meta);
      setStep(targetStep);
      SuccessToast('Aligned real map ফাইনাল এডিটের জন্য প্রস্তুত');
    } catch (error) {
      ErrorToast(
        error instanceof Error
          ? error.message
          : 'Final edit map তৈরি করা যায়নি',
      );
    } finally {
      setIsPreparing(false);
    }
  };

  const openCombinedCrop = async () => {
    if (!mapsReady) {
      ErrorToast('C.S এবং B.S—দুটি map-ই আগে upload করুন');
      return;
    }

    if (!isLocked) {
      ErrorToast('Crop করার আগে map দুটি lock করুন');
      return;
    }

    setIsPreparing(true);
    try {
      const composite = await createStudioComposite(
        usePantagraphStore.getState(),
      );
      const src = await imageToCropObjectUrl(composite.image);
      setCropSource({
        src,
        width: composite.meta.width,
        height: composite.meta.height,
      });
    } catch (error) {
      ErrorToast(
        error instanceof Error ? error.message : 'Aligned map crop করা যায়নি',
      );
    } finally {
      setIsPreparing(false);
    }
  };

  const closeCombinedCrop = () => {
    if (cropSource) URL.revokeObjectURL(cropSource.src);
    setCropSource(null);
  };

  const saveCombinedCrop = (
    _image: HTMLImageElement,
    crop?: PantagraphCropResult,
  ) => {
    if (!cropSource || !crop) return;

    if (
      hasEditorContent &&
      !window.confirm(
        'Crop বদলালে বর্তমান cleanup, text ও mark মুছে যাবে। চালিয়ে যাবেন?',
      )
    ) {
      return;
    }

    const normalizedCrop: StudioCompositeCrop = {
      x: crop.x / cropSource.width,
      y: crop.y / cropSource.height,
      width: crop.width / cropSource.width,
      height: crop.height / cropSource.height,
    };

    setCompositeCrop(normalizedCrop);
    setCompositeMeta(null);
    resetEditorContent();
    closeCombinedCrop();

    if (step === 'edit' || step === 'layout') {
      void prepareEditor('edit', normalizedCrop, true);
    } else {
      SuccessToast('দুই ম্যাপের একসাথে crop সংরক্ষণ হয়েছে');
    }
  };

  const clearCombinedCrop = () => {
    if (
      hasEditorContent &&
      !window.confirm(
        'Crop সরালে বর্তমান cleanup, text ও mark মুছে যাবে। চালিয়ে যাবেন?',
      )
    ) {
      return;
    }

    setCompositeCrop(null);
    setCompositeMeta(null);
    resetEditorContent();

    if (step === 'edit' || step === 'layout') {
      void prepareEditor('edit', null, true);
    } else {
      SuccessToast('Aligned map crop সরানো হয়েছে');
    }
  };

  const openStep = (nextStep: StudioStep) => {
    if (nextStep === 'align') {
      setStep('align');
      return;
    }

    if (!editorImage || !compositeMeta || step === 'align') {
      void prepareEditor(nextStep);
      return;
    }

    setStep(nextStep);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {step === 'align' && <PantagraphLayout />}
      {step === 'edit' && (
        <StudioEditorLayout onOpenCrop={() => void openCombinedCrop()} />
      )}
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
                onClick={() => openStep(id)}
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
                onClick={() => void openCombinedCrop()}
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
                  onClick={clearCombinedCrop}
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
              onClick={() => void prepareEditor()}
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

      {cropSource && (
        <PantagraphCropDialog
          open
          imageSrc={cropSource.src}
          mapLabel="Aligned C.S + B.S ম্যাপ"
          preserveResolution
          onClose={closeCombinedCrop}
          onDone={saveCombinedCrop}
        />
      )}
    </div>
  );
}
