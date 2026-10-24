export const translateToastPosition = (position: ToastPosition) => {
  switch (position) {
    case 'top-right':
      return i18n.t('positionTopRight');
    case 'top-left':
      return i18n.t('positionTopLeft');
    case 'bottom-right':
      return i18n.t('positionBottomRight');
    case 'bottom-left':
      return i18n.t('positionBottomLeft');
    default:
      return position; // Fallback to the raw value if not recognized
  }
};
