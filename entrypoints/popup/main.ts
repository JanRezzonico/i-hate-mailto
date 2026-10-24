import '@/assets/tailwind-daisyui.css';

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
  openOptions: $<HTMLButtonElement>('#open-options'),
};

function render(values: Values) {
  els.duration.textContent = `${values.toastDuration} ms`;
  els.position.textContent = values.toastPosition.replace('-', ' ');

  els.swatches.replaceChildren(
    ...TOAST_TYPES.map((type) => {
      const swatch = document.createElement('span');
      swatch.className = 'badge badge-sm border-0';
      swatch.textContent = type;
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
