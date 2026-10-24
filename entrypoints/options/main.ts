import '@/assets/tailwind-daisyui.css';
import { getColorInput, getElements, getPreviewElement } from './utils/get-elements';
import {
  DURATION_MIN,
  DURATION_MAX,
  TOAST_POSITIONS,
  TOAST_TYPES,
  type ToastType,
  type ToastPosition,
} from '@/utils/types';
import { type Errors, type Values } from './utils/types';
import { translateToastType } from '@/utils/translate-toast-type';
import { translateToastPosition } from '@/utils/translate-toast-position';

const els = getElements();

const populatePositionSelectOptions = () => {
  els.position.replaceChildren(
    ...TOAST_POSITIONS.map((p) => {
      const prettyName = translateToastPosition(p);
      return new Option(prettyName, p);
    }),
  );
};

const buildToastColorRows = () => {
  const buildToastMessage = (type: ToastType) => {
    return translateToastType(type);
  };
  els.colors.innerHTML = TOAST_TYPES.map(
    (type) => `
      <div class="grid grid-cols-[4rem_1fr_1fr_1fr] items-center gap-3">
        <span class="font-medium capitalize">${translateToastType(type)}</span>
        <label class="flex items-center gap-2 text-sm">
          <input type="color" data-type="${type}" data-field="background" class="h-8 w-10 cursor-pointer" />
          ${i18n.t('background')}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="color" data-type="${type}" data-field="text" class="h-8 w-10 cursor-pointer" />
          ${i18n.t('text')}
        </label>
        <div data-preview="${type}" class="rounded-md px-3 py-1.5 text-center text-sm capitalize">${buildToastMessage(type)}</div>
      </div>`,
  ).join('');
};

const updateToastPreviews = () => {
  for (const t of TOAST_TYPES) {
    const preview = getPreviewElement(t);
    preview.style.backgroundColor = getColorInput(t, 'background').value;
    preview.style.color = getColorInput(t, 'text').value;
  }
};

const populateFormValues = (values: Values) => {
  els.duration.value = String(values.toastDuration);
  els.position.value = values.toastPosition;
  els.duration.min = String(DURATION_MIN);
  els.duration.max = String(DURATION_MAX);
  for (const t of TOAST_TYPES) {
    getColorInput(t, 'background').value = values.toastBackgrounds[t];
    getColorInput(t, 'text').value = values.toastColors[t];
  }
  updateToastPreviews();
  cleanSaveState();
};

const populateStatic = () => {
  els.title.textContent = i18n.t('optionsTitle');
  els.headerHeading.textContent = i18n.t('optionsHeaderHeading');
  els.headerDescription.textContent = i18n.t('optionsHeaderDescription');
  els.toastSettingsHeading.textContent = i18n.t('optionsToastSettingsHeading');
  els.durationLabel.textContent = i18n.t('optionsToastDurationLabel');
  els.positionLabel.textContent = i18n.t('optionsToastPositionLabel');
  els.reset.textContent = i18n.t('optionsResetButton');
  els.save.textContent = i18n.t('optionsSaveButton');
};

const transformFormValues = (): Values => {
  const pick = (field: 'background' | 'text') =>
    Object.fromEntries(TOAST_TYPES.map((type) => [type, getColorInput(type, field).value])) as Record<
      ToastType,
      string
    >;

  return {
    toastDuration: Number(els.duration.value),
    toastPosition: els.position.value as ToastPosition,
    toastBackgrounds: pick('background'),
    toastColors: pick('text'),
  };
};

let dirtyTrackingSnapshot = '';

const serializeTransformedFormValues = (values: Values) => JSON.stringify(values);

const updateSaveState = () => {
  const currentSnapshot = serializeTransformedFormValues(transformFormValues());
  els.save.disabled = currentSnapshot === dirtyTrackingSnapshot;
};

const cleanSaveState = () => {
  const currentSnapshot = serializeTransformedFormValues(transformFormValues());
  dirtyTrackingSnapshot = currentSnapshot;
  updateSaveState();
};

const validateValues = (values: Values): Errors => {
  const errors: Errors = {};

  const d = values.toastDuration;
  // Duration must be a whole number between DURATION_MIN and DURATION_MAX (inclusive)
  if (els.duration.value.trim() === '' || !Number.isInteger(d) || d < DURATION_MIN || d > DURATION_MAX) {
    errors.duration = i18n.t('optionsErrorDuration', [DURATION_MIN, DURATION_MAX]);
  }

  // Toast position must be one of the allowed values
  if (!TOAST_POSITIONS.includes(values.toastPosition)) {
    errors.other = i18n.t('optionsErrorPosition');
  }

  // All colors must be valid hex values
  const allColors = [...Object.values(values.toastBackgrounds), ...Object.values(values.toastColors)];
  const HEX_COLOR_REGEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i; // Allows both #RGB and #RRGGBB hex color formats
  if (!allColors.every((c) => HEX_COLOR_REGEX.test(c))) {
    errors.other = i18n.t('optionsErrorColors');
  }

  return errors;
};

const showErrors = (errors: Errors) => {
  els.durationError.textContent = errors.duration ?? '';
  els.durationError.classList.toggle('hidden', !errors.duration);
  els.duration.classList.toggle('input-error', !!errors.duration);
};

const clearErrors = () => {
  showErrors({});
};

let statusTimer: number | undefined;

const showStatus = (message: string, type: 'success' | 'error') => {
  window.clearTimeout(statusTimer);
  els.status.textContent = message;
  els.status.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
  if (type === 'success') {
    statusTimer = window.setTimeout(() => els.status.classList.add('hidden'), 2000);
  }
};

// When the form is modified, update various states and clear any existing errors
els.form.addEventListener('input', () => {
  updateToastPreviews();
  updateSaveState();
  clearErrors();
});

// When the form is submitted, validate the values and save them if valid,
// otherwise show errors and prevent saving
els.form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = transformFormValues();
  const errors = validateValues(values);
  showErrors(errors);

  if (errors.duration || errors.other) {
    showStatus(errors.other ?? i18n.t('optionsErrorFallback'), 'error');
    return;
  }

  await Promise.all((Object.keys(values) as (keyof Values)[]).map((key) => settings.set(key, values[key])));
  cleanSaveState();
  showStatus(i18n.t('optionsSettingsSaved'), 'success');
});

// When the reset (restore defaults) button is clicked, reset all settings to their default values
// and clear any errors or save state
els.reset.addEventListener('click', async () => {
  await Promise.all((Object.keys(settings.defaults) as (keyof Values)[]).map((key) => settings.reset(key)));
  populateFormValues(await settings.getAll());
  cleanSaveState();
  clearErrors();
  showStatus(i18n.t('optionsSettingsReset'), 'success');
});

// Main
populateStatic();
populatePositionSelectOptions();
buildToastColorRows();
settings.getAll().then((values) => {
  populateFormValues(values);
});
