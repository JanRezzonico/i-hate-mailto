const fallbackCopy = (content: string): boolean => {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const ta = document.createElement("textarea");
  ta.value = content;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(ta);
  try {
    ta.select();
    const success = document.execCommand("copy");
    return success;
  } catch {
    return false;
  } finally {
    ta.remove();
    previouslyFocused?.focus?.();
  }
};

const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    const fallbackSuccess = fallbackCopy(content);
    return fallbackSuccess;
  }
  return true;
};

export default copyToClipboard;
