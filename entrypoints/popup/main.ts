import '@/assets/tailwind-daisyui.css';
import { translateCopyMode } from '@/utils/clipboard/translate-copy-mode';
import { $ } from '@/utils/dom/query';
import { localizeDocument } from '@/utils/i18n/localize-document';
import { settings } from '@/utils/settings/settings';
import type { Settings } from '@/utils/settings/settings';
import { TOAST_TYPES } from '@/utils/toast/constants';
import { translateToastPosition, translateToastType } from '@/utils/toast/translate';

const page = {
  copyMode: $('#copy-mode'),
  duration: $('#duration'),
  position: $('#position'),
  badges: $('#badges'),
  openOptionsButton: $<HTMLButtonElement>('#open-options-button'),
};

const render = (values: Settings) => {
  page.copyMode.textContent = translateCopyMode(values.copyMode);
  page.duration.textContent = `${values.toastDuration} ms`;
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

page.openOptionsButton.addEventListener('click', async () => {
  await browser.runtime.openOptionsPage();
  window.close();
});

localizeDocument();
settings.watchAll(render);
settings.getAll().then(render);
