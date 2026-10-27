import type { DecodedMailto } from '@/utils/mailto/types';

export type CopyMode = 'to' | 'recipients' | 'full';

/** Mailto fields that were left out of the clipboard because of the active copy mode. */
export type NotCopiedInfo = Partial<Pick<DecodedMailto, 'to' | 'cc' | 'bcc' | 'subject' | 'headers' | 'body'>>;
export type NotCopiedKey = keyof NotCopiedInfo;

export type FormattedContent = {
  content: string;
  notCopied: NotCopiedInfo | null;
};

export type CopyToClipboardFailReason = 'NO_RECIPIENTS' | 'WRITE_TO_CLIPBOARD_FAILED';

export type CopyToClipboardResult =
  { success: false; reason: CopyToClipboardFailReason } | { success: true; notCopied: NotCopiedInfo | null };
