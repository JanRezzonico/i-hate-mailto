import copyToClipboard from '@/utils/clipboard/copy-to-clipboard';
import { formatNotCopied } from '@/utils/clipboard/format-not-copied';
import { translateCopyFailedMessage } from '@/utils/clipboard/translate-copy-failed-message';
import { getLinkHandler } from '@/utils/links/handlers';
import type { LinkHandler } from '@/utils/links/types';
import { disabledSites, isDomainDisabled } from '@/utils/settings/disabled-sites';
import { LINK_TYPE_TO_ENABLED_SETTING_MAP, LINK_TYPE_TO_LABEL_I18N_KEY_MAP, settings } from '@/utils/settings/settings';
import type { Settings } from '@/utils/settings/settings';
import showToast from '@/utils/toast/show-toast';

const isHandlerEnabled = (handler: LinkHandler, values: Settings): boolean => {
  return values[LINK_TYPE_TO_ENABLED_SETTING_MAP[handler.type]];
};

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true, // Extend behavior to iframes
  matchAboutBlank: true, // Extend behavior to about:blank and about:srcdoc
  matchOriginAsFallback: true, // Extend behavior to iframes with different origins
  runAt: 'document_start',

  async main() {
    let thisDomainIsDisabled = await isDomainDisabled(location.hostname);
    let currentSettings = await settings.getAll();
    disabledSites.watch('domains', async () => {
      thisDomainIsDisabled = await isDomainDisabled(location.hostname);
    });
    settings.watchAll((values) => {
      currentSettings = values;
    });

    document.addEventListener(
      'click',
      async (e) => {
        if (thisDomainIsDisabled) return;

        const link = e
          .composedPath() // Also includes shadow DOM elements
          .find((n): n is HTMLAnchorElement => {
            const isAnchor = n instanceof HTMLAnchorElement;
            if (!isAnchor) return false;
            const href = n.getAttribute('href') ?? '';
            const handler = getLinkHandler(href, (candidate) => isHandlerEnabled(candidate, currentSettings));
            return handler !== undefined;
          });
        if (!link) return;

        const hrefValue = link.getAttribute('href') ?? '';
        const handler = getLinkHandler(hrefValue, (candidate) => isHandlerEnabled(candidate, currentSettings));
        if (!handler) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const decoded = handler.decode(hrefValue);

        const result = await copyToClipboard(decoded, currentSettings.copyMode);
        if (result.success) {
          const copiedLabel = i18n.t(LINK_TYPE_TO_LABEL_I18N_KEY_MAP[handler.type]);
          if (result.notCopied) {
            const base = `${i18n.t('copySuccess', [copiedLabel])}. ${i18n.t('copyPartial')}`;
            const notes = formatNotCopied(result.notCopied);
            await showToast(base, notes, 'info');
          } else {
            const notes = '';
            await showToast(i18n.t('copySuccess', [copiedLabel]), notes, 'success');
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
