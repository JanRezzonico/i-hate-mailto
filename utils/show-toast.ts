import type { ToastPosition, ToastType } from '@/utils/types';
import { settings } from '.';

const ICONS: Record<ToastType, string> = {
  success: '✓',
  info: 'i',
  error: '✕',
};

const EDGE_OFFSET = '24px';

const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': `top:${EDGE_OFFSET}; right:${EDGE_OFFSET};`,
  'top-left': `top:${EDGE_OFFSET}; left:${EDGE_OFFSET};`,
  'bottom-right': `bottom:${EDGE_OFFSET}; right:${EDGE_OFFSET};`,
  'bottom-left': `bottom:${EDGE_OFFSET}; left:${EDGE_OFFSET};`,
};

const ANIMATION_MS = 200;
const SLIDE_DISTANCE = 16;

const STYLES = `
  .toast {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 380px;
    padding: 14px 20px;
    border-radius: 10px;
    background: var(--toast-bg);
    color: var(--toast-color);
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

type ToastSettings = Awaited<ReturnType<typeof settings.getAll>>;

/** Slide in from the screen edge the toast is anchored to. */
const slideKeyframes = (visible: boolean, position: ToastPosition): Keyframe[] => {
  const offset = position.startsWith('top') ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
  const hidden = { opacity: 0, transform: `translateY(${offset}px)` };
  const shown = { opacity: 1, transform: 'translateY(0)' };
  return visible ? [hidden, shown] : [shown, hidden];
};

const createTextElement = (className: string, text: string) => {
  const el = document.createElement('span');
  el.className = className;
  el.textContent = text;
  return el;
};

const createToastElement = (message: string, type: ToastType, config: ToastSettings) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.role = 'status';
  toast.style.setProperty('--toast-color', config.toastColors[type]);
  toast.style.setProperty('--toast-bg', config.toastBackgrounds[type]);

  const content = document.createElement('div');
  content.className = 'content';
  content.append(createTextElement('header', config.extensionName), createTextElement('message', message));

  toast.append(createTextElement('icon', ICONS[type]), content);
  return toast;
};

const showToast = async (message: string, type: ToastType = 'info', duration: number = 2000) => {
  const config = await settings.getAll();
  if (!config.toastEnabled) return;

  // Shadow DOM to avoid style conflicts with the page's own styles
  const root = document.createElement('div');
  root.style.cssText = `position:fixed; ${POSITION_STYLES[config.toastPosition]} z-index:2147483647;`;

  const shadow = root.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = STYLES;

  const toast = createToastElement(message, type, config);
  shadow.append(style, toast);
  document.documentElement.appendChild(root);

  const animationOptions = { duration: ANIMATION_MS, easing: 'ease-out' };
  toast.animate(slideKeyframes(true, config.toastPosition), animationOptions);

  setTimeout(() => {
    const exit = toast.animate(slideKeyframes(false, config.toastPosition), {
      ...animationOptions,
      fill: 'forwards',
    });
    exit.onfinish = () => root.remove();
  }, duration);
};

export default showToast;
