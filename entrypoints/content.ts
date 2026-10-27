import copyToClipboard from '@/utils/clipboard/copy-to-clipboard';
import { formatNotCopied } from '@/utils/clipboard/format-not-copied';
import { translateCopyFailedMessage } from '@/utils/clipboard/translate-copy-failed-message';
import { decodeMailto, isMailtoHref } from '@/utils/mailto/parse-mailto';
import { disabledSites, isDomainDisabled } from '@/utils/settings/disabled-sites';
import showToast from '@/utils/toast/show-toast';

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true, // Extend behavior to iframes
  matchAboutBlank: true, // Extend behavior to about:blank and about:srcdoc
  matchOriginAsFallback: true, // Extend behavior to iframes with different origins
  runAt: 'document_start',

  async main() {
    let thisDomainIsDisabled = await isDomainDisabled(location.hostname);
    disabledSites.watch('domains', async () => {
      thisDomainIsDisabled = await isDomainDisabled(location.hostname);
    });

    document.addEventListener(
      'click',
      async (e) => {
        if (thisDomainIsDisabled) return;

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
            const base = i18n.t('copyPartial');
            const notes = formatNotCopied(result.notCopied);
            await showToast(base, notes, 'info');
          } else {
            const notes = '';
            await showToast(i18n.t('copySuccess'), notes, 'success');
          }
        } else {
          const errorCode = result.reason;
          const message = translateCopyFailedMessage(errorCode);
          const title = i18n.t('copyFail');
          await showToast(title, message, 'error');
        }
      },
      true, // Use capture phase to intercept before the page's own handlers
    );
  },
});
