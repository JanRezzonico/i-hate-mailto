export const translateToastType = (type: ToastType) => {
  switch (type) {
    case 'success':
      return i18n.t('toastTypeSuccess');
    case 'info':
      return i18n.t('toastTypeInfo');
    case 'error':
      return i18n.t('toastTypeError');
    default:
      return type; // Fallback to english if there is any issue
  }
};
