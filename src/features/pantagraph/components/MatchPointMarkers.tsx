'use client';

import { memo } from 'react';
import { Group, Star, Line, Text, Circle } from 'react-konva';
import { useShallow } from 'zustand/shallow';
import { usePantagraphStore } from '../store/usePantagraphStore';

const STAR_SIZE = 10;
const LABEL_OFFSET = 14;
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
    <Group>
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
                <Star
                  x={0}
                  y={0}
                  numPoints={5}
                  innerRadius={STAR_SIZE * 0.4}
                  outerRadius={STAR_SIZE}
                  fill={FORMER_COLOR}
                  stroke="#fff"
                  strokeWidth={1.5}
                  perfectDrawEnabled={false}
                />
                <Circle
                  x={LABEL_OFFSET}
                  y={-LABEL_OFFSET}
                  radius={12}
                  fill={FORMER_COLOR}
                  perfectDrawEnabled={false}
                />
                <Text
                  x={LABEL_OFFSET - 6}
                  y={-LABEL_OFFSET - 7.5}
                  text={label}
                  fontSize={14}
                  fill="#fff"
                  fontStyle="bold"
                  align="center"
                  width={12}
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
                  <Star
                    x={0}
                    y={0}
                    numPoints={5}
                    innerRadius={STAR_SIZE * 0.4}
                    outerRadius={STAR_SIZE}
                    fill={CURRENT_COLOR}
                    stroke="#fff"
                    strokeWidth={1.5}
                    perfectDrawEnabled={false}
                  />
                  <Circle
                    x={LABEL_OFFSET}
                    y={-LABEL_OFFSET}
                    radius={12}
                    fill={CURRENT_COLOR}
                    perfectDrawEnabled={false}
                  />
                  <Text
                    x={LABEL_OFFSET - 6}
                    y={-LABEL_OFFSET - 7.5}
                    text={label}
                    fontSize={14}
                    fill="#fff"
                    fontStyle="bold"
                    align="center"
                    width={12}
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
