import type { ToastPosition } from './types';
import tailwindDaisyUiStyles from '@/assets/tailwind-daisyui.css?inline';

export const TOAST_STYLES = tailwindDaisyUiStyles;

export const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-right': 'toast-top toast-end',
  'top-left': 'toast-top toast-start',
  'bottom-right': 'toast-bottom toast-end',
  'bottom-left': 'toast-bottom toast-start',
};
