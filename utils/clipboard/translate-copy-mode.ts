import { i18n } from '#imports';
import type { CopyMode } from './types';

const LABEL_KEYS = {
  to: 'copyModeTo',
  recipients: 'copyModeRecipients',
  full: 'copyModeFull',
} as const satisfies Record<CopyMode, string>;

export const translateCopyMode = (mode: CopyMode): string => {
  const key = LABEL_KEYS[mode];
  return key ? i18n.t(key) : mode;
};
