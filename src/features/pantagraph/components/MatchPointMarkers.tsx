'use client';

import { memo } from 'react';
import { Group, Path, Line, Text } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';

const PIN_PATH = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";
const LINE_DASH = [4, 4];
const LINE_COLOR = '#fbbf24'; // amber-400
const FORMER_COLOR = '#ef4444'; // red-500
const CURRENT_COLOR = '#3b82f6'; // blue-500
const INACTIVE_OPACITY = 0.4;

export const MatchPointMarkers = memo(function MatchPointMarkers() {
  const {
    matchPoints,
    formerRotation,
    formerPosition,
    currentRotation,
    currentPosition,
  } = usePantagraphStore(
    useShallow((s) => ({
      matchPoints: s.matchPoints,
      formerRotation: s.formerRotation,
      formerPosition: s.formerPosition,
      currentRotation: s.currentRotation,
      currentPosition: s.currentPosition,
    }))
  );

  if (matchPoints.length === 0) return null;

  return (
    <Group listening={false}>
      {matchPoints.map((point, index) => {
        const hasCurrent = point.current !== null;
        const isPaired = hasCurrent;
        const label = `${index + 1}`;

        // Compute the visually transformed coordinates of the former point
        // so the dashed line connects correctly on the stage.
        const angleRad = (formerRotation * Math.PI) / 180;
        const transformedFormerX = point.former.x * Math.cos(angleRad) - point.former.y * Math.sin(angleRad) + formerPosition.x;
        const transformedFormerY = point.former.x * Math.sin(angleRad) + point.former.y * Math.cos(angleRad) + formerPosition.y;

        // Compute the visually transformed coordinates of the current point
        let transformedCurrentX = point.current?.x || 0;
        let transformedCurrentY = point.current?.y || 0;
        if (hasCurrent) {
          const angleRad2 = (currentRotation * Math.PI) / 180;
          transformedCurrentX = point.current!.x * Math.cos(angleRad2) - point.current!.y * Math.sin(angleRad2) + currentPosition.x;
          transformedCurrentY = point.current!.x * Math.sin(angleRad2) + point.current!.y * Math.cos(angleRad2) + currentPosition.y;
        }

        return (
          <Group key={point.id}>
            {/* Former marker (red) */}
            <Group
              opacity={isPaired ? 1 : INACTIVE_OPACITY}
              x={formerPosition.x}
              y={formerPosition.y}
              rotation={formerRotation}
            >
              <Group x={point.former.x} y={point.former.y}>
                <Path
                  x={0}
                  y={0}
                  data={PIN_PATH}
                  fill={FORMER_COLOR}
                  stroke="#fff"
                  strokeWidth={1}
                  offsetX={12}
                  offsetY={22}
                  scale={{ x: 1.2, y: 1.2 }}
                  perfectDrawEnabled={false}
                />
                <Text
                  x={-12}
                  y={-27.6}
                  width={24}
                  height={24}
                  text={label}
                  fontSize={14}
                  fill="#fff"
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  perfectDrawEnabled={false}
                />
              </Group>
            </Group>

            {/* Current marker (blue) — only when placed */}
            {hasCurrent && (
              <Group
                x={currentPosition.x}
                y={currentPosition.y}
                rotation={currentRotation}
              >
                <Group x={point.current!.x} y={point.current!.y}>
                  <Path
                    x={0}
                    y={0}
                    data={PIN_PATH}
                    fill={CURRENT_COLOR}
                    stroke="#fff"
                    strokeWidth={1}
                    offsetX={12}
                    offsetY={22}
                    scale={{ x: 1.2, y: 1.2 }}
                    perfectDrawEnabled={false}
                  />
                  <Text
                    x={-12}
                    y={-27.6}
                    width={24}
                    height={24}
                    text={label}
                    fontSize={14}
                    fill="#fff"
                    fontStyle="bold"
                    align="center"
                    verticalAlign="middle"
                    perfectDrawEnabled={false}
                  />
                </Group>
              </Group>
            )}

            {/* Dashed connector line when both sides are placed */}
            {isPaired && (
              <Line
                points={[
                  transformedFormerX,
                  transformedFormerY,
                  transformedCurrentX,
                  transformedCurrentY,
                ]}
                stroke={LINE_COLOR}
                strokeWidth={1.5}
                dash={LINE_DASH}
                perfectDrawEnabled={false}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
});
