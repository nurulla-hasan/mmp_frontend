import React from 'react';
import type { ScratchPhysicsLabel } from '@/features/map-tool/types/scratch';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const ITERATIONS = 60;
const MIN_DIST = 45;

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface ScratchEdgeLabelsProps {
  allLabels: ScratchPhysicsLabel[];
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

/**
 * Renders all edge / measurement labels with collision avoidance.
 * Mutates the `allLabels` positions in place during the force‑directed
 * push‑apart loop (same pattern as the original orchestrator).
 */
export const ScratchEdgeLabels: React.FC<ScratchEdgeLabelsProps> = ({ allLabels }) => {
  // ── Collision avoidance (force‑directed push‑apart) ──
  for (let iter = 0; iter < ITERATIONS; iter++) {
    for (let i = 0; i < allLabels.length; i++) {
      for (let j = i + 1; j < allLabels.length; j++) {
        const l1 = allLabels[i];
        const l2 = allLabels[j];
        const dx = l2.x - l1.x;
        const dy = l2.y - l1.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MIN_DIST && dist > 0) {
          const push = (MIN_DIST - dist) * 0.5;
          const px = (dx / dist) * push;
          const py = (dy / dist) * push;
          l1.x -= px;
          l1.y -= py;
          l2.x += px;
          l2.y += py;
        }
      }
    }
  }

  return (
    <>
      {allLabels.map((l) => {
        const dx = l.x - l.midX;
        const dy = l.y - l.midY;
        const dist = Math.hypot(dx, dy);
        const endFactor = dist > 8 ? (dist - 8) / dist : 1;
        const lineX2 = l.midX + dx * endFactor;
        const lineY2 = l.midY + dy * endFactor;

        return (
          <g key={`lbl-${l.id}`}>
            {/* Connector line from segment midpoint to label */}
            {dist > (l.offset || 18) + 2 && (
              <line
                x1={l.midX}
                y1={l.midY}
                x2={lineX2}
                y2={lineY2}
                stroke={l.color || '#0F766E'}
                strokeWidth="1"
                opacity="0.6"
              />
            )}
            {/* Label text rotated along the edge */}
            <text
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={l.fontSize || 11}
              fill={l.color || '#0F766E'}
              fontWeight="600"
              paintOrder="stroke"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
              transform={`rotate(${l.textAngle}, ${l.x}, ${l.y})`}
            >
              {l.labelText}
            </text>
          </g>
        );
      })}
    </>
  );
};
