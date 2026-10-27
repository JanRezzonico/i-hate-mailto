import { settings } from '@/utils/settings/settings';
import { ANIMATION_OPTIONS, slideKeyframes } from './animation';
import { createToastElement } from './create-toast-element';
import { POSITION_CLASSES, TOAST_STYLES } from './styles';
import type { ToastPosition, ToastType } from './types';

type ToastContainer = {
  host: HTMLDivElement;
  element: HTMLDivElement;
};

const containers = new Map<ToastPosition, ToastContainer>();
const MAX_Z_INDEX = 2147483647;

const getToastContainer = (position: ToastPosition): ToastContainer => {
  const existing = containers.get(position);
  if (existing) return existing;

  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = TOAST_STYLES;
  const element = document.createElement('div');
  element.className = `toast ${POSITION_CLASSES[position]} z-[${MAX_Z_INDEX}] gap-2`;
  shadow.append(style, element);
  document.documentElement.appendChild(host);

  const container = { host, element };
  containers.set(position, container);
  return container;
};

const showToast = async (message: string, notes: string, type: ToastType = 'info', duration?: number) => {
  const config = await settings.getAll();
  const position = config.toastPosition;
  const container = getToastContainer(position);
  const toast = createToastElement(message, notes, type, config);
  container.element.appendChild(toast);

  let remaining = duration ?? config.toastDuration;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startedAt = Date.now();
  let dismissed = false;

  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    if (timer) clearTimeout(timer);
    toast.removeEventListener('mouseenter', pause);
    toast.removeEventListener('mouseleave', resume);
    const exit = toast.animate(slideKeyframes(false, position), {
      ...ANIMATION_OPTIONS,
      fill: 'forwards',
    });
    exit.onfinish = () => {
      toast.remove();
      if (!container.element.childElementCount) {
        container.host.remove();
        containers.delete(position);
      }
    };
  };

  const pause = () => {
    if (dismissed || !timer) return;
    clearTimeout(timer);
    timer = undefined;
    remaining -= Date.now() - startedAt;
  };

  const resume = () => {
    if (dismissed || timer) return;
    if (remaining <= 0) {
      dismiss();
      return;
    }
    startedAt = Date.now();
    timer = setTimeout(dismiss, remaining);
  };

  toast.addEventListener('click', dismiss);
  toast.addEventListener('mouseenter', pause);
  toast.addEventListener('mouseleave', resume);
  toast.animate(slideKeyframes(true, position), ANIMATION_OPTIONS);
  resume();
};

export default showToast;
