import { i18n } from '#imports';
import type { CopyMode } from './types';

const DESCRIPTIONS = {
  to: 'copyModeToDescription',
  recipients: 'copyModeRecipientsDescription',
  full: 'copyModeFullDescription',
} as const satisfies Record<CopyMode, string>;

export const translateCopyModeDescription = (mode: CopyMode): string => {
  const key = DESCRIPTIONS[mode];
  return key ? i18n.t(key) : mode;
};
