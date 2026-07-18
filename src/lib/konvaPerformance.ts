import Konva from 'konva';

const MAX_INTERACTIVE_PIXEL_RATIO = 2;

/**
 * Full-screen canvas tools can allocate several backing-store pixels for every
 * CSS pixel on high-DPI phones. Capping the ratio keeps interaction sharp while
 * preventing disproportionate canvas memory and redraw cost.
 */
export function configureInteractiveKonva(): void {
  if (typeof window === 'undefined') return;
  Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_INTERACTIVE_PIXEL_RATIO);
}
