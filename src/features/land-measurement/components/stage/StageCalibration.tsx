import { memo } from 'react';
import { Line, Circle, Group } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { useMapStore } from '@/features/land-measurement/store/useMapStore';

export const StageCalibration = memo(() => {
  const { mode, calibrationLine, stageScale, stagePos, stageSize, isDrawing } = useMapStore(
    useShallow(s => ({
      mode: s.mode,
      calibrationLine: s.calibrationLine,
      stageScale: s.stageScale,
      stageSize: s.stageSize,
      isDrawing: s.isDrawing,
      pointerPos: s.pointerPos,
      deviceType: s.deviceType,
      // Only subscribe to stagePos if actively drawing the dynamic line
      stagePos: s.mode === 'calibrating' && s.calibrationLine.length >= 2 && s.isDrawing ? s.stagePos : null
    }))
  );
  
  if (calibrationLine.length === 0) return null;

  return (
    <Group>
      <Line points={calibrationLine} stroke="#2563EB" strokeWidth={3 / stageScale} />
      
      {Array.from({ length: calibrationLine.length / 2 }).map((_, i) => (
        <Circle 
          key={i} 
          x={calibrationLine[i * 2]} 
          y={calibrationLine[i * 2 + 1]} 
          radius={5 / stageScale} 
          fill="#2563EB" 
          stroke="white" 
          strokeWidth={1 / stageScale} 
        />
      ))}
      
      {mode === 'calibrating' && calibrationLine.length >= 2 && isDrawing && (() => {
        const store = useMapStore.getState();
        let center = { 
          x: (stageSize.width / 2 - (stagePos?.x || 0)) / stageScale, 
          y: (stageSize.height / 2 - (stagePos?.y || 0)) / stageScale 
        };
        if (store.deviceType === 'mouse' && store.pointerPos) {
          center = store.pointerPos;
        }
        const len = calibrationLine.length;
        return <Line points={[calibrationLine[len - 2], calibrationLine[len - 1], center.x, center.y]} stroke="#2563EB" strokeWidth={2 / stageScale} dash={[5 / stageScale, 5 / stageScale]} opacity={0.7} />;
      })()}
    </Group>
  );
});
StageCalibration.displayName = 'StageCalibration';

