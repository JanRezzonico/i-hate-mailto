const MS_PER_CHAR = 40;
const MAX_DURATION = 12_000;

/** Longer info messages stay on screen longer: `base` plus a per-character allowance, capped. */
export const computeInfoToastDuration = (base: number, text: string): number => {
  return Math.min(base + text.length * MS_PER_CHAR, MAX_DURATION);
};
