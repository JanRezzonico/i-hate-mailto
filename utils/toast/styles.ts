import type { ToastPosition } from './types';

const EDGE_OFFSET = '24px';

export const POSITION_STYLES: Record<ToastPosition, string> = {
  'top-right': `top:${EDGE_OFFSET}; right:${EDGE_OFFSET};`,
  'top-left': `top:${EDGE_OFFSET}; left:${EDGE_OFFSET};`,
  'bottom-right': `bottom:${EDGE_OFFSET}; right:${EDGE_OFFSET};`,
  'bottom-left': `bottom:${EDGE_OFFSET}; left:${EDGE_OFFSET};`,
};

export const TOAST_STYLES = `
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
    white-space: pre-wrap;
  }
`;
