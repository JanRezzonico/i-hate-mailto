import type { ToastBackgrounds, ToastColors, ToastDuration, ToastPosition, ToastType } from './types';

export const TOAST_TYPES: ToastType[] = ['success', 'info', 'error'];

export const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  info: 'i',
  error: '✕',
};

export const DEFAULT_TOAST_COLORS: ToastColors = {
  success: '#ffffff',
  info: '#ffffff',
  error: '#ffffff',
};

export const DEFAULT_TOAST_BACKGROUNDS: ToastBackgrounds = {
  success: '#16a34a',
  info: '#2563eb',
  error: '#dc2626',
};

export const DEFAULT_TOAST_DURATION_MIN: ToastDuration = 2000;
export const DEFAULT_TOAST_DURATION_MAX: ToastDuration = 10000;
export const TOAST_DURATION_MIN: ToastDuration = 500;
export const TOAST_DURATION_MAX: ToastDuration = 30000;

export const TOAST_POSITIONS: ToastPosition[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
export const DEFAULT_TOAST_POSITION: ToastPosition = 'bottom-right';
