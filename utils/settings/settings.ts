import { DEFAULT_COPY_MODE } from '@/utils/clipboard/constants';
import {
  DEFAULT_TOAST_BACKGROUNDS,
  DEFAULT_TOAST_COLORS,
  DEFAULT_TOAST_DURATION_MAX,
  DEFAULT_TOAST_DURATION_MIN,
  DEFAULT_TOAST_POSITION,
} from '@/utils/toast/constants';
import { defineSettings } from './define-settings';
import type { LinkType } from '../links/types';

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

type LinkEnabledSetting = 'mailtoEnabled' | 'telEnabled' | 'smsEnabled';

export const LINK_TYPE_TO_ENABLED_SETTING_MAP: Record<LinkType, LinkEnabledSetting> = {
  mailto: 'mailtoEnabled',
  tel: 'telEnabled',
  sms: 'smsEnabled',
};

type LinkLabelI18nKey = 'linkTypeEmailAddress' | 'linkTypePhoneNumber' | 'linkTypeSms';
export const LINK_TYPE_TO_LABEL_I18N_KEY_MAP: Record<LinkType, LinkLabelI18nKey> = {
  mailto: 'linkTypeEmailAddress',
  tel: 'linkTypePhoneNumber',
  sms: 'linkTypeSms',
};
