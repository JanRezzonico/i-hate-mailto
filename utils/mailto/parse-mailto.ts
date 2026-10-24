import type { DecodedMailto } from './types';

const MAILTO_SCHEME = 'mailto:';
const MAILTO_REGEX = /^mailto:/i;

const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const parseAddresses = (raw: string): string[] => {
  return raw
    .split(/[,;]/) // Addresses can be separated by commas or semicolons
    .map((a) => safeDecode(a).trim()) // Safely decode each address and trim whitespace
    .filter(Boolean); // Filter out any empty strings
};

export const isMailtoHref = (href: string): boolean => {
  return MAILTO_REGEX.test(href.trim());
};

/** Splits a (trimmed) mailto: URL into its address part and its raw query string. */
const splitMailto = (url: string): { path: string; query: string } => {
  let rest = url.slice(MAILTO_SCHEME.length);

  // Drop the fragment identifier (everything after #), it is irrelevant for mailto parsing
  const hashIdx = rest.indexOf('#');
  if (hashIdx !== -1) rest = rest.slice(0, hashIdx);

  const qIdx = rest.indexOf('?');
  return {
    path: qIdx === -1 ? rest : rest.slice(0, qIdx),
    query: qIdx === -1 ? '' : rest.slice(qIdx + 1),
  };
};

const applyField = (result: DecodedMailto, name: string, rawValue: string): void => {
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
    case '__proto__': // Never let a crafted link touch the object's prototype
      break;
    default:
      result.headers[name] = safeDecode(rawValue);
  }
};

export const decodeMailto = (href: string): DecodedMailto => {
  const url = href.trim();
  if (!isMailtoHref(url)) {
    throw new TypeError(`Not a mailto: URL: ${href}`);
  }

  const { path, query } = splitMailto(url);

  const result: DecodedMailto = {
    to: parseAddresses(path),
    cc: [],
    bcc: [],
    headers: {},
  };

  for (const pair of query.split('&')) {
    if (!pair) continue;

    const eqIdx = pair.indexOf('=');
    const name = safeDecode(eqIdx === -1 ? pair : pair.slice(0, eqIdx)).toLowerCase();
    const rawValue = eqIdx === -1 ? '' : pair.slice(eqIdx + 1);

    applyField(result, name, rawValue);
  }

  return result;
};
