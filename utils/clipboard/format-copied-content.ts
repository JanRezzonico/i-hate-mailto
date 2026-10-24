import type { DecodedMailto } from '@/utils/mailto/types';
import { DEFAULT_COPY_MODE } from './constants';
import { collectNotCopied } from './not-copied';
import type { CopyMode, FormattedContent } from './types';

const formatFull = (d: DecodedMailto): string => {
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
};

const FORMATTERS: Record<CopyMode, (d: DecodedMailto) => FormattedContent> = {
  to: (d) => ({
    content: d.to.join(', '),
    notCopied: collectNotCopied(d, ['cc', 'bcc', 'subject', 'headers', 'body']),
  }),
  recipients: (d) => ({
    content: [...d.to, ...d.cc, ...d.bcc].join(', '),
    notCopied: collectNotCopied(d, ['subject', 'headers', 'body']),
  }),
  full: (d) => ({
    content: formatFull(d),
    notCopied: null,
  }),
};

export const formatCopiedContent = (mailto: DecodedMailto, mode: CopyMode): FormattedContent => {
  const format = FORMATTERS[mode] ?? FORMATTERS[DEFAULT_COPY_MODE];
  return format(mailto);
};
