import { DEFAULT_COPY_MODE } from '@/utils/clipboard/constants';
import {
  DEFAULT_TOAST_BACKGROUNDS,
  DEFAULT_TOAST_COLORS,
  DEFAULT_TOAST_DURATION,
  DEFAULT_TOAST_POSITION,
} from '@/utils/toast/constants';
import { defineSettings } from './define-settings';

export const settings = defineSettings({
  toastBackgrounds: DEFAULT_TOAST_BACKGROUNDS,
  toastColors: DEFAULT_TOAST_COLORS,
  toastDuration: DEFAULT_TOAST_DURATION,
  toastPosition: DEFAULT_TOAST_POSITION,

  copyMode: DEFAULT_COPY_MODE,
});

export type Settings = typeof settings.defaults;
export type SettingsKey = keyof Settings;
