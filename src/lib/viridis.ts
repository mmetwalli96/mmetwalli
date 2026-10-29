/**
 * Viridis, matplotlib's default colormap, sampled at ten evenly spaced stops.
 * The whole site's accent palette is drawn from it.
 */
const STOPS: ReadonlyArray<readonly [number, number, number]> = [
  [68, 1, 84],
  [72, 40, 120],
  [62, 74, 137],
  [49, 104, 142],
  [38, 130, 142],
  [31, 158, 137],
  [53, 183, 121],
  [109, 205, 89],
  [180, 222, 44],
  [253, 231, 37],
];

export function viridis(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(x));
  const f = x - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

export function viridisHex(t: number): string {
  return `#${viridis(t)
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** The slice of the map used on a light background (the yellow end is too pale to read). */
export const LIGHT_RANGE: readonly [number, number] = [0.1, 0.78];

export function viridisLight(t: number): string {
  return viridisHex(LIGHT_RANGE[0] + t * (LIGHT_RANGE[1] - LIGHT_RANGE[0]));
}
