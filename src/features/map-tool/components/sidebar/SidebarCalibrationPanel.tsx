import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DECIMALS } from '@/features/map-tool/utils/calculations';
import { useMapStore } from '@/features/map-tool/store/useMapStore';

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
  } = useMapStore();
  useEffect(() => {
    if (scale) {
      setIsChangingScale(false);
    }
  }, [scale]);

  const isScaleConfigured = scale !== null && !isChangingScale && mode !== 'calibrating' && mode !== 'manual_scale';

  return (
    <div id="step-calibration">
      <label className="block text-sm font-medium text-foreground mb-1">2. স্কেল সেট করুন</label>
      <div className="space-y-2">
        {isScaleConfigured ? (
          <div className="flex flex-col gap-2 p-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 text-center font-medium">
              বর্তমান স্কেল: 1 পিক্সেল ≈ {(1/scale).toFixed(DECIMALS)} ফুট
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-xs h-7 bg-transparent hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30" 
              onClick={() => setIsChangingScale(true)}
              disabled={!image}
              title={!image ? "স্কেল পরিবর্তন করতে আগে ম্যাপ আপলোড করুন" : ""}
            >
              {!image ? 'পরিবর্তন করতে ম্যাপ আপলোড করুন' : 'পরিবর্তন করুন'}
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
                setMode('calibrating'); 
                setShowManualScale(false);
                setIsDrawing(false); 
                setCalibrationLine([]); 
              });
            }} 
            disabled={!image || mode === 'calibrating'} 
            className="flex-1"
          >
            {mode === 'calibrating' ? 'স্কেল আঁকা হচ্ছে...' : 'স্কেল বার আঁকুন'}
          </Button>
          <Button 
            size="sm"
            variant={showManualScale ? 'default' : 'outline'}
            onClick={() => {
              setShowManualScale(!showManualScale);
              if (showManualScale) {
                setMode('none');
              } else {
                setMode('manual_scale');
              }
            }} 
            disabled={!image}
            className="flex-1"
          >
            {showManualScale ? 'বাতিল করুন' : 'ম্যানুয়াল স্কেল'}
          </Button>
        </div>

        {/* Instructional hint for scale bar drawing */}
        {mode === 'calibrating' && (
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-md p-2">
            <p className="text-xs text-blue-700 dark:text-blue-400 text-center leading-relaxed">
              ম্যাপের উপরে-বামের <strong>স্কেল বার</strong>-এর শুরুতে ও শেষে ক্লিক করুন
              <br />
              <span className="text-[11px] opacity-80">(যেমন: ০ থেকে ১০ চেইন পর্যন্ত)</span>
            </p>
          </div>
        )}
        {showManualScale && (
          <form onSubmit={handleManualScaleSubmit} className="flex gap-2">
            <Input
              type="number"
              value={manualScale}
              onChange={(e) => setManualScale(e.target.value)}
              placeholder="পিক্সেল প্রতি ফুট (যেমন: 2.30)"
              className="flex-1 h-8"
              step="0.000001"
              min="0.000001"
              required
            />
            <Button size="sm" type="submit" variant="default">সেট করুন</Button>
          </form>
        )}

          {scale && isChangingScale && mode !== 'calibrating' && mode !== 'manual_scale' && (
            <Button size="sm" variant="ghost" className="w-full text-xs h-7" onClick={() => setIsChangingScale(false)}>
              পরিবর্তন বাতিল করুন
            </Button>
          )}
        </>
      )}
      </div>
    </div>
  );
};
