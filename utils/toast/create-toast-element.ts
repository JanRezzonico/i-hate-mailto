import { i18n } from '#imports';
import type { Settings } from '@/utils/settings/settings';
import { TOAST_ICONS } from './constants';
import type { ToastType } from './types';

const createTextElement = (className: string, text: string): HTMLSpanElement => {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
};

export const createToastElement = (message: string, type: ToastType, config: Settings): HTMLDivElement => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.style.setProperty('--toast-color', config.toastColors[type]);
  toast.style.setProperty('--toast-bg', config.toastBackgrounds[type]);

  const content = document.createElement('div');
  content.className = 'content';
  content.append(createTextElement('header', i18n.t('extNameLong')), createTextElement('message', message));

  toast.append(createTextElement('icon', TOAST_ICONS[type]), content);
  return toast;
};
