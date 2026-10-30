import '@/assets/tailwind-daisyui.css';
import { TOAST_DURATION_MAX, TOAST_DURATION_MIN, TOAST_POSITIONS, TOAST_TYPES } from '@/utils/toast/constants';
import { translateToastPosition, translateToastType } from '@/utils/toast/translate';
import { translateCopyMode } from '@/utils/clipboard/translate-copy-mode';
import { COPY_MODES } from '@/utils/clipboard/constants';
import { $, cloneTemplate } from '@/utils/dom/query';
import { applyI18n, localizeDocument } from '@/utils/i18n/localize-document';
import { settings } from '@/utils/settings/settings';
import { disabledSites, getValidDomains } from '@/utils/settings/disabled-sites';
import type { ToastPosition, ToastType } from '@/utils/toast/types';
import type { CopyMode } from '@/utils/clipboard/types';
import type { Settings, SettingsKey } from '@/utils/settings/settings';
import { translateCopyModeDescription } from '@/utils/clipboard/translate-copy-mode-description';
import showToast from '@/utils/toast/show-toast';

type Errors = { durationMin?: string; durationMax?: string; other?: string };

const page = {
  form: $<HTMLFormElement>('#form'),

  copyModeSelect: $<HTMLSelectElement>('#copy-mode'),
  copyModeDescriptions: $('#copy-mode-descriptions'),
  mailtoEnabled: $<HTMLInputElement>('#mailto-enabled'),
  telEnabled: $<HTMLInputElement>('#tel-enabled'),
  smsEnabled: $<HTMLInputElement>('#sms-enabled'),

  durationMin: $<HTMLInputElement>('#duration-min'),
  durationMax: $<HTMLInputElement>('#duration-max'),
  durationError: $('#duration-error'),

  positionSelect: $<HTMLSelectElement>('#position'),
  positionPreviewToast: $<HTMLDivElement>('#position-preview-toast'),

  colors: $('#colors'),
  disabledSites: $('#disabled-sites'),
  disabledSitesEmpty: $('#disabled-sites-empty'),
  removeDisabledSitesButton: $<HTMLButtonElement>('#remove-disabled-sites'),

  resetButtons: [$<HTMLButtonElement>('#top-reset'), $<HTMLButtonElement>('#bottom-reset')],
  saveButtons: [$<HTMLButtonElement>('#top-save'), $<HTMLButtonElement>('#bottom-save')],
  resetConfirmation: $<HTMLDialogElement>('#reset-confirmation'),
  resetCancelButton: $<HTMLButtonElement>('#reset-cancel'),
  resetConfirmButton: $<HTMLButtonElement>('#reset-confirm'),
};

const renderDisabledSites = async () => {
  const validDomains = await getValidDomains();
  page.disabledSites.replaceChildren(
    ...validDomains.map((domain) => {
      const item = document.createElement('li');
      item.textContent = domain;
      return item;
    }),
  );
  page.disabledSitesEmpty.classList.toggle('hidden', validDomains.length > 0);
  page.removeDisabledSitesButton.disabled = validDomains.length === 0;
};

const populateSelectOptions = () => {
  page.positionSelect.replaceChildren(...TOAST_POSITIONS.map((p) => new Option(translateToastPosition(p), p)));
  page.copyModeSelect.replaceChildren(...COPY_MODES.map((mode) => new Option(translateCopyMode(mode), mode)));
};

const buildCopyModeDescriptions = () => {
  page.copyModeDescriptions.replaceChildren(
    ...COPY_MODES.map((mode) => {
      const item = cloneTemplate('#copy-mode-description-template');
      $('[data-role="label"]', item).textContent = translateCopyMode(mode);
      $('[data-role="description"]', item).textContent = translateCopyModeDescription(mode);
      return item;
    }),
  );
};

type ColorRow = { background: HTMLInputElement; text: HTMLInputElement; preview: HTMLElement };

const buildToastColorRows = (): Record<ToastType, ColorRow> => {
  const refs = {} as Record<ToastType, ColorRow>;

  const rows = TOAST_TYPES.map((type) => {
    const row = cloneTemplate('#color-row-template');
    applyI18n(row);

    const typeName = translateToastType(type);
    $('[data-role="type"]', row).textContent = typeName;

    const preview = $('[data-role="preview"]', row);
    preview.textContent = typeName;

    refs[type] = {
      background: $<HTMLInputElement>('input[data-field="background"]', row),
      text: $<HTMLInputElement>('input[data-field="text"]', row),
      preview,
    };
    return row;
  });

  page.colors.replaceChildren(...rows);
  return refs;
};

const colorRows = buildToastColorRows();

const updateToastPreviews = () => {
  for (const type of TOAST_TYPES) {
    const { background, text, preview } = colorRows[type];
    preview.style.backgroundColor = background.value;
    preview.style.color = text.value;
  }
};

const updatePositionPreview = () => {
  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-3 right-3',
    'top-left': 'top-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'bottom-left': 'bottom-3 left-3',
  };
  const position = page.positionSelect.value as ToastPosition;
  page.positionPreviewToast.className = `absolute rounded-box bg-success px-3 py-2 text-sm font-medium text-success-content shadow-sm ${positionClasses[position]}`;
};

const populateFormValues = (values: Settings) => {
  page.mailtoEnabled.checked = values.mailtoEnabled;
  page.telEnabled.checked = values.telEnabled;
  page.smsEnabled.checked = values.smsEnabled;
  page.copyModeSelect.value = values.copyMode;
  page.positionSelect.value = values.toastPosition;
  page.durationMin.value = String(values.toastDurationMin);
  page.durationMax.value = String(values.toastDurationMax);
  for (const type of TOAST_TYPES) {
    colorRows[type].background.value = values.toastBackgrounds[type];
    colorRows[type].text.value = values.toastColors[type];
  }
  updateToastPreviews();
  updatePositionPreview();
  cleanSaveState();
};

const transformFormValues = (): Settings => {
  const pick = (field: 'background' | 'text') =>
    Object.fromEntries(TOAST_TYPES.map((type) => [type, colorRows[type][field].value])) as Record<ToastType, string>;

  return {
    mailtoEnabled: page.mailtoEnabled.checked,
    telEnabled: page.telEnabled.checked,
    smsEnabled: page.smsEnabled.checked,
    copyMode: page.copyModeSelect.value as CopyMode,
    toastDurationMin: Number(page.durationMin.value),
    toastDurationMax: Number(page.durationMax.value),
    toastPosition: page.positionSelect.value as ToastPosition,
    toastBackgrounds: pick('background'),
    toastColors: pick('text'),
  };
};

let dirtyTrackingSnapshot = '';

const serializeTransformedFormValues = (values: Settings) => JSON.stringify(values);

const updateSaveState = () => {
  const currentSnapshot = serializeTransformedFormValues(transformFormValues());
  const disabled = currentSnapshot === dirtyTrackingSnapshot;
  page.saveButtons.forEach((button) => {
    button.disabled = disabled;
  });
};

const cleanSaveState = () => {
  dirtyTrackingSnapshot = serializeTransformedFormValues(transformFormValues());
  updateSaveState();
};

const validateValues = (values: Settings): Errors => {
  const errors: Errors = {};

  const min = values.toastDurationMin;
  const max = values.toastDurationMax;
  const minInvalid =
    page.durationMin.value.trim() === '' ||
    !Number.isInteger(min) ||
    min < TOAST_DURATION_MIN ||
    min > TOAST_DURATION_MAX;
  const maxInvalid =
    page.durationMax.value.trim() === '' ||
    !Number.isInteger(max) ||
    max < TOAST_DURATION_MIN ||
    max > TOAST_DURATION_MAX;
  if (minInvalid) {
    errors.durationMin = i18n.t('optionsErrorDuration', [TOAST_DURATION_MIN, TOAST_DURATION_MAX]);
  }
  if (maxInvalid) {
    errors.durationMax = i18n.t('optionsErrorDuration', [TOAST_DURATION_MIN, TOAST_DURATION_MAX]);
  }
  if (!minInvalid && !maxInvalid && min > max) {
    errors.other = i18n.t('optionsErrorDurationOrder');
  }

  // Toast position must be one of the allowed values
  if (!TOAST_POSITIONS.includes(values.toastPosition)) {
    errors.other = i18n.t('optionsErrorPosition');
  }

  // All colors must be valid hex values
  const allColors = [...Object.values(values.toastBackgrounds), ...Object.values(values.toastColors)];
  const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i; // Allows both #RGB and #RRGGBB hex color formats
  if (!allColors.every((c) => HEX_COLOR_REGEX.test(String(c)))) {
    errors.other = errors.other ?? i18n.t('optionsErrorColors');
  }

  return errors;
};

const showErrors = (errors: Errors) => {
  page.durationError.textContent = errors.durationMin ?? errors.durationMax ?? errors.other ?? '';
  page.durationError.classList.toggle('hidden', !errors.durationMin && !errors.durationMax && !errors.other);
  page.durationMin.classList.toggle('input-error', !!errors.durationMin || !!errors.other);
  page.durationMax.classList.toggle('input-error', !!errors.durationMax || !!errors.other);
};

const clearErrors = () => {
  showErrors({});
};

// When the form is modified, update various states and clear any existing errors
page.form.addEventListener('input', () => {
  updateToastPreviews();
  updatePositionPreview();
  updateSaveState();
  clearErrors();
});

// When the form is submitted, validate the values and save them if valid,
// otherwise show errors and prevent saving
page.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = transformFormValues();
  const errors = validateValues(values);
  showErrors(errors);

  if (errors.durationMin || errors.durationMax || errors.other) {
    await showToast(errors.other ?? i18n.t('optionsErrorFallback'), '', 'error');
    return;
  }

  const keys = Object.keys(values) as SettingsKey[];
  await Promise.all(keys.map((key) => settings.set(key, values[key])));
  cleanSaveState();
  await showToast(i18n.t('optionsSettingsSaved'), '', 'success');
});

// When the reset (restore defaults) button is clicked, reset all settings to their default values
// and clear any errors or save state
const resetSettings = async () => {
  const keys = Object.keys(settings.defaults) as SettingsKey[];
  await Promise.all(keys.map((key) => settings.reset(key)));
  const newValues = await settings.getAll();
  populateFormValues(newValues); // also resets the dirty-tracking snapshot
  clearErrors();
  await showToast(i18n.t('optionsSettingsReset'), '', 'success');
};

page.resetButtons.forEach((button) =>
  button.addEventListener('click', () => {
    page.resetConfirmation.showModal();
  }),
);
page.resetCancelButton.addEventListener('click', () => page.resetConfirmation.close());
page.resetConfirmButton.addEventListener('click', async () => {
  await resetSettings();
  page.resetConfirmation.close();
});

// When the "Remove All Disabled Sites" button is clicked, clear the list of disabled sites
page.removeDisabledSitesButton.addEventListener('click', async () => {
  await disabledSites.set('domains', []);
  await renderDisabledSites();
  await showToast(i18n.t('disabledSitesRemoved'), '', 'success');
});

// Main
localizeDocument();
populateSelectOptions();
buildCopyModeDescriptions();
page.durationMin.min = String(TOAST_DURATION_MIN);
page.durationMin.max = String(TOAST_DURATION_MAX);
page.durationMax.min = String(TOAST_DURATION_MIN);
page.durationMax.max = String(TOAST_DURATION_MAX);
settings.getAll().then(populateFormValues);
renderDisabledSites();
