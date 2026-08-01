export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Partes iguales que suman exactamente 100 (último absorbe residuo). */
export function equalWeights(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [100];
  const each = round2(100 / n);
  const weights = Array.from({ length: n }, () => each);
  const headSum = round2(each * (n - 1));
  weights[n - 1] = round2(100 - headSum);
  return weights;
}

export function weightedAverage(
  values: number[],
  weightsPct: number[],
): number {
  if (!values.length) return 0;
  const n = Math.min(values.length, weightsPct.length);
  let weightedSum = 0;
  let weightSum = 0;
  for (let i = 0; i < n; i += 1) {
    const w = weightsPct[i] ?? 0;
    weightedSum += values[i] * w;
    weightSum += w;
  }
  if (weightSum <= 0) return 0;
  return round2(weightedSum / weightSum);
}

export function sumWeights(weights: number[]): number {
  return round2(weights.reduce((a, b) => a + b, 0));
}

export function weightsSumTo100(weights: number[], epsilon = 0.01): boolean {
  return Math.abs(sumWeights(weights) - 100) <= epsilon;
}
