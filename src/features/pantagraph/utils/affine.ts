/**
 * Least-squares affine transform solver.
 *
 * Given N ≥ 3 pairs of points (former → current), find the optimal
 * affine transform that maps former points to current points.
 *
 * Affine transform (2D):
 *   [x']   =  [a  b] * [x]  +  [tx]
 *   [y']      [c  d]   [y]     [ty]
 *
 * Parameters: a, b, c, d, tx, ty (6 DOF)
 * - a, d = scale along X, Y axes
 * - b, c = shear/rotation
 * - tx, ty = translation
 *
 * We set up a linear system of the form A * p = b,
 * where p = [a, b, tx, c, d, ty]^T.
 *
 * For each point pair (x,y) → (x',y'):
 *   [x  y  1  0  0  0] * [a ] = [x']
 *   [0  0  0  x  y  1]   [b ]   [y']
 *                         [tx]
 *                         [c ]
 *                         [d ]
 *                         [ty]
 *
 * Solved via normal equations: (A^T * A) * p = A^T * b
 */

import type { Point2D } from '../types';

export interface AffineResult {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

/**
 * Compute least-squares affine transform from point pairs.
 * @param former - Array of points on the former (source) map
 * @param current - Array of corresponding points on the current (target) map
 * @returns AffineResult with a, b, c, d, tx, ty
 * @throws Error if fewer than 2 point pairs are provided
 */
export function computeAffine(
  former: Point2D[],
  current: Point2D[]
): AffineResult {
  const n = Math.min(former.length, current.length);

  if (n < 2) {
    throw new Error('At least 2 point pairs are required');
  }

  if (n === 2) {
    return solveTwoPointsAffine(former.slice(0, 2), current.slice(0, 2));
  }

  // For 3+ points, use least squares (3 points gives exact solution)
  return solveLeastSquaresAffine(former.slice(0, n), current.slice(0, n));
}

/**
 * For exactly 2 points, we compute a "similarity-like" affine:
 * rotation + uniform scale + translation (no shear/non-uniform scale).
 */
function solveTwoPointsAffine(
  former: Point2D[],
  current: Point2D[]
): AffineResult {
  const [p1, p2] = former;
  const [q1, q2] = current;

  const vx = p2.x - p1.x;
  const vy = p2.y - p1.y;
  const wx = q2.x - q1.x;
  const wy = q2.y - q1.y;

  const scale = Math.sqrt((wx * wx + wy * wy) / (vx * vx + vy * vy));
  const angle1 = Math.atan2(vy, vx);
  const angle2 = Math.atan2(wy, wx);
  const rotation = angle2 - angle1;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const a = scale * cosR;
  const b = -scale * sinR;
  const c = scale * sinR;
  const d = scale * cosR;

  const tx = q1.x - (a * p1.x + b * p1.y);
  const ty = q1.y - (c * p1.x + d * p1.y);

  return { a, b, c, d, tx, ty };
}

/**
 * Least-squares affine solver for 3+ point pairs.
 *
 * System for each pair:
 *   [x  y  1  0  0  0]   [a ]   [x']
 *   [0  0  0  x  y  1] * [b ] = [y']
 *                         [tx]
 *                         [c ]
 *                         [d ]
 *                         [ty]
 *
 * Normal equation: (A^T * A) * p = A^T * b  →  6x6 system
 */
function solveLeastSquaresAffine(
  former: Point2D[],
  current: Point2D[]
): AffineResult {
  const n = former.length;

  // Build the 6x6 normal equation matrix (symmetric) and 6x1 RHS
  // We compute A^T * A and A^T * b directly
  //
  // For each point pair, A contributes 2 rows:
  // Row 1: [x, y, 1, 0, 0, 0] → for x' equation
  // Row 2: [0, 0, 0, x, y, 1] → for y' equation
  //
  // A^T * A is a 6x6 symmetric matrix. We build it as:
  //   [a11, a12, a13, a14, a15, a16]
  //   [a12, a22, a23, a24, a25, a26]
  //   [a13, a23, a33, a34, a35, a36]
  //   [a14, a24, a34, a44, a45, a46]
  //   [a15, a25, a35, a45, a55, a56]
  //   [a16, a26, a36, a46, a56, a66]

  // We use a flat array for the upper triangle
  const M = new Array(21).fill(0); // upper tri of 6x6
  const b = new Array(6).fill(0);  // RHS

  // Helper: index in upper triangular (row <= col)
  const idx = (r: number, c: number) => r * 6 - (r * (r - 1)) / 2 + (c - r);

  for (let i = 0; i < n; i++) {
    const x = former[i].x;
    const y = former[i].y;
    const xp = current[i].x;
    const yp = current[i].y;

    // Row 1: [x, y, 1, 0, 0, 0]
    // Row 2: [0, 0, 0, x, y, 1]

    // A^T * A contributions from row 1:
    M[idx(0, 0)] += x * x;
    M[idx(0, 1)] += x * y;
    M[idx(0, 2)] += x;
    // columns 3,4,5 = 0 for row 1
    // symmetry: rows 3,4,5 col 0 = 0

    M[idx(1, 1)] += y * y;
    M[idx(1, 2)] += y;
    // columns 3,4,5 = 0

    M[idx(2, 2)] += 1;
    // columns 3,4,5 = 0

    // A^T * A contributions from row 2:
    // Index offset: row 2 has values at columns 3,4,5
    M[idx(0, 3)] += 0; // x*0
    M[idx(0, 4)] += 0; // x*0
    M[idx(0, 5)] += 0; // x*0
    // Actually from row 2 column 0=0: all terms with [r=0..2, c=3..5] += 0

    M[idx(1, 3)] += 0;
    M[idx(1, 4)] += 0;
    M[idx(1, 5)] += 0;

    M[idx(2, 3)] += 0;
    M[idx(2, 4)] += 0;
    M[idx(2, 5)] += 0;

    M[idx(3, 3)] += x * x;
    M[idx(3, 4)] += x * y;
    M[idx(3, 5)] += x;

    M[idx(4, 4)] += y * y;
    M[idx(4, 5)] += y;

    M[idx(5, 5)] += 1;

    // A^T * b contributions:
    b[0] += x * xp;
    b[1] += y * xp;
    b[2] += xp;
    b[3] += x * yp;
    b[4] += y * yp;
    b[5] += yp;
  }

  // Solve the 6x6 system using Gaussian elimination
  const solution = solve6x6(M, b);

  return {
    a: solution[0],
    b: solution[1],
    tx: solution[2],
    c: solution[3],
    d: solution[4],
    ty: solution[5],
  };
}

/**
 * Solve symmetric 6x6 linear system stored in upper-triangular packed format.
 * Uses Gaussian elimination with partial pivoting on the full 6x6 matrix.
 */
function solve6x6(M_upper: number[], b: number[]): number[] {
  // Expand to full 6x6 augmented matrix
  const m: number[][] = Array.from({ length: 6 }, () => new Array(7).fill(0));

  // Fill upper triangle
  let p = 0;
  for (let r = 0; r < 6; r++) {
    for (let c = r; c < 6; c++) {
      m[r][c] = M_upper[p];
      m[c][r] = M_upper[p]; // symmetric
      p++;
    }
    m[r][6] = b[r]; // RHS
  }

  // Forward elimination with partial pivoting
  for (let col = 0; col < 6; col++) {
    // Pivot
    let maxVal = Math.abs(m[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < 6; row++) {
      const val = Math.abs(m[row][col]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = row;
      }
    }
    if (maxRow !== col) {
      [m[col], m[maxRow]] = [m[maxRow], m[col]];
    }

    const pivot = m[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Singular — fall back to identity
      return [1, 0, 0, 0, 1, 0];
    }

    for (let row = col + 1; row < 6; row++) {
      const factor = m[row][col] / pivot;
      for (let j = col; j <= 6; j++) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }

  // Back substitution
  const x = new Array(6).fill(0);
  for (let i = 5; i >= 0; i--) {
    let sum = m[i][6];
    for (let j = i + 1; j < 6; j++) {
      sum -= m[i][j] * x[j];
    }
    x[i] = sum / m[i][i];
  }

  return x;
}

/**
 * Decompose an affine 2x2 matrix [a, b; c, d] into Konva-compatible
 * transform properties: rotation, scaleX, scaleY, skewX.
 *
 * Uses polar decomposition to extract rotation first, then
 * the remaining upper-triangular part gives scale and skew.
 *
 * Order: Translate → Rotate → Skew → Scale
 */
export function decomposeAffine(
  a: number,
  b: number,
  c: number,
  d: number
): {
  rotation: number; // radians
  scaleX: number;
  scaleY: number;
  skewX: number;
} {
  // Extract rotation from the first column
  const sx = Math.sqrt(a * a + c * c);
  const rotation = Math.atan2(c, a);
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // sy = d*cos(r) - b*sin(r)  (from the derived formula)
  const sy = d * cosR - b * sinR;

  // skewX = (b + sy*sin(r)) / (sy*cos(r))
  // But handle degenerate cases
  let skewX = 0;
  const denom = sy * cosR;
  if (Math.abs(denom) > 1e-10) {
    skewX = (b + sy * sinR) / denom;
  } else if (Math.abs(sy * sinR) > 1e-10) {
    skewX = (d - sy * cosR) / (sy * sinR);
  }

  return { rotation, scaleX: sx, scaleY: sy, skewX };
}
