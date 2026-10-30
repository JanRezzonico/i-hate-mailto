import { DEFAULT_COPY_MODE } from '@/utils/clipboard/constants';
import {
  DEFAULT_TOAST_BACKGROUNDS,
  DEFAULT_TOAST_COLORS,
  DEFAULT_TOAST_DURATION_MAX,
  DEFAULT_TOAST_DURATION_MIN,
  DEFAULT_TOAST_POSITION,
} from '@/utils/toast/constants';
import { defineSettings } from './define-settings';

export const settings = defineSettings({
  mailtoEnabled: true,
  telEnabled: false,
  smsEnabled: false,

  toastBackgrounds: DEFAULT_TOAST_BACKGROUNDS,
  toastColors: DEFAULT_TOAST_COLORS,
  toastDurationMin: DEFAULT_TOAST_DURATION_MIN,
  toastDurationMax: DEFAULT_TOAST_DURATION_MAX,
  toastPosition: DEFAULT_TOAST_POSITION,

  copyMode: DEFAULT_COPY_MODE,
});

export type Settings = typeof settings.defaults;
export type SettingsKey = keyof Settings;
