const MS_PER_CHAR = 40;
const MAX_DURATION = 12_000;

export const computeInfoToastDuration = (base: number, text: string): number => {
  return Math.min(Math.max(base, base + text.length * MS_PER_CHAR), MAX_DURATION);
};
