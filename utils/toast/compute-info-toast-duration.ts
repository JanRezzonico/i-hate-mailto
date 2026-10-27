const MS_PER_CHAR = 40;

export const computeToastDuration = (text: string, minimum: number, maximum: number): number => {
  if (!text) return minimum;
  const contentDuration = text.length * MS_PER_CHAR;
  return Math.min(Math.max(contentDuration, minimum), maximum);
};
