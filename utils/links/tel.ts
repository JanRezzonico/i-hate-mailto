import { safeDecode } from './safe-decode';
import type { DecodedLink, IsHrefFunction } from './types';

const SCHEME = 'tel:';
const REGEX = /^tel:/i;

export const isTelHref: IsHrefFunction = (href) => REGEX.test(href.trim());

export const decodeTel = (href: string): DecodedLink => {
  const url = href.trim();
  if (!isTelHref(url)) throw new TypeError(`Not a tel: URL: ${href}`);

  let rest = url.slice(SCHEME.length);
  const hashIndex = rest.indexOf('#');
  if (hashIndex !== -1) rest = rest.slice(0, hashIndex);

  const queryIndex = rest.indexOf('?');
  const pathAndParameters = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : rest.slice(queryIndex + 1);
  const parts = pathAndParameters.split(';');
  const headers: Record<string, string> = {};

  for (const parameter of parts.slice(1)) {
    if (!parameter) continue;
    const equalsIndex = parameter.indexOf('=');
    const name = safeDecode(equalsIndex === -1 ? parameter : parameter.slice(0, equalsIndex)).toLowerCase();
    const value = safeDecode(equalsIndex === -1 ? '' : parameter.slice(equalsIndex + 1));
    if (name && name !== '__proto__') headers[name] = value;
  }

  for (const pair of query.split('&')) {
    if (!pair) continue;
    const equalsIndex = pair.indexOf('=');
    const name = safeDecode(equalsIndex === -1 ? pair : pair.slice(0, equalsIndex)).toLowerCase();
    if (name && name !== '__proto__') headers[name] = safeDecode(equalsIndex === -1 ? '' : pair.slice(equalsIndex + 1));
  }

  return {
    to: [safeDecode(parts[0] ?? '').trim()].filter(Boolean),
    cc: [],
    bcc: [],
    headers,
  };
};
