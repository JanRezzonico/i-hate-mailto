import { i18n } from '#imports';
import type { ToastPosition, ToastType } from './types';

const TYPE_LABEL_KEYS = {
  success: 'toastTypeSuccess',
  info: 'toastTypeInfo',
  error: 'toastTypeError',
} as const satisfies Record<ToastType, string>;

const POSITION_LABEL_KEYS = {
  'top-right': 'positionTopRight',
  'top-left': 'positionTopLeft',
  'bottom-right': 'positionBottomRight',
  'bottom-left': 'positionBottomLeft',
} as const satisfies Record<ToastPosition, string>;

export const translateToastType = (type: ToastType): string => {
  const key = TYPE_LABEL_KEYS[type];
  return key ? i18n.t(key) : type;
};

export const translateToastPosition = (position: ToastPosition): string => {
  const key = POSITION_LABEL_KEYS[position];
  return key ? i18n.t(key) : position;
};
