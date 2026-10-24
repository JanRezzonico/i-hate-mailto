import { settings } from '@/utils/settings/settings';
import { ANIMATION_OPTIONS, slideKeyframes } from './animation';
import { createToastElement } from './create-toast-element';
import { POSITION_STYLES, TOAST_STYLES } from './styles';
import type { ToastType } from './types';

const showToast = async (message: string, type: ToastType = 'info', duration?: number) => {
  const config = await settings.getAll();

  // Shadow DOM to avoid style conflicts with the page's own styles
  const root = document.createElement('div');
  root.style.cssText = `position:fixed; ${POSITION_STYLES[config.toastPosition]} z-index:2147483647;`;

  const shadow = root.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = TOAST_STYLES;

  const toast = createToastElement(message, type, config);
  shadow.append(style, toast);
  document.documentElement.appendChild(root);

  toast.animate(slideKeyframes(true, config.toastPosition), ANIMATION_OPTIONS);

  setTimeout(() => {
    const exit = toast.animate(slideKeyframes(false, config.toastPosition), {
      ...ANIMATION_OPTIONS,
      fill: 'forwards',
    });
    exit.onfinish = () => root.remove();
  }, duration ?? config.toastDuration);
};

export default showToast;
