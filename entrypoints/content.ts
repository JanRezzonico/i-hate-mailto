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
        if (!mailtoLink) return; // Not a mailto link, ignore

        e.preventDefault();
        e.stopImmediatePropagation();

        const hrefValue = mailtoLink.getAttribute('href') ?? '';
        if (!isMailtoHref(hrefValue)) return; // Not a mailto link, ignore

        const decoded = decodeMailto(hrefValue);

        // TODO: handle other fields

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
