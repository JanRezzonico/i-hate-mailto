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

    const copyLink = async (href: string) => {
      const handler = getLinkHandler(href, (candidate) => isHandlerEnabled(candidate, currentSettings));

      // No handler means that the link type is not supported,
      // so we just copy the full URL to the clipboard and show a toast informing the user
      if (!handler) {
        const result = await copyToClipboard(href, currentSettings.copyMode);
        if (result.success) {
          showToast(i18n.t('linkNotSupported'), i18n.t('linkNotSupportedDescription'), 'info');
        } else {
          const message = translateCopyFailedMessage(result.reason);
          await showToast(i18n.t('copyFail'), message, 'error');
        }

        return;
      }

      const decoded = handler.decode(href);
      const result = await copyToClipboard(decoded, currentSettings.copyMode);
      if (result.success) {
        const copiedLabel = i18n.t(LINK_TYPE_TO_LABEL_I18N_KEY_MAP[handler.type]);
        if (result.notCopied) {
          const base = `${i18n.t('copySuccess', [copiedLabel])}. ${i18n.t('copyPartial')}`;
          const notes = formatNotCopied(result.notCopied);
          await showToast(base, notes, 'info');
        } else {
          await showToast(i18n.t('copySuccess', [copiedLabel]), '', 'success');
        }
      } else {
        const message = translateCopyFailedMessage(result.reason);
        await showToast(i18n.t('copyFail'), message, 'error');
      }
    };

    const onClick = async (e: MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return; // left and middle click only
      if (thisDomainIsDisabled) return;

      const link = e.composedPath().find((n): n is HTMLAnchorElement => {
        if (!(n instanceof HTMLAnchorElement)) return false;
        const href = n.getAttribute('href') ?? '';
        return getLinkHandler(href, (c) => isHandlerEnabled(c, currentSettings)) !== undefined;
      });
      if (!link) return;

      e.preventDefault();
      e.stopImmediatePropagation();

      await copyLink(link.getAttribute('href') ?? '');
    };

    const capturePhase = true;
    document.addEventListener('click', onClick, capturePhase); // left click
    document.addEventListener('auxclick', onClick, capturePhase); // middle click

    // Context menu path (for right click)
    browser.runtime.onMessage.addListener((msg) => {
      if (msg?.type !== 'copy-link' || typeof msg.href !== 'string') return;
      if (thisDomainIsDisabled) return;
      void copyLink(msg.href);
    });
  },
});
