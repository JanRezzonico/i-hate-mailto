import '@/assets/tailwind-daisyui.css';
import { translateToastType } from '@/utils/translate-toast-type';

type Values = Awaited<ReturnType<typeof settings.getAll>>;

function $<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

const els = {
  duration: $('#duration'),
  position: $('#position'),
  swatches: $('#swatches'),
  title: $('#title'),
  headerHeading: $('#header-heading'),
  headerDescription: $('#header-description'),
  toastSettingsHeading: $('#toast-settings-heading'),
  durationLabel: $('#duration-label'),
  positionLabel: $('#position-label'),
  colorsLabel: $('#colors-label'),
  openOptions: $<HTMLButtonElement>('#open-options'),
};

function render(values: Values) {
  els.title.textContent = i18n.t('popupTitle');
  els.headerHeading.textContent = i18n.t('popupHeaderHeading');
  els.headerDescription.textContent = i18n.t('popupHeaderDescription');
  els.toastSettingsHeading.textContent = i18n.t('popupToastSettingsHeading');
  els.durationLabel.textContent = i18n.t('popupToastDurationLabel');
  els.positionLabel.textContent = i18n.t('popupToastPositionLabel');
  els.colorsLabel.textContent = i18n.t('popupToastColorsLabel');
  els.openOptions.textContent = i18n.t('popupOpenOptionsButton');
  els.duration.textContent = `${values.toastDuration} ms`;
  els.position.textContent = values.toastPosition.replace('-', ' ');

  els.swatches.replaceChildren(
    ...TOAST_TYPES.map((type) => {
      const swatch = document.createElement('span');
      swatch.className = 'badge badge-sm border-0';
      swatch.textContent = translateToastType(type);
      swatch.style.backgroundColor = values.toastBackgrounds[type];
      swatch.style.color = values.toastColors[type];
      return swatch;
    }),
  );
}

els.openOptions.addEventListener('click', async () => {
  await browser.runtime.openOptionsPage();
  window.close();
});

settings.watchAll(render);
settings.getAll().then(render);
