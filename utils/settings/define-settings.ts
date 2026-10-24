import { storage, type WxtStorageItem } from 'wxt/utils/storage';

const STORAGE_PREFIX = 'sync:i-hate-mailto';

/** Builds a typed, synced settings store from a defaults object (one storage item per key). */
export function defineSettings<T extends Record<string, unknown>>(defaults: T) {
  type Items = { [K in keyof T]: WxtStorageItem<T[K], {}> };
  const keys = Object.keys(defaults) as (keyof T & string)[];

  const items = Object.fromEntries(
    keys.map((key) => [
      key,
      storage.defineItem<T[typeof key]>(`${STORAGE_PREFIX}.${key}`, {
        fallback: defaults[key],
      }),
    ]),
  ) as Items;

  const get = <K extends keyof T>(key: K): Promise<T[K]> => items[key].getValue();

  const set = <K extends keyof T>(key: K, value: T[K]) => items[key].setValue(value);

  const reset = (key: keyof T) => items[key].removeValue();

  const watch = <K extends keyof T>(key: K, cb: (value: T[K], oldValue: T[K]) => void) => items[key].watch(cb);

  const getAll = async (): Promise<T> => {
    const entries = await Promise.all(keys.map(async (k) => [k, await items[k].getValue()] as const));
    return Object.fromEntries(entries) as T;
  };

  /** Fires for any setting change; returns a single unwatch function. */
  const watchAll = (cb: (all: T) => void) => {
    const unwatchers = keys.map((k) => items[k].watch(async () => cb(await getAll())));
    return () => unwatchers.forEach((u) => u());
  };

  return { defaults, items, get, set, reset, watch, getAll, watchAll };
}
