import copyToClipboard from '@/utils/copy-to-clipboard';
import { decodeMailto, isMailtoHref } from '@/utils/parse-mailto';

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true, // Extend behavior to iframes
  matchAboutBlank: true, // Extend behavior to about:blank and about:srcdoc
  matchOriginAsFallback: true, // Extend behavior to iframes with different origins
  runAt: 'document_start',

  main() {
    document.addEventListener(
      'click',
      async (e) => {
        const mailtoLink = e
          .composedPath() // Also includes shadow DOM elements
          .find(
            (n): n is HTMLAnchorElement =>
              n instanceof HTMLAnchorElement && /^\s*mailto:/i.test(n.getAttribute('href') ?? ''),
          );
        if (!mailtoLink) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const hrefValue = mailtoLink.getAttribute('href') ?? '';
        if (!isMailtoHref(hrefValue)) return;

        const decoded = decodeMailto(hrefValue);

        const result = await copyToClipboard(decoded);
        if (result.success) {
          if (result.notCopied) {
            const message = i18n.t('copyPartial', [formatNotCopied(result.notCopied)]);
            const base = await settings.get('toastDuration');
            await showToast(message, 'info', computeInfoToastDuration(base, message));
          } else {
            await showToast(i18n.t('copySuccess'), 'success');
          }
        } else {
          await showToast(i18n.t('copyFail'), 'error');
        }
      },
      true, // Use capture phase to intercept before the page's own handlers
    );
  },
});
