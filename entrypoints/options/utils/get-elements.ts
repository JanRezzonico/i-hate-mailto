function $<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export const getElements = () => ({
  form: $<HTMLFormElement>('#form'),
  duration: $<HTMLInputElement>('#duration'),
  save: $<HTMLButtonElement>('#save'),
  durationError: $('#duration-error'),
  position: $<HTMLSelectElement>('#position'),
  colors: $('#colors'),
  status: $('#status'),
  reset: $<HTMLButtonElement>('#reset'),
});

export const getPreviewElement = (type: ToastType) => {
  const preview = $(`[data-preview="${type}"]`);
  if (!preview) throw new Error(`Missing preview element for type: ${type}`);
  return preview;
};

export const getColorInput = (type: ToastType, field: 'background' | 'text') => {
  return $<HTMLInputElement>(`input[data-type="${type}"][data-field="${field}"]`);
};
