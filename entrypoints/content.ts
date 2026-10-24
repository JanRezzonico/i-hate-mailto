import copyToClipboard from '@/utils/copy-to-clipboard';
import { decodeMailto, isMailtoHref } from '@/utils/parse-mailto';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',

  main() {
    document.addEventListener(
      'click',
      async (e) => {
        const target = e.target as Element | null;
        const mailtoLink = target?.closest<HTMLAnchorElement>('a[href^="mailto:" i]');
        if (!mailtoLink) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const hrefValue = mailtoLink.getAttribute('href') ?? '';
        if (!isMailtoHref(hrefValue)) return;

        const decoded = decodeMailto(hrefValue);

        const copySuccess = await copyToClipboard(decoded);
        if (copySuccess) {
          await showToast(i18n.t('copySuccess'), 'success');
        } else {
          await showToast(i18n.t('copyFail'), 'error');
        }
      },
      true, // Use capture phase to intercept before the page's own handlers
    );
  },
});
