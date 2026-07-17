'use client';

import { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

import nextDynamic from 'next/dynamic';
import { DistanceModal } from '@/features/land-measurement/components/DistanceModal';
import { ResultsDisplay } from '@/features/land-measurement/components/ResultsDisplay';
import { SidebarControls } from '@/features/land-measurement/components/sidebar/SidebarControls';
import { FloatingToolbar } from '@/features/land-measurement/components/toolbar/FloatingToolbar';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';
import { useShallow } from 'zustand/shallow';
import { TutorialGuide } from '@/features/land-measurement/components/tutorial-guide';
import { Upload, HardDrive } from 'lucide-react';
import { CONTAINER_MAX_WIDTH } from '@/components/ui/custom/page-wrapper';

const KonvaStage = nextDynamic(
  () => import('@/features/land-measurement/components/stage/KonvaStage').then((m) => ({ default: m.KonvaStage })),
  { ssr: false }
);

const PrintLayout = nextDynamic(
  () => import('@/features/land-measurement/components/PrintLayout').then((m) => ({ default: m.PrintLayout })),
  { ssr: false }
);

export default function MapCalculator() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const previousModeRef = useRef<string | null>(null);

  const {
    savedPlots,
    deleteSavedPlot,
    setStageSize,
    setReportImage,
    mode,
    plotPoints,
    image,
    isProcessingFile,
  } = useMapStore(useShallow((s) => ({
    savedPlots: s.savedPlots,
    deleteSavedPlot: s.deleteSavedPlot,
    setStageSize: s.setStageSize,
    setReportImage: s.setReportImage,
    mode: s.mode,
    plotPoints: s.plotPoints,
    image: s.image,
    isProcessingFile: s.isProcessingFile,
  })));

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // Full viewport height minus the top nav (~56px)
        const finalHeight = Math.max(400, window.innerHeight - 64);
        setStageSize({ width: containerRef.current.offsetWidth, height: finalHeight });
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
      if (isMobile && currentWidth === lastWidth && Math.abs(currentHeight - lastHeight) < 150) return;
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

  const handlePrint = () => {
    if (stageRef.current) {
      setReportImage(stageRef.current.toDataURL({ pixelRatio: 2 }));
    }
    setTimeout(() => window.print(), 100);
  };



  useEffect(() => {
    const previousMode = previousModeRef.current;
    previousModeRef.current = mode;

    const wasEditingMap =
      previousMode === 'drawing_plot' ||
      previousMode === 'measuring' ||
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
      <div className="print:hidden">
        {/* ── Canvas + Floating toolbar ── */}
        <div
          className="relative w-full rounded-lg overflow-hidden border border-border"
          ref={containerRef}
          style={{
            backgroundColor: isDark ? '#121212' : '#ffffff',
            backgroundImage: isDark
              ? `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
              : `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            height: 'calc(100vh - 64px)',
            minHeight: '400px'
          }}
        >
          <KonvaStage
            containerRef={containerRef}
            stageRef={stageRef}
          />

          {!image && !isProcessingFile && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center p-6 text-center bg-background/80 backdrop-blur-sm rounded-2xl border shadow-xl max-w-sm pointer-events-auto">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-primary opacity-80" />
                </div>
                <h2 className="text-xl font-bold mb-1">কোনো ম্যাপ আপলোড করা নেই</h2>
                <p className="text-muted-foreground mb-6 max-w-70 text-sm">
                  কাজ শুরু করতে আপনার জমির নকশা বা ম্যাপ (JPG, PNG, PDF) আপলোড করুন.
                </p>
                <div className="flex flex-col gap-3 w-full mt-1">
                  <Button
                    onClick={() => document.getElementById('step-image-upload')?.click()}
                    className="gap-2 shadow-sm w-full"
                  >
                    <Upload className="h-4 w-4" />
                    ডিভাইস থেকে আপলোড করুন
                  </Button>
                  <Button
                    nativeButton={false}
                    render={<a href="https://drive.google.com/drive/folders/1r0ryb1SyCeYV-41CM1WweokGDKT5t9RB" target="_blank" rel="noopener noreferrer" />}
                    variant="outline"
                    className="gap-2 shadow-sm w-full bg-background/50 backdrop-blur-sm"
                  >
                    <HardDrive className="h-4 w-4 text-primary" />
                    ড্রাইভ থেকে ডাউনলোড করুন
                  </Button>
                </div>
              </div>
            </div>
          )}

          <FloatingToolbar />
          {/* ── Mode-aware floating bottom bars (undo/redo/cancel) ── */}
          <SidebarControls />
        </div>

        {/* ── Results below the canvas ── */}
        <div className={cn(`${CONTAINER_MAX_WIDTH} mx-auto px-4 xl:px-0`)}>
          {(mode === 'none' || (mode === 'drawing_plot' && plotPoints.length === 0)) && (
            <ResultsDisplay onPrint={handlePrint} />
          )}
        </div>



        {savedPlots.length > 0 && (
          <div className="border-t py-2 print:hidden bg-gray-50">
            <div className={cn(`${CONTAINER_MAX_WIDTH} mx-auto px-4 xl:px-0`)}>
              <h3 className="text-sm font-medium text-gray-700 mb-2">সংরক্ষিত প্লট</h3>
              <div className="flex flex-wrap gap-3">
                {savedPlots.map((plot, index) => (
                  <div key={plot.id} className="flex items-center gap-2 bg-white border rounded px-3 py-1.5 shadow-sm text-sm">
                    <span className="font-medium text-gray-800">{plot.name || `প্লট ${index + 1}`}</span>
                    <span className="text-gray-500">
                      {plot.results.shotok.toFixed(4)} শতক
                    </span>
                    <button
                      onClick={() => deleteSavedPlot(plot.id)}
                      className="text-red-500 hover:text-red-700 ml-1"
                      aria-label={`মুছুন ${plot.name || `প্লট ${index + 1}`}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <PrintLayout ref={printRef} />
      <DistanceModal />
      <TutorialGuide />
    </>
  );
}
