export const fallbackCopy = (content: string): boolean => {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    previouslyFocused?.focus?.();
  }
};
