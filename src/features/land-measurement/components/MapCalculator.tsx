'use client';

import { useRef, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import nextDynamic from 'next/dynamic';
import { HardDrive, Ruler, Upload } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/ui/button';
import { CONTAINER_MAX_WIDTH } from '@/components/common/page-wrapper';
import { ToolEmptyState, ToolTopNav } from '@/components/tools/tool-workspace-ui';
import { cn } from '@/lib/utils';
import { AutoScaleDialog } from '@/features/land-measurement/components/AutoScaleDialog';
import { DistanceModal } from '@/features/land-measurement/components/DistanceModal';
import { ResultsDisplay } from '@/features/land-measurement/components/ResultsDisplay';
import { SidebarControls } from '@/features/land-measurement/components/sidebar/SidebarControls';
import { FloatingToolbar } from '@/features/land-measurement/components/toolbar/FloatingToolbar';
import { SaveCalculationDialog } from '@/features/land-measurement/components/calculations/save-calculation-dialog';
import { LoadCalculationDialog } from '@/features/land-measurement/components/calculations/load-calculation-dialog';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';

const KonvaStage = nextDynamic(
  () =>
    import('@/features/land-measurement/components/stage/KonvaStage').then((m) => ({
      default: m.KonvaStage,
    })),
  { ssr: false },
);

const PrintLayout = nextDynamic(
  () =>
    import('@/features/land-measurement/components/PrintLayout').then((m) => ({
      default: m.PrintLayout,
    })),
  { ssr: false },
);

export default function MapCalculator() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const previousModeRef = useRef<string | null>(null);

  const searchParams = useSearchParams();
  const calculationId = searchParams.get('calculationId');

  const [isLoadOpen, setIsLoadOpen] = useState(Boolean(calculationId));
  const [initialCalcId, setInitialCalcId] = useState<string | null>(calculationId);
  const [prevCalcId, setPrevCalcId] = useState<string | null>(calculationId);
  const [isSaveOpen, setIsSaveOpen] = useState(false);

  if (calculationId !== prevCalcId) {
    setPrevCalcId(calculationId);
    setInitialCalcId(calculationId);
    if (calculationId) setIsLoadOpen(true);
  }

  const {
    setStageSize,
    mode,
    plotPoints,
    plots,
    image,
    isProcessingFile,
  } = useMapStore(
    useShallow((s) => ({
      setStageSize: s.setStageSize,
      mode: s.mode,
      plotPoints: s.plotPoints,
      plots: s.plots,
      image: s.image,
      isProcessingFile: s.isProcessingFile,
    })),
  );

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const finalHeight = Math.max(400, window.innerHeight - 64);
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: finalHeight,
        });
      }
    };
    updateSize();

    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let rafId = 0;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (
        isMobile &&
        currentWidth === lastWidth &&
        Math.abs(currentHeight - lastHeight) < 150
      ) {
        return;
      }
      lastWidth = currentWidth;
      lastHeight = currentHeight;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateSize);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [setStageSize]);

  // Match the app's unsaved-work guard. Browsers control the final wording.
  useEffect(() => {
    const hasUnsavedWork = plots.length > 0 || plotPoints.length > 0;
    if (!hasUnsavedWork) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [plotPoints.length, plots.length]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const previousMode = previousModeRef.current;
    previousModeRef.current = mode;

    const wasEditingMap =
      previousMode === 'drawing_plot' ||
      previousMode === 'calibrating' ||
      previousMode === 'manual_divide_plot';
    if (!wasEditingMap || mode !== 'none') return;

    window.setTimeout(() => {
      document.getElementById('step-map-stage')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
  }, [mode]);

  return (
    <>
      <DistanceModal />
      <AutoScaleDialog />
      <div className="print:hidden">
        <div
          className="relative w-full overflow-hidden rounded-lg border border-border"
          ref={containerRef}
          style={{
            backgroundColor: isDark ? '#121212' : '#ffffff',
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
              : 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            height: 'calc(100vh - 64px)',
            minHeight: '400px',
          }}
        >
          <ToolTopNav title="Land Measurement" icon={Ruler} backButtonId="step-home" />

          <KonvaStage containerRef={containerRef} stageRef={stageRef} />

          {!image && !isProcessingFile && (
            <div className="absolute inset-0 z-10">
              <ToolEmptyState
                icon={Upload}
                title="Start Land Measurement"
                description="Upload a mouza map, set the scale, draw plots, and calculate land area accurately. You can also divide plots as needed."
                actions={
                  <>
                    <Button
                      onClick={() => document.getElementById('step-image-upload')?.click()}
                      className="w-full gap-2 shadow-sm"
                    >
                      <Upload className="size-4" />
                      Upload from Device
                    </Button>
                    <Button
                      nativeButton={false}
                      render={
                        <a
                          href="https://drive.google.com/drive/folders/1r0ryb1SyCeYV-41CM1WweokGDKT5t9RB"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      variant="outline"
                      className="w-full gap-2 bg-background/50 shadow-sm backdrop-blur-sm"
                    >
                      <HardDrive className="size-4 text-primary" />
                      Download from Drive
                    </Button>
                  </>
                }
              />
            </div>
          )}

          <FloatingToolbar
            onOpenLoad={() => {
              setInitialCalcId(null);
              setIsLoadOpen(true);
            }}
            onOpenSave={() => setIsSaveOpen(true)}
          />
          <SidebarControls />
        </div>

        <div className={cn(`${CONTAINER_MAX_WIDTH} mx-auto px-4 xl:px-0`)}>
          {(mode === 'none' || (mode === 'drawing_plot' && plotPoints.length === 0)) && (
            <ResultsDisplay onPrint={handlePrint} />
          )}
        </div>
      </div>

      <SaveCalculationDialog open={isSaveOpen} onOpenChange={setIsSaveOpen} />
      <LoadCalculationDialog
        open={isLoadOpen}
        onOpenChange={setIsLoadOpen}
        initialCalculationId={initialCalcId}
      />

      <PrintLayout ref={printRef} />
    </>
  );
}
