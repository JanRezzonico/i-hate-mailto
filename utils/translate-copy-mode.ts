export const translateCopyMode = (mode: CopyMode) => {
  switch (mode) {
    case 'to':
      return i18n.t('copyModeTo');
    case 'recipients':
      return i18n.t('copyModeRecipients');
    case 'full':
      return i18n.t('copyModeFull');
    default:
      return mode;
  }
};
