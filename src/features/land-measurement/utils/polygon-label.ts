import type { Point } from '../types/map';
import { getLogicalCorners } from './geometry';
import { getReadableRotation } from './component-helpers';

const EPSILON = 1e-8;
const MIN_AXIS_ANISOTROPY = 0.08;

const getLongestEdgeAngle = (points: Point[]): number => {
  if (points.length < 2) return 0;

  let longestLengthSq = -1;
  let longestAngle = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const lengthSq = dx * dx + dy * dy;

    if (lengthSq > longestLengthSq) {
      longestLengthSq = lengthSq;
      longestAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    }
  }

  return longestAngle;
};

/**
 * Return a stable, readable rotation for a polygon's area label.
 *
 * The label's x-axis follows the plot's dominant/long direction. PCA over
 * logical corners gives the major axis in O(n) without letting dense tracing
 * points bias the result. Nearly square/ambiguous shapes fall back to the
 * longest logical edge so tiny coordinate noise cannot make the label spin.
 */
export const getPolygonAreaLabelRotation = (points: Point[]): number => {
  if (points.length < 2) return 0;

  const logicalCorners = getLogicalCorners(points);
  const axisPoints = logicalCorners.length >= 2 ? logicalCorners : points;

  const mean = axisPoints.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
  mean.x /= axisPoints.length;
  mean.y /= axisPoints.length;

  let covXX = 0;
  let covYY = 0;
  let covXY = 0;

  for (const point of axisPoints) {
    const dx = point.x - mean.x;
    const dy = point.y - mean.y;
    covXX += dx * dx;
    covYY += dy * dy;
    covXY += dx * dy;
  }

  const trace = covXX + covYY;
  if (trace <= EPSILON) return 0;

  const delta = Math.hypot(covXX - covYY, 2 * covXY);
  const anisotropy = delta / trace;

  const rawAngle = anisotropy >= MIN_AXIS_ANISOTROPY
    ? 0.5 * Math.atan2(2 * covXY, covXX - covYY) * (180 / Math.PI)
    : getLongestEdgeAngle(axisPoints);

  return getReadableRotation(rawAngle);
};
