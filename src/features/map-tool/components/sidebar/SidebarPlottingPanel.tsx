import { Button } from '@/components/ui/button';
import { useMapStore } from '@/features/map-tool/store/useMapStore';

export const SidebarPlottingPanel = () => {
  const {
    mode,
    image,
    scale,
    plots,
    plotsHistory,
    plotsFuture,
    startPlotDrawing,
    undoPlotAction,
    redoPlotAction,
    confirmClearPlot,
  } = useMapStore();

  return (
    <div id="step-drawing">
      <label className="block text-sm font-medium text-foreground mb-1">3. প্লট আঁকুন</label>
      <Button size="sm" onClick={startPlotDrawing} disabled={!image || !scale || mode === 'drawing_plot' || mode === 'calibrating'} className="w-full">
        {mode === 'drawing_plot' ? 'ম্যাপে কোণে ক্লিক করুন' : plots.length > 0 ? 'আরেক প্লট আঁকুন' : 'প্লট আঁকুন'}
      </Button>
      <div className="mt-2 text-xs text-muted-foreground">
        {plots.length === 1 ? '১টি প্লট সম্পন্ন হয়েছে' : plots.length > 1 ? `${plots.length}টি প্লট সম্পন্ন হয়েছে` : ''}
      </div>
      {(plots.length > 0 || plotsFuture.length > 0) && mode !== 'drawing_plot' && (
        <div className="flex gap-2 mt-2">
          <Button onClick={undoPlotAction} disabled={plotsHistory.length === 0} variant="outline" size="sm" className="flex-1">পূর্বাবস্থায় ফেরান</Button>
          <Button onClick={redoPlotAction} disabled={plotsFuture.length === 0} variant="outline" size="sm" className="flex-1">পুনরায় ফেরান</Button>
          <Button onClick={() => confirmClearPlot()} variant="outline" size="sm" className="flex-1">সব মুছুন</Button>
        </div>
      )}
      {plots.length > 0 && mode !== 'manual_divide_plot' && mode !== 'drawing_plot' && (
        <div className="flex gap-2 mt-2">
          <Button onClick={useMapStore.getState().startManualDivide} variant="secondary" size="sm" className="flex-1">জমি ভাগ করুন</Button>
        </div>
      )}
    </div>
  );
};
