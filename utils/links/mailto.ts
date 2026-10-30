import { safeDecode } from './safe-decode';
import type { DecodedLink, IsHrefFunction } from './types';

const SCHEME = 'mailto:';
const REGEX = /^mailto:/i;

const parseAddresses = (raw: string): string[] => {
  return raw
    .split(/[,;]/)
    .map((address) => safeDecode(address).trim())
    .filter(Boolean);
};

export const isMailtoHref: IsHrefFunction = (href) => REGEX.test(href.trim());

const splitMailto = (url: string): { path: string; query: string } => {
  let rest = url.slice(SCHEME.length);

  const hashIndex = rest.indexOf('#');
  if (hashIndex !== -1) rest = rest.slice(0, hashIndex);

  const queryIndex = rest.indexOf('?');
  return {
    path: queryIndex === -1 ? rest : rest.slice(0, queryIndex),
    query: queryIndex === -1 ? '' : rest.slice(queryIndex + 1),
  };
};

const applyField = (result: DecodedLink, name: string, rawValue: string): void => {
  switch (name) {
    case 'to':
      result.to.push(...parseAddresses(rawValue));
      break;
    case 'cc':
      result.cc.push(...parseAddresses(rawValue));
      break;
    case 'bcc':
      result.bcc.push(...parseAddresses(rawValue));
      break;
    case 'subject':
      result.subject = safeDecode(rawValue);
      break;
    case 'body':
      result.body = safeDecode(rawValue);
      break;
    case '__proto__':
      break;
    default:
      result.headers[name] = safeDecode(rawValue);
  }
};

export const decodeMailto = (href: string): DecodedLink => {
  const url = href.trim();
  if (!isMailtoHref(url)) throw new TypeError(`Not a mailto: URL: ${href}`);

  const { path, query } = splitMailto(url);
  const result: DecodedLink = {
    to: parseAddresses(path),
    cc: [],
    bcc: [],
    headers: {},
  };

  for (const pair of query.split('&')) {
    if (!pair) continue;

    const equalsIndex = pair.indexOf('=');
    const name = safeDecode(equalsIndex === -1 ? pair : pair.slice(0, equalsIndex)).toLowerCase();
    const rawValue = equalsIndex === -1 ? '' : pair.slice(equalsIndex + 1);
    applyField(result, name, rawValue);
  }

  return result;
};
