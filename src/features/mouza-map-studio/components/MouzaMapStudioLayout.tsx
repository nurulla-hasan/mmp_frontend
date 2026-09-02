'use client';

import { useCallback, useState } from 'react';

import PantagraphLayout from '@/features/pantagraph/components/PantagraphLayout';
import { ConfirmationModal } from '@/components/common/confirmation-modal';
import {
  PantagraphCropDialog,
  type PantagraphCropResult,
} from '@/features/pantagraph/components/PantagraphCropDialog';
import { usePantagraphStore } from '@/features/pantagraph/store/usePantagraphStore';
import { ErrorToast, SuccessToast } from '@/lib/utils';
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
import StudioStepNav from './StudioStepNav';

const imageToCropObjectUrl = (image: HTMLImageElement) =>
  new Promise<string>((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Could not create crop preview'));
      return;
    }

    context.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      canvas.width = 1;
      canvas.height = 1;
      if (blob) resolve(URL.createObjectURL(blob));
      else reject(new Error('Could not create crop preview'));
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

type PendingConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
};

export default function MouzaMapStudioLayout() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [cropSource, setCropSource] = useState<{
    src: string;
    width: number;
    height: number;
  } | null>(null);
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

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

  const prepareEditor = useCallback(
    async function prepareEditorFn(
      targetStep: StudioStep = 'edit',
      cropOverride: StudioCompositeCrop | null = compositeCrop,
      contentAlreadyReset = false,
    ) {
      if (!mapsReady) {
        ErrorToast('Please upload both C.S and B.S maps first');
        return;
      }

      // if (!isLocked) {
      //   ErrorToast('Please lock both maps after alignment');
      //   return;
      // }

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
          setPendingConfirmation({
            title: 'Replace current map and clear edits?',
            description:
              'Crop or alignment dimensions have changed. Continuing will clear all current cleanup, text, and markings.',
            confirmText: 'Continue',
            onConfirm: () => {
              resetEditorContent();
              void prepareEditorFn(targetStep, cropOverride, true);
            },
          });
          return;
        }

        setEditorImage(composite.image);
        setCompositeMeta(composite.meta);
        setStep(targetStep);
      } catch (error) {
        ErrorToast(
          error instanceof Error
            ? error.message
            : 'Could not create final edit map',
        );
      } finally {
        setIsPreparing(false);
      }
    },
    [mapsReady, compositeCrop, compositeMeta, hasEditorContent, resetEditorContent, setEditorImage, setCompositeMeta, setStep],
  );

  const openCombinedCrop = useCallback(async () => {
    if (!mapsReady) {
      ErrorToast('Please upload both C.S and B.S maps first');
      return;
    }

    if (!isLocked) {
      ErrorToast('Please lock both maps before cropping');
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
        error instanceof Error ? error.message : 'Could not crop aligned map',
      );
    } finally {
      setIsPreparing(false);
    }
  }, [mapsReady, isLocked]);

  const closeCombinedCrop = useCallback(() => {
    if (cropSource) URL.revokeObjectURL(cropSource.src);
    setCropSource(null);
  }, [cropSource]);

  const applyCombinedCrop = useCallback(
    (crop: PantagraphCropResult) => {
      if (!cropSource) return;
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
        SuccessToast('Combined crop saved successfully');
      }
    },
    [cropSource, step, setCompositeCrop, setCompositeMeta, resetEditorContent, closeCombinedCrop, prepareEditor],
  );

  const saveCombinedCrop = useCallback(
    (_image: HTMLImageElement, crop?: PantagraphCropResult) => {
      if (!cropSource || !crop) return;

      if (hasEditorContent) {
        setPendingConfirmation({
          title: 'Change Crop?',
          description:
            'Changing the crop will clear all current cleanup, text, and markings.',
          confirmText: 'Change Crop',
          onConfirm: () => applyCombinedCrop(crop),
        });
        return;
      }

      applyCombinedCrop(crop);
    },
    [cropSource, hasEditorContent, applyCombinedCrop],
  );

  const applyClearCombinedCrop = useCallback(() => {
    setCompositeCrop(null);
    setCompositeMeta(null);
    resetEditorContent();

    if (step === 'edit' || step === 'layout') {
      void prepareEditor('edit', null, true);
    } else {
      SuccessToast('Aligned map crop removed');
    }
  }, [step, setCompositeCrop, setCompositeMeta, resetEditorContent, prepareEditor]);

  const clearCombinedCrop = useCallback(() => {
    if (hasEditorContent) {
      setPendingConfirmation({
        title: 'Remove Crop?',
        description:
          'Removing the crop will clear all current cleanup, text, and markings.',
        confirmText: 'Remove Crop',
        onConfirm: applyClearCombinedCrop,
      });
      return;
    }

    applyClearCombinedCrop();
  }, [hasEditorContent, applyClearCombinedCrop]);

  const openStep = useCallback(
    (nextStep: StudioStep) => {
      if (nextStep === 'align') {
        setStep('align');
        return;
      }

      if (!editorImage || !compositeMeta || step === 'align') {
        void prepareEditor(nextStep);
        return;
      }

      setStep(nextStep);
    },
    [editorImage, compositeMeta, step, setStep, prepareEditor],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      {step === 'align' && <PantagraphLayout />}
      {step === 'edit' && (
        <StudioEditorLayout onOpenCrop={() => void openCombinedCrop()} />
      )}
      {step === 'layout' && <StudioSheetLayout />}

      <StudioStepNav
        step={step}
        isPreparing={isPreparing}
        isLocked={isLocked}
        compositeCrop={compositeCrop}
        compositeMeta={compositeMeta}
        onOpenStep={openStep}
        onOpenCrop={() => void openCombinedCrop()}
        onClearCrop={clearCombinedCrop}
        onPrepareEditor={() => void prepareEditor()}
      />

      {cropSource && (
        <PantagraphCropDialog
          open
          imageSrc={cropSource.src}
          mapLabel="Aligned C.S + B.S Map"
          preserveResolution
          onClose={closeCombinedCrop}
          onDone={saveCombinedCrop}
        />
      )}

      <ConfirmationModal
        open={pendingConfirmation !== null}
        onOpenChange={(open) => {
          if (!open) setPendingConfirmation(null);
        }}
        trigger={null}
        title={pendingConfirmation?.title}
        description={pendingConfirmation?.description}
        confirmText={pendingConfirmation?.confirmText}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          const action = pendingConfirmation?.onConfirm;
          setPendingConfirmation(null);
          action?.();
        }}
      />
    </div>
  );
}
