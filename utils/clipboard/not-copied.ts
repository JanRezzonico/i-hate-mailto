import type { NotCopiedInfo, NotCopiedKey } from './types';
import type { DecodedLink } from '@/utils/links/types';

const isEmptyValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
  return !value;
};

export const collectNotCopied = (mailto: DecodedLink, keys: NotCopiedKey[]): NotCopiedInfo | null => {
  const result: NotCopiedInfo = {};
  for (const key of keys) {
    if (!isEmptyValue(mailto[key])) Object.assign(result, { [key]: mailto[key] });
  }
  return Object.keys(result).length ? result : null;
};
