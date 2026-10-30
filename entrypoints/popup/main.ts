import '@/assets/tailwind-daisyui.css';
import { translateCopyMode } from '@/utils/clipboard/translate-copy-mode';
import { $ } from '@/utils/dom/query';
import { localizeDocument } from '@/utils/i18n/localize-document';
import { disabledSites, getValidDomains, isDomainDisabled, normalizeDomain } from '@/utils/settings/disabled-sites';
import { settings } from '@/utils/settings/settings';
import type { Settings } from '@/utils/settings/settings';
import { TOAST_TYPES } from '@/utils/toast/constants';
import { translateToastPosition, translateToastType } from '@/utils/toast/translate';

const page = {
  copyMode: $('#copy-mode'),
  duration: $('#duration'),
  position: $('#position'),
  badges: $('#badges'),
  siteStatus: $('#site-status'),
  siteToggle: $<HTMLButtonElement>('#site-toggle'),
  openOptionsButton: $<HTMLButtonElement>('#open-options-button'),
  siteToggleLabel: $('[data-role="site-toggle-label"]', $('#site-toggle')),
  siteToggleDisabledIcon: $('[data-role="site-toggle-disabled-icon"]', $('#site-toggle')),
  siteToggleEnabledIcon: $('[data-role="site-toggle-enabled-icon"]', $('#site-toggle')),
  mailtoStatus: $('#mailto-status'),
  telStatus: $('#tel-status'),
  smsStatus: $('#sms-status'),
};

let currentDomain: string | null = null;

const translateProtocolStatus = (enabled: boolean): string =>
  `${enabled ? '✓' : '✕'} ${i18n.t(enabled ? 'popupSiteStatusEnabled' : 'popupSiteStatusDisabled')}`;

const renderSiteToggle = async () => {
  if (!currentDomain) {
    page.siteStatus.textContent = '';
    page.siteToggle.disabled = true;
    page.siteToggle.className = 'btn btn-block btn-outline btn-ghost';
    page.siteToggle.setAttribute('aria-pressed', 'false');
    page.siteToggleLabel.textContent = i18n.t('popupSiteUnavailable');
    page.siteToggleDisabledIcon.classList.remove('hidden');
    page.siteToggleEnabledIcon.classList.add('hidden');
    return;
  }

  const disabled = await isDomainDisabled(currentDomain);
  page.siteStatus.textContent = i18n.t(disabled ? 'popupSiteStatusDisabled' : 'popupSiteStatusEnabled');
  page.siteToggle.disabled = false;
  page.siteToggle.className = `btn btn-block btn-outline ${disabled ? 'btn-success' : 'btn-error'}`;
  page.siteToggleLabel.textContent = i18n.t(disabled ? 'popupEnableSiteButton' : 'popupDisableSiteButton', [
    currentDomain,
  ]);
  page.siteToggleDisabledIcon.classList.toggle('hidden', !disabled);
  page.siteToggleEnabledIcon.classList.toggle('hidden', disabled);
};

const render = (values: Settings) => {
  page.mailtoStatus.textContent = translateProtocolStatus(values.mailtoEnabled);
  page.telStatus.textContent = translateProtocolStatus(values.telEnabled);
  page.smsStatus.textContent = translateProtocolStatus(values.smsEnabled);
  page.copyMode.textContent = translateCopyMode(values.copyMode);
  page.duration.textContent = `${values.toastDurationMin}-${values.toastDurationMax} ms`;
  page.position.textContent = translateToastPosition(values.toastPosition);

  page.badges.replaceChildren(
    ...TOAST_TYPES.map((type) => {
      const badge = document.createElement('span');
      badge.className = 'badge badge-sm border-0';
      badge.textContent = translateToastType(type);
      badge.style.backgroundColor = values.toastBackgrounds[type];
      badge.style.color = values.toastColors[type];
      return badge;
    }),
  );
};

// When the "Open Options" button is clicked, open the options page in a new tab
// Canonical way to open the options page
page.openOptionsButton.addEventListener('click', async () => {
  await browser.runtime.openOptionsPage();
  window.close();
});

// When the "Enable/Disable Site" button is clicked, toggle the current domain in the disabled sites list
page.siteToggle.addEventListener('click', async () => {
  if (!currentDomain) return;

  const domains = await getValidDomains();
  const nextDomains = domains.includes(currentDomain)
    ? domains.filter((domain) => domain !== currentDomain)
    : [...domains, currentDomain].sort();
  await disabledSites.set('domains', nextDomains);
  await renderSiteToggle();
});

localizeDocument();
settings.watchAll(render);
settings.getAll().then(render);

// Get the current active tab's domain and render the site toggle button accordingly
// Required because otherwise the popup would not know which site it is on
browser.tabs
  .query({ active: true, currentWindow: true })
  .then(([tab]) => {
    if (!tab?.url) return;
    try {
      const url = new URL(tab.url);
      // Non HTTP/S protocols (e.g. chrome://, about:, file://)
      // are not valid for this purpose, so we ignore them
      const isValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';
      currentDomain = isValidProtocol ? normalizeDomain(url.hostname) : null;
    } catch {
      currentDomain = null;
    }
  })
  .then(renderSiteToggle);
