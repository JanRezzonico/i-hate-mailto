import '@/assets/tailwind-daisyui.css';
import { TOAST_DURATION_MAX, TOAST_DURATION_MIN, TOAST_POSITIONS, TOAST_TYPES } from '@/utils/toast/constants';
import { translateToastPosition, translateToastType } from '@/utils/toast/translate';
import { translateCopyMode } from '@/utils/clipboard/translate-copy-mode';
import { COPY_MODES } from '@/utils/clipboard/constants';
import { $, cloneTemplate } from '@/utils/dom/query';
import { applyI18n, localizeDocument } from '@/utils/i18n/localize-document';
import { settings } from '@/utils/settings/settings';
import type { ToastPosition, ToastType } from '@/utils/toast/types';
import type { CopyMode } from '@/utils/clipboard/types';
import type { Settings, SettingsKey } from '@/utils/settings/settings';
import { translateCopyModeDescription } from '@/utils/clipboard/translate-copy-mode-description';

type Errors = { durationMin?: string; durationMax?: string; other?: string };

const page = {
  form: $<HTMLFormElement>('#form'),

  copyModeSelect: $<HTMLSelectElement>('#copy-mode'),
  copyModeDescriptions: $('#copy-mode-descriptions'),

  durationMin: $<HTMLInputElement>('#duration-min'),
  durationMax: $<HTMLInputElement>('#duration-max'),
  durationError: $('#duration-error'),

  positionSelect: $<HTMLSelectElement>('#position'),

  colors: $('#colors'),
  status: $('#status'),

  resetButton: $<HTMLButtonElement>('#reset'),
  saveButton: $<HTMLButtonElement>('#save'),
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

const populateFormValues = (values: Settings) => {
  page.copyModeSelect.value = values.copyMode;
  page.positionSelect.value = values.toastPosition;
  page.durationMin.value = String(values.toastDurationMin);
  page.durationMax.value = String(values.toastDurationMax);
  for (const type of TOAST_TYPES) {
    colorRows[type].background.value = values.toastBackgrounds[type];
    colorRows[type].text.value = values.toastColors[type];
  }
  updateToastPreviews();
  cleanSaveState();
};

const transformFormValues = (): Settings => {
  const pick = (field: 'background' | 'text') =>
    Object.fromEntries(TOAST_TYPES.map((type) => [type, colorRows[type][field].value])) as Record<ToastType, string>;

  return {
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
  page.saveButton.disabled = currentSnapshot === dirtyTrackingSnapshot;
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

let statusTimer: number | undefined;

const showStatus = (message: string, type: 'success' | 'error') => {
  window.clearTimeout(statusTimer);
  page.status.textContent = message;
  page.status.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
  if (type === 'success') {
    statusTimer = window.setTimeout(() => page.status.classList.add('hidden'), 2000);
  }
};

const hideStatus = () => {
  window.clearTimeout(statusTimer);
  page.status.classList.add('hidden');
};

// When the form is modified, update various states and clear any existing errors
page.form.addEventListener('input', () => {
  updateToastPreviews();
  updateSaveState();
  clearErrors();
  hideStatus();
});

// When the form is submitted, validate the values and save them if valid,
// otherwise show errors and prevent saving
page.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = transformFormValues();
  const errors = validateValues(values);
  showErrors(errors);

  if (errors.durationMin || errors.durationMax || errors.other) {
    showStatus(errors.other ?? i18n.t('optionsErrorFallback'), 'error');
    return;
  }

  const keys = Object.keys(values) as SettingsKey[];
  await Promise.all(keys.map((key) => settings.set(key, values[key])));
  cleanSaveState();
  showStatus(i18n.t('optionsSettingsSaved'), 'success');
});

// When the reset (restore defaults) button is clicked, reset all settings to their default values
// and clear any errors or save state
page.resetButton.addEventListener('click', async () => {
  const keys = Object.keys(settings.defaults) as SettingsKey[];
  await Promise.all(keys.map((key) => settings.reset(key)));
  const newValues = await settings.getAll();
  populateFormValues(newValues); // also resets the dirty-tracking snapshot
  clearErrors();
  showStatus(i18n.t('optionsSettingsReset'), 'success');
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
