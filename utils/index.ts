import { defineSettings } from './settings';
import type { ToastColors, ToastBackgrounds, ToastPosition } from './types';

export const settings = defineSettings({
  extensionName: 'I Hate Mailto by rezzonico.dev',

  toastBackgrounds: {
    success: '#16a34a',
    info: '#2563eb',
    error: '#dc2626',
  } as ToastBackgrounds,

  toastColors: {
    success: '#ffffff',
    info: '#ffffff',
    error: '#ffffff',
  } as ToastColors,

  toastEnabled: true,

  toastPosition: 'bottom-right' as ToastPosition,
});
