import type { ToastPosition } from './types';

export const ANIMATION_OPTIONS: KeyframeAnimationOptions = { duration: 200, easing: 'ease-out' };
const SLIDE_DISTANCE = 16;

/** Slide in from the screen edge the toast is anchored to (and back out again). */
export const slideKeyframes = (visible: boolean, position: ToastPosition): Keyframe[] => {
  const offset = position.startsWith('top') ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
  const hidden = { opacity: 0, transform: `translateY(${offset}px)` };
  const shown = { opacity: 1, transform: 'translateY(0)' };
  return visible ? [hidden, shown] : [shown, hidden];
};
