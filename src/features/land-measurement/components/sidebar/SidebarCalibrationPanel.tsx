import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DECIMALS } from '@/features/land-measurement/utils/calculations';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';

export const SidebarCalibrationPanel = () => {
  const [isChangingScale, setIsChangingScale] = useState(false);
  const {
    mode,
    setMode,
    image,
    scale,
    manualScale,
    setManualScale,
    showManualScale,
    setShowManualScale,
    setIsDrawing,
    setCalibrationLine,
    handleManualScaleSubmit,
    confirmClearPlot,
  } = useMapStore(useShallow((s) => ({
    mode: s.mode,
    setMode: s.setMode,
    image: s.image,
    scale: s.scale,
    manualScale: s.manualScale,
    setManualScale: s.setManualScale,
    showManualScale: s.showManualScale,
    setShowManualScale: s.setShowManualScale,
    setIsDrawing: s.setIsDrawing,
    setCalibrationLine: s.setCalibrationLine,
    handleManualScaleSubmit: s.handleManualScaleSubmit,
    confirmClearPlot: s.confirmClearPlot,
  })));
  const isScaleConfigured = scale !== null && !isChangingScale && mode !== 'calibrating' && mode !== 'manual_scale';

  return (
    <div id="step-calibration">
      <label className="block text-sm font-medium text-foreground mb-1">2. Set Scale</label>
      <div className="space-y-2">
        {isScaleConfigured ? (
          <div className="flex flex-col gap-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center font-medium">
              Current Scale: 1 px ≈ {(1/scale).toFixed(DECIMALS)} ft
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full" 
              onClick={() => setIsChangingScale(true)}
              disabled={!image}
              title={!image ? "Upload a map before changing scale" : ""}
            >
              {!image ? 'Upload map to calibrate' : 'Change Scale'}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
          <Button 
            size="sm"
            variant={mode === 'calibrating' ? 'default' : 'outline'}
            onClick={() => { 
              confirmClearPlot(() => {
                setIsChangingScale(false);
                setMode('calibrating'); 
                setShowManualScale(false);
                setIsDrawing(false); 
                setCalibrationLine([]); 
              });
            }} 
            disabled={!image || mode === 'calibrating'} 
            className="flex-1"
          >
            {mode === 'calibrating' ? 'Drawing scale...' : 'Draw Scale Bar'}
          </Button>
          <Button 
            size="sm"
            variant={showManualScale ? 'default' : 'outline'}
            onClick={() => {
              if (showManualScale) {
                setMode('none');
              } else {
                setIsChangingScale(false);
                setMode('manual_scale');
              }
              setShowManualScale(!showManualScale);
            }} 
            disabled={!image}
            className="flex-1"
          >
            {showManualScale ? 'Cancel' : 'Manual Scale'}
          </Button>
        </div>

        {/* Instructional hint for scale bar drawing */}
        {mode === 'calibrating' && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-md p-2">
            <p className="text-xs text-blue-700 dark:text-blue-400 text-center leading-relaxed">
              Click at the start and end of the <strong>scale bar</strong> (top-left)
              <br />
              <span className="text-xs opacity-80">(e.g. 0 to 10 chains)</span>
            </p>
          </div>
        )}
        {showManualScale && (
          <form onSubmit={handleManualScaleSubmit} className="flex gap-2">
            <Input
              type="number"
              value={manualScale}
              onChange={(e) => setManualScale(e.target.value)}
              placeholder="Feet per pixel (e.g. 2.30)"
              className="flex-1 h-7 text-xs font-mono"
              step="0.000001"
              min="0.000001"
              required
            />
            <Button size="sm" type="submit" variant="default">Set Scale</Button>
          </form>
        )}

          {scale && isChangingScale && mode !== 'calibrating' && mode !== 'manual_scale' && (
            <Button size="sm" variant="ghost" className="w-full" onClick={() => setIsChangingScale(false)}>
              Cancel Change
            </Button>
          )}
        </>
      )}
      </div>
    </div>
  );
};

