import { fallbackCopy } from './fallback-copy';

/** Writes text to the clipboard, falling back to the legacy method. Returns whether it succeeded. */
export const writeToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return fallbackCopy(content);
  }
};
