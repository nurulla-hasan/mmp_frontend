'use client';

import { useRef, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { DistanceModal } from '@/features/map-tool/components/DistanceModal';
import { ResultsDisplay } from '@/features/map-tool/components/ResultsDisplay';
import { PrintLayout } from '@/features/map-tool/components/PrintLayout';
import { SidebarControls } from '@/features/map-tool/components/sidebar/SidebarControls';
import { ScratchSheet } from '@/features/map-tool/components/scratch/ScratchSheet';
import { ToolTopControls } from '@/features/map-tool/components/toolbar/ToolTopControls';
import { useMapStore } from '@/features/map-tool/store/useMapStore';
import { TutorialGuide } from '@/features/map-tool/components/tutorial-guide';

const KonvaStage = nextDynamic(
  () => import('@/features/map-tool/components/stage/KonvaStage').then((m) => ({ default: m.KonvaStage })),
  { ssr: false }
);

export default function MapCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const showScratchSheet = searchParams.get('scratch') === 'true';

  const setShowScratchSheet = (show: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (show) params.set('scratch', 'true');
    else params.delete('scratch');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  const printRef = useRef<HTMLDivElement | null>(null);
  const scratchSheetRef = useRef<HTMLDivElement | null>(null);
  const previousModeRef = useRef<string | null>(null);

  const {
    savedPlots,
    deleteSavedPlot,
    setStageSize,
    setReportImage,
    mode,
    plotPoints,
  } = useMapStore();

  useEffect(() => {
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const isDrawMode = mode === 'drawing_plot' || mode === 'calibrating' || mode === 'manual_divide_plot';
    const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const updateSize = () => {
      if (containerRef.current) {
        let finalHeight: number;
        if (isDrawMode && isMobileDevice) {
          finalHeight = Math.max(350, window.innerHeight - 190);
        } else if (isDrawMode) {
          finalHeight = Math.max(450, window.innerHeight - 180);
        } else if (isMobileDevice) {
          finalHeight = Math.max(320, Math.round(window.innerHeight * 0.55));
        } else {
          finalHeight = Math.max(450, window.innerHeight - 180);
        }
        setStageSize({ width: containerRef.current.offsetWidth, height: finalHeight });
      }
    };
    updateSize();

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (isMobile && currentWidth === lastWidth && Math.abs(currentHeight - lastHeight) < 150) {
        return;
      }

      lastWidth = currentWidth;
      lastHeight = currentHeight;
      updateSize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setStageSize, mode]);

  const handlePrint = () => {
    if (stageRef.current) {
      setReportImage(stageRef.current.toDataURL({ pixelRatio: 2 }));
    }
    setTimeout(() => window.print(), 100);
  };

  useEffect(() => {
    if (showScratchSheet && scratchSheetRef.current) {
      setTimeout(() => {
        scratchSheetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [showScratchSheet]);

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
        <div className="max-w-7xl mx-auto p-4 xl:px-0 w-full">
          <SidebarControls />

          <ToolTopControls
            showScratchSheet={showScratchSheet}
            setShowScratchSheet={setShowScratchSheet}
          />

          <div ref={containerRef}>
            <KonvaStage
              containerRef={containerRef}
              stageRef={stageRef}
            />
          </div>

          {(mode === 'none' || (mode === 'drawing_plot' && plotPoints.length === 0)) && (
            <ResultsDisplay onPrint={handlePrint} />
          )}
        </div>

        {showScratchSheet && (
          <div ref={scratchSheetRef} className="pb-8">
            <div className="max-w-7xl mx-auto p-4 xl:px-0 w-full">
              <ScratchSheet savedPlots={savedPlots} onDeleteSavedPlot={deleteSavedPlot} />
            </div>
          </div>
        )}

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

      <TutorialGuide />
    </>
  );
}
