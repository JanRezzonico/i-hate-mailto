import type { DecodedMailto } from './types';

const fallbackCopy = (content: string): boolean => {
  const previouslyFocused = document.activeElement as HTMLElement | null;
  const ta = document.createElement('textarea');
  ta.value = content;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  try {
    ta.select();
    const success = document.execCommand('copy');
    return success;
  } catch {
    return false;
  } finally {
    ta.remove();
    previouslyFocused?.focus?.();
  }
};

const formatCopiedContent = async (d: DecodedMailto): Promise<string> => {
  const mode = await settings.get('copyMode');
  switch (mode) {
    case 'to':
      return d.to.join(', ');

    case 'recipients':
      return [...d.to, ...d.cc, ...d.bcc].join(', ');

    case 'full': {
      const lines: string[] = [];
      if (d.to.length) lines.push(`To: ${d.to.join(', ')}`);
      if (d.cc.length) lines.push(`Cc: ${d.cc.join(', ')}`);
      if (d.bcc.length) lines.push(`Bcc: ${d.bcc.join(', ')}`);
      if (d.subject) lines.push(`Subject: ${d.subject}`);
      for (const [name, value] of Object.entries(d.headers)) {
        lines.push(`${name}: ${value}`);
      }
      if (d.body) lines.push('', d.body);
      return lines.join('\n');
    }
  }
};

type CopyToClipboardResult = boolean;

const copyToClipboard = async (mailto: DecodedMailto): Promise<CopyToClipboardResult> => {
  const content = await formatCopiedContent(mailto);
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    const fallbackSuccess = fallbackCopy(content);
    return fallbackSuccess;
  }
  return true;
};

export default copyToClipboard;
