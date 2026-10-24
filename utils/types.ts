export type ToastType = 'success' | 'info' | 'error';
export const TOAST_TYPES: ToastType[] = ['success', 'info', 'error'];

export type ToastColors = Record<ToastType, string>;
export const DEFAULT_TOAST_COLORS: ToastColors = {
  success: '#ffffff',
  info: '#ffffff',
  error: '#ffffff',
};

export type ToastBackgrounds = Record<ToastType, string>;
export const DEFAULT_TOAST_BACKGROUNDS: ToastBackgrounds = {
  success: '#16a34a',
  info: '#2563eb',
  error: '#dc2626',
};

export type ToastDuration = number;
export const DEFAULT_TOAST_DURATION: ToastDuration = 2000;
export const DURATION_MIN: ToastDuration = 500;
export const DURATION_MAX: ToastDuration = 10000;

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export const TOAST_POSITIONS: ToastPosition[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
export const DEFAULT_TOAST_POSITION: ToastPosition = 'bottom-right';

export type ToastEnabled = boolean;
export const DEFAULT_TOAST_ENABLED: ToastEnabled = true;

export type CopyMode = 'to' | 'recipients' | 'full';
export const COPY_MODES: CopyMode[] = ['to', 'recipients', 'full'];
export const DEFAULT_COPY_MODE: CopyMode = 'to';

export interface DecodedMailto {
  to: string[];
  cc: string[];
  bcc: string[];
  subject?: string;
  body?: string;
  /** Any other headers (in-reply-to, references, ...), lowercased names. */
  headers: Record<string, string>;
}
