import { i18n } from '#imports';
import type { CopyMode, CopyToClipboardFailReason } from './types';

const LABEL_KEYS = {
  NO_RECIPIENTS: 'errorCopyFailedNoRecipients',
  WRITE_TO_CLIPBOARD_FAILED: 'errorCopyFailedWriteToClipboard',
} as const satisfies Record<CopyToClipboardFailReason, string>;

export const translateCopyFailedMessage = (reason: CopyToClipboardFailReason): string => {
  const key = LABEL_KEYS[reason];
  return key ? i18n.t(key) : reason;
};
