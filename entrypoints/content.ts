import copyToClipboard from '@/utils/clipboard/copy-to-clipboard';
import { formatNotCopied } from '@/utils/clipboard/format-not-copied';
import { translateCopyFailedMessage } from '@/utils/clipboard/translate-copy-failed-message';
import { getLinkHandler } from '@/utils/links/handlers';
import type { LinkHandler, LinkType } from '@/utils/links/types';
import { disabledSites, isDomainDisabled } from '@/utils/settings/disabled-sites';
import { settings } from '@/utils/settings/settings';
import type { Settings } from '@/utils/settings/settings';
import showToast from '@/utils/toast/show-toast';

const isHandlerEnabled = (handler: LinkHandler, values: Settings): boolean => {
  //TODO: pretty frail, later change to a more robust approach
  return values[`${handler.type}Enabled` as keyof Settings] as boolean;
};

const LINK_TYPE_LABEL_KEYS: Record<LinkType, 'linkTypeEmailAddress' | 'linkTypePhoneNumber' | 'linkTypeSms'> = {
  mailto: 'linkTypeEmailAddress',
  tel: 'linkTypePhoneNumber',
  sms: 'linkTypeSms',
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
          .find(
            (n): n is HTMLAnchorElement =>
              n instanceof HTMLAnchorElement &&
              getLinkHandler(n.getAttribute('href') ?? '', (handler) => isHandlerEnabled(handler, currentSettings)) !==
                undefined,
          );
        if (!link) return;

        const hrefValue = link.getAttribute('href') ?? '';
        const handler = getLinkHandler(hrefValue, (candidate) => isHandlerEnabled(candidate, currentSettings));
        if (!handler) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const decoded = handler.decode(hrefValue);

        const result = await copyToClipboard(decoded);
        if (result.success) {
          const copiedLabel = i18n.t(LINK_TYPE_LABEL_KEYS[handler.type]);
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
