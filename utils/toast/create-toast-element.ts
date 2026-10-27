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

export const createToastElement = (
  message: string,
  notes: string,
  type: ToastType,
  config: Settings,
): HTMLDivElement => {
  const toast = document.createElement('div');
  toast.className =
    'flex w-[300px] cursor-pointer items-center gap-2 rounded-sm border-0 bg-[var(--toast-bg)] px-4 py-4 text-[var(--toast-color)] shadow-sm';
  toast.setAttribute('role', 'status');
  toast.style.setProperty('--toast-color', config.toastColors[type]);
  toast.style.setProperty('--toast-bg', config.toastBackgrounds[type]);

  const content = document.createElement('div');
  content.className = 'flex flex-col gap-1';
  content.append(
    createTextElement('text-[10px] font-semibold uppercase opacity-70', i18n.t('extNameLong')),
    createTextElement('whitespace-pre-wrap text-[14px] font-medium', message),
    createTextElement('whitespace-pre-wrap text-[12px] opacity-70', notes),
  );

  toast.append(
    createTextElement(
      'flex items-center justify-center h-6 w-6 shrink-0 place-items-center rounded-full bg-white/25 text-sm font-bold',
      TOAST_ICONS[type],
    ),
    content,
  );
  return toast;
};
