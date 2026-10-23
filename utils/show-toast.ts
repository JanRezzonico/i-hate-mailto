import type { ToastType } from '@/utils/types';

// TODO: Move to some config file or manifest, probably needed in multiple places
const EXTENSION_NAME = 'I Hate Mailto by rezzonico.dev';

const COLORS: Record<ToastType, string> = {
  success: '#16a34a',
  info: '#2563eb',
  error: '#dc2626',
};

const ICONS: Record<ToastType, string> = {
  success: '✓',
  info: 'i',
  error: '✕',
};

const ANIMATION_MS = 200;
const SLIDE_OFFSET = '16px';

const STYLES = `
  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 380px;
    padding: 14px 20px;
    border-radius: 10px;
    background: var(--color);
    color: #fff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  .icon {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    font: 700 14px system-ui, sans-serif;
  }
  .content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .header {
    font: 600 10px/1 system-ui, sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.7;
  }
  .message {
    font: 500 15px/1.4 system-ui, sans-serif;
  }
`;

const slideKeyframes = (visible: boolean): Keyframe[] => {
  const hidden = { opacity: 0, transform: `translateY(${SLIDE_OFFSET})` };
  const shown = { opacity: 1, transform: 'translateY(0)' };
  return visible ? [hidden, shown] : [shown, hidden];
};

const createTextElement = (className: string, text: string) => {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
};

const createToastElement = (message: string, type: ToastType) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.role = 'status';
  toast.style.setProperty('--color', COLORS[type]);

  const content = document.createElement('div');
  content.className = 'content';
  content.append(createTextElement('header', EXTENSION_NAME), createTextElement('message', message));

  toast.append(createTextElement('icon', ICONS[type]), content);
  return toast;
};

const showToast = (message: string, type: ToastType = 'info', duration: number = 2000) => {
  // Shadow DOM to avoid style conflicts with the page's own styles
  const root = document.createElement('div');
  root.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:2147483647;';

  const shadow = root.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = STYLES;

  const toast = createToastElement(message, type);
  shadow.append(style, toast);
  document.documentElement.appendChild(root);

  const animationOptions = { duration: ANIMATION_MS, easing: 'ease-out' };
  toast.animate(slideKeyframes(true), animationOptions);

  setTimeout(() => {
    const exit = toast.animate(slideKeyframes(false), {
      ...animationOptions,
      fill: 'forwards',
    });
    exit.onfinish = () => root.remove();
  }, duration);
};

export default showToast;
