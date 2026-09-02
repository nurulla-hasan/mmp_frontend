// ── Mouza Map Traditional Scale Units ──
// Standard Bangladesh mouza map scale: 16 inches = 1 mile
// Scale bar is typically at top-left of the map

/** 1 chain = 66 feet */
export const CHAIN_TO_FT = 66;

/** 1 link = 0.66 feet ≈ 7.92 inches */
export const LINK_TO_FT = 0.66;

/** 1 mile = 5280 feet */
export const MILE_TO_FT = 5280;

/** Map scale: 16 inches = 1 mile */
export const MAP_INCHES_PER_MILE = 16;

/** Feet per map inch at 16 inches/mile */
export const FEET_PER_MAP_INCH = MILE_TO_FT / MAP_INCHES_PER_MILE; // 330 ft/inch

export interface ScalePreset {
  /** Display label (e.g. "10 chains") */
  label: string;
  /** Real-world distance in feet */
  valueFt: number;
  /** Short description shown as hint */
  description: string;
  /** Whether this is the recommended default */
  recommended?: boolean;
}

/**
 * Predefined scale presets for mouza maps.
 * The most common scale bar on mouza maps is 0→10 chains (= 660 ft).
 */
export const SCALE_PRESETS: ScalePreset[] = [
  { label: '10 chains', valueFt: 10 * CHAIN_TO_FT, description: '10 chains = 660 ft', recommended: true },
  { label: '5 chains',  valueFt: 5 * CHAIN_TO_FT,   description: '5 chains = 330 ft' },
  { label: '20 links',  valueFt: 20 * LINK_TO_FT,   description: '20 links = 13.2 ft' },
  { label: '100 links', valueFt: 100 * LINK_TO_FT,  description: '100 links = 66 ft (1 chain)' },
  { label: '1 mile',    valueFt: MILE_TO_FT,        description: '1 mile = 5280 ft' },
];

/**
 * Validate whether a calibration line's pixel distance seems reasonable
 * for the selected preset.
 * Returns a warning message if suspicious, or empty string if OK.
 */
export function validateCalibration(
  pixelDistance: number,
  presetValueFt: number,
): string {
  if (pixelDistance <= 0) return 'Invalid line distance';

  const expectedPxPerFt = pixelDistance / presetValueFt;

  // If the resulting scale is extreme, warn the user
  if (expectedPxPerFt < 0.1) {
    return 'Warning: This distance seems unusually small. Did you mark the correct scale bar?';
  }
  if (expectedPxPerFt > 1000) {
    return 'Warning: This distance seems unusually large. Did you mark the correct scale bar?';
  }

  return '';
}
