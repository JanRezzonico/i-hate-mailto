import type { DecodedMailto } from './types';

// Safely decode a URI component, returning the original string if decoding fails
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
  return /^mailto:/i.test(href.trim());
};

export const decodeMailto = (href: string): DecodedMailto => {
  const url = href.trim();
  if (!isMailtoHref(url)) {
    throw new TypeError(`Not a mailto: URL: ${href}`);
  }

  let rest = url.slice('mailto:'.length); // Remove the mailto: prefix

  // Remove any fragment identifier (the part after #) since it's not relevant for mailto parsing
  const hashIdx = rest.indexOf('#');
  if (hashIdx !== -1) rest = rest.slice(0, hashIdx);

  const qIdx = rest.indexOf('?');
  const path = qIdx === -1 ? rest : rest.slice(0, qIdx); // The path is the part before the query string
  const query = qIdx === -1 ? '' : rest.slice(qIdx + 1); // The query string is the part after the ? (if it exists)

  const result: DecodedMailto = {
    to: parseAddresses(path),
    cc: [],
    bcc: [],
    headers: {},
  };

  // For each key-value pair in the query string
  for (const pair of query.split('&')) {
    if (!pair) continue; // Skip falsy pairs

    const eqIdx = pair.indexOf('=');
    const name = safeDecode(eqIdx === -1 ? pair : pair.slice(0, eqIdx)).toLowerCase();
    const rawValue = eqIdx === -1 ? '' : pair.slice(eqIdx + 1);

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
      default:
        result.headers[name] = safeDecode(rawValue);
    }
  }

  return result;
};
