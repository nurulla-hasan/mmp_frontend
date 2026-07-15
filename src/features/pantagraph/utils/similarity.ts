/**
 * Least-squares similarity transform solver.
 *
 * Given N ≥ 4 pairs of points (former → current), find the optimal
 * similarity transform (translation + rotation + uniform scale) that
 * maps former points to current points.
 *
 * Similarity transform (2D):
 *   [x']   =  s * [cosθ  -sinθ] * [x]  +  [tx]
 *   [y']          [sinθ   cosθ]   [y]     [ty]
 *
 * Where s = scale, θ = rotation, (tx, ty) = translation.
 *
 * We solve this by setting up a linear system of the form A * p = b,
 * where p = [a, b, tx, ty]^T, with a = s*cosθ, b = s*sinθ.
 *
 * Then: s = sqrt(a² + b²), θ = atan2(b, a).
 *
 * The system is solved via the normal equations: (A^T * A) * p = A^T * b
 */

import type { Point2D, SimilarityResult } from '../types';

/**
 * Compute least-squares similarity transform from point pairs.
 * @param former - Array of points on the former (source) map
 * @param current - Array of corresponding points on the current (target) map
 * @returns SimilarityResult with translation, rotation, and scale
 * @throws Error if fewer than 2 distinct point pairs are provided
 */
export function computeSimilarity(
  former: Point2D[],
  current: Point2D[]
): SimilarityResult {
  const n = Math.min(former.length, current.length);

  if (n < 2) {
    throw new Error('At least 2 point pairs are required for similarity transform');
  }

  if (n === 2) {
    return solveExactTwoPoints(former.slice(0, 2), current.slice(0, 2));
  }

  return solveLeastSquares(former.slice(0, n), current.slice(0, n));
}

/**
 * Exact solution for exactly 2 point pairs.
 */
function solveExactTwoPoints(
  former: Point2D[],
  current: Point2D[]
): SimilarityResult {
  const [p1, p2] = former;
  const [q1, q2] = current;

  // Vectors
  const vx = p2.x - p1.x;
  const vy = p2.y - p1.y;
  const wx = q2.x - q1.x;
  const wy = q2.y - q1.y;

  const scale = Math.sqrt((wx * wx + wy * wy) / (vx * vx + vy * vy));

  // Angle from former vector to current vector
  const angle1 = Math.atan2(vy, vx);
  const angle2 = Math.atan2(wy, wx);
  const rotation = angle2 - angle1;

  // Translation: apply (scale, rotation) to p1, then find offset to q1
  const cosA = Math.cos(rotation);
  const sinA = Math.sin(rotation);
  const tx = q1.x - scale * (cosA * p1.x - sinA * p1.y);
  const ty = q1.y - scale * (sinA * p1.x + cosA * p1.y);

  return { tx, ty, rotation, scale };
}

/**
 * Least-squares solution for 3+ point pairs.
 *
 * For each pair: former=(x,y), current=(x',y')
 *   x' = a*x - b*y + tx
 *   y' = b*x + a*y + ty
 *
 * where a = s*cosθ, b = s*sinθ
 *
 * Matrix form for N pairs:
 *   [x1']   [x1  -y1  1  0]   [a ]
 *   [y1'] = [y1   x1  0  1] * [b ]
 *   [x2']   [x2  -y2  1  0]   [tx]
 *   [y2']   [y2   x2  0  1]   [ty]
 *   ...     ...               ...
 *
 * Solve: (A^T * A) * p = A^T * b  →  p = (A^T * A)^(-1) * A^T * b
 */
function solveLeastSquares(
  former: Point2D[],
  current: Point2D[]
): SimilarityResult {
  const n = former.length;

  // Build the normal equation system: A^T * A (4x4), A^T * b (4x1)
  let a11 = 0, a12 = 0, a13 = 0, a14 = 0;
  let a22 = 0, a23 = 0, a24 = 0;
  let a33 = 0;
  let a44 = 0;

  let b1 = 0, b2 = 0, b3 = 0, b4 = 0;

  for (let i = 0; i < n; i++) {
    const x = former[i].x;
    const y = former[i].y;
    const xp = current[i].x;
    const yp = current[i].y;

    // Row of A for x' equation: [x, -y, 1, 0]
    // Row of A for y' equation: [y,  x, 0, 1]

    // A^T * A contributions
    // From x' row: [x, -y, 1, 0]^T * [x, -y, 1, 0]
    a11 += x * x;
    a12 += x * (-y);
    a13 += x;
    // a14 += x * 0; → 0
    a22 += y * y;    // (-y)*(-y)
    a23 += -y;       // (-y)*1
    // a24 += 0;
    a33 += 1;        // 1*1
    // a34 += 0;
    // a44 += 0;

    // From y' row: [y, x, 0, 1]^T * [y, x, 0, 1]
    a11 += y * y;
    a12 += y * x;
    // a13 += 0;
    a14 += y;        // y*1
    a22 += x * x;
    // a23 += 0;
    a24 += x;        // x*1
    // a33 += 0;
    // a34 += 0;
    a44 += 1;        // 1*1

    // A^T * b contributions
    // From x' row: [x, -y, 1, 0]^T * xp
    b1 += x * xp;
    b2 += (-y) * xp;
    b3 += xp;
    // b4 += 0;

    // From y' row: [y, x, 0, 1]^T * yp
    b1 += y * yp;
    b2 += x * yp;
    // b3 += 0;
    b4 += yp;
  }

  // Now solve the 4x4 symmetric system using Gaussian elimination
  const matrix = [
    [a11, a12, a13, a14],
    [a12, a22, a23, a24],
    [a13, a23, a33, 0],
    [a14, a24, 0, a44],
  ];
  const rhs = [b1, b2, b3, b4];

  const solution = gaussElimination4x4(matrix, rhs);
  const a = solution[0]; // s * cosθ
  const b = solution[1]; // s * sinθ
  const tx = solution[2];
  const ty = solution[3];

  const scale = Math.sqrt(a * a + b * b);
  const rotation = Math.atan2(b, a);

  return { tx, ty, rotation, scale };
}

/**
 * Solve a 4x4 linear system using Gaussian elimination with partial pivoting.
 */
function gaussElimination4x4(
  A: number[][],
  b: number[]
): number[] {
  // Augmented matrix
  const m = A.map((row, i) => [...row, b[i]]);

  // Forward elimination
  for (let col = 0; col < 4; col++) {
    // Partial pivoting
    let maxVal = Math.abs(m[col][col]);
    let maxRow = col;
    for (let row = col + 1; row < 4; row++) {
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
      // Singular or near-singular — fall back to identity transform
      return [1, 0, 0, 0];
    }

    // Eliminate rows below
    for (let row = col + 1; row < 4; row++) {
      const factor = m[row][col] / pivot;
      for (let j = col; j <= 4; j++) {
        m[row][j] -= factor * m[col][j];
      }
    }
  }

  // Back substitution
  const x = [0, 0, 0, 0];
  for (let i = 3; i >= 0; i--) {
    let sum = m[i][4];
    for (let j = i + 1; j < 4; j++) {
      sum -= m[i][j] * x[j];
    }
    x[i] = sum / m[i][i];
  }

  return x;
}
