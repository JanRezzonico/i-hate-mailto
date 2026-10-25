import { browser, i18n } from '#imports';

type Translate = (key: string) => string;

const translateKey = (key: string): string => {
  const text = (i18n.t as unknown as Translate)(key);
  // Report to console if a message is missing instead of silently rendering empty text
  if (!text) console.warn(`[i18n] Missing message: "${key}"`);
  return text;
};

/**
 * @example <h1 data-i18n="myi18nKey"></h1>
 */
export const applyI18n = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (key) el.textContent = translateKey(key);
  });
};

export const localizeDocument = (): void => {
  document.documentElement.lang = browser.i18n.getUILanguage();
  applyI18n(document);
};
