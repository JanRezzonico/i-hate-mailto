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

export type NotCopiedInfo = Partial<Pick<DecodedMailto, 'to' | 'cc' | 'bcc' | 'subject' | 'headers' | 'body'>>;

type FormattedContent = {
  content: string;
  notCopied: NotCopiedInfo | null;
};

const collectNotCopied = (d: DecodedMailto, keys: (keyof NotCopiedInfo)[]): NotCopiedInfo | null => {
  const result: NotCopiedInfo = {};
  for (const key of keys) {
    const value = d[key];
    const isEmpty = Array.isArray(value)
      ? value.length === 0
      : typeof value === 'object' && value !== null
        ? Object.keys(value).length === 0
        : !value;
    if (!isEmpty) (result as Record<string, unknown>)[key] = value;
  }
  return Object.keys(result).length ? result : null;
};

const formatCopiedContent = async (d: DecodedMailto): Promise<FormattedContent> => {
  const mode = await settings.get('copyMode');
  switch (mode) {
    case 'to':
      return {
        content: d.to.join(', '),
        notCopied: collectNotCopied(d, ['cc', 'bcc', 'subject', 'headers', 'body']),
      };

    case 'recipients':
      return {
        content: [...d.to, ...d.cc, ...d.bcc].join(', '),
        notCopied: collectNotCopied(d, ['subject', 'headers', 'body']),
      };

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
      return { content: lines.join('\n'), notCopied: null };
    }
  }
};

export type CopyToClipboardResult = { success: false } | { success: true; notCopied: NotCopiedInfo | null };

const copyToClipboard = async (mailto: DecodedMailto): Promise<CopyToClipboardResult> => {
  const { content, notCopied } = await formatCopiedContent(mailto);
  try {
    await navigator.clipboard.writeText(content);
  } catch {
    if (!fallbackCopy(content)) return { success: false };
  }
  return { success: true, notCopied };
};

export default copyToClipboard;
