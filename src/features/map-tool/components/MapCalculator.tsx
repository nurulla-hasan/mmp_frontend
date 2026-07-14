'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

import nextDynamic from 'next/dynamic';
import { DistanceModal } from '@/features/map-tool/components/DistanceModal';
import { ResultsDisplay } from '@/features/map-tool/components/ResultsDisplay';
import { PrintLayout } from '@/features/map-tool/components/PrintLayout';
import { SidebarControls } from '@/features/map-tool/components/sidebar/SidebarControls';
import { FloatingToolbar } from '@/features/map-tool/components/toolbar/FloatingToolbar';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { TutorialGuide } from '@/features/map-tool/components/tutorial-guide';
import { Upload, HardDrive } from 'lucide-react';
import { DriveMapBrowser } from '@/features/map-tool/components/DriveMapBrowser';

const KonvaStage = nextDynamic(
  () => import('@/features/map-tool/components/stage/KonvaStage').then((m) => ({ default: m.KonvaStage })),
  { ssr: false }
);

export default function MapCalculator() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const previousModeRef = useRef<string | null>(null);
  const [isDriveBrowserOpen, setIsDriveBrowserOpen] = useState(false);

  const {
    savedPlots,
    deleteSavedPlot,
    setStageSize,
    setReportImage,
    mode,
    plotPoints,
    image,
  } = useMapStore();

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

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (isMobile && currentWidth === lastWidth && Math.abs(currentHeight - lastHeight) < 150) return;
      lastWidth = currentWidth;
      lastHeight = currentHeight;
      updateSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        <div className="relative w-full" ref={containerRef}>
          <KonvaStage
            containerRef={containerRef}
            stageRef={stageRef}
          />

          {!image && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60">
              <div className="flex flex-col items-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Upload className="h-10 w-10 text-primary opacity-80" />
                </div>
                <h2 className="text-2xl font-bold mb-2">কোনো ম্যাপ আপলোড করা নেই</h2>
                <p className="text-muted-foreground mb-8 max-w-[320px] text-sm">
                  কাজ শুরু করতে আপনার জমির নকশা বা ম্যাপ (JPG, PNG) আপলোড করুন।
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button
                    onClick={() => document.getElementById('step-image-upload')?.click()}
                    size="lg"
                    className="gap-2 shadow-lg rounded-full"
                  >
                    <Upload className="h-4 w-4" />
                    ডিভাইস থেকে আপলোড করুন
                  </Button>
                  <Button
                    onClick={() => setIsDriveBrowserOpen(true)}
                    variant="outline"
                    size="lg"
                    className="gap-2 shadow-lg rounded-full bg-background/50 backdrop-blur-sm"
                  >
                    <HardDrive className="h-4 w-4 text-primary" />
                    ড্রাইভ থেকে আনুন
                  </Button>
                </div>
              </div>
            </div>
          )}

          <FloatingToolbar onOpenDrive={() => setIsDriveBrowserOpen(true)} />
          {/* ── Mode-aware floating bottom bars (undo/redo/cancel) ── */}
          <SidebarControls />
        </div>

        {/* ── Results below the canvas ── */}
        <div className="max-w-7xl mx-auto px-4 xl:px-0">
          {(mode === 'none' || (mode === 'drawing_plot' && plotPoints.length === 0)) && (
            <ResultsDisplay onPrint={handlePrint} />
          )}
        </div>



        {savedPlots.length > 0 && (
          <div className="border-t py-2 print:hidden bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 xl:px-0">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Plots</h3>
              <div className="flex flex-wrap gap-3">
                {savedPlots.map((plot, index) => (
                  <div key={plot.id} className="flex items-center gap-2 bg-white border rounded px-3 py-1.5 shadow-sm text-sm">
                    <span className="font-medium text-gray-800">{plot.name || `Plot ${index + 1}`}</span>
                    <span className="text-gray-500">
                      {plot.results.shotok.toFixed(4)} shotok
                    </span>
                    <button
                      onClick={() => deleteSavedPlot(plot.id)}
                      className="text-red-500 hover:text-red-700 ml-1"
                      aria-label={`Delete ${plot.name || `Plot ${index + 1}`}`}
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
      <DriveMapBrowser open={isDriveBrowserOpen} onOpenChange={setIsDriveBrowserOpen} />
      <TutorialGuide />
    </>
  );
}
