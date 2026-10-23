import { storage, type WxtStorageItem } from 'wxt/utils/storage';

export function defineSettings<T extends Record<string, unknown>>(defaults: T) {
  type Items = { [K in keyof T]: WxtStorageItem<T[K], {}> };
  const keys = Object.keys(defaults) as (keyof T & string)[];

  const items = Object.fromEntries(
    keys.map((key) => [
      key,
      storage.defineItem<T[typeof key]>(`sync:i-hate-mailto.${key}`, {
        fallback: defaults[key],
      }),
    ]),
  ) as Items;

  return {
    defaults,
    items,

    get: <K extends keyof T>(key: K): Promise<T[K]> => items[key].getValue(),

    set: <K extends keyof T>(key: K, value: T[K]) => items[key].setValue(value),

    reset: (key: keyof T) => items[key].removeValue(),

    watch: <K extends keyof T>(key: K, cb: (value: T[K], oldValue: T[K]) => void) => items[key].watch(cb),

    async getAll(): Promise<T> {
      const entries = await Promise.all(keys.map(async (k) => [k, await items[k].getValue()] as const));
      return Object.fromEntries(entries) as T;
    },

    /** Fires for any setting change; returns a single unwatch function */
    watchAll(cb: (all: T) => void) {
      const unwatchers = keys.map((k) => items[k].watch(async () => cb(await this.getAll())));
      return () => unwatchers.forEach((u) => u());
    },
  };
}
