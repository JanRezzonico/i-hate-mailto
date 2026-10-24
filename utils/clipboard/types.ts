import type { DecodedMailto } from '@/utils/mailto/types';

export type CopyMode = 'to' | 'recipients' | 'full';

/** Mailto fields that were left out of the clipboard because of the active copy mode. */
export type NotCopiedInfo = Partial<Pick<DecodedMailto, 'to' | 'cc' | 'bcc' | 'subject' | 'headers' | 'body'>>;
export type NotCopiedKey = keyof NotCopiedInfo;

export type FormattedContent = {
  content: string;
  notCopied: NotCopiedInfo | null;
};

export type CopyToClipboardResult = { success: false } | { success: true; notCopied: NotCopiedInfo | null };
