import { safeDecode } from './safe-decode';
import type { DecodedLink, IsHrefFunction } from './types';

const REGEX = /^(?:sms|smsto):/i;

export const isSmsHref: IsHrefFunction = (href) => REGEX.test(href.trim());

export const decodeSms = (href: string): DecodedLink => {
  const url = href.trim();
  if (!isSmsHref(url)) throw new TypeError(`Not an sms: URL: ${href}`);

  let rest = url.slice(url.indexOf(':') + 1);
  const hashIndex = rest.indexOf('#');
  if (hashIndex !== -1) rest = rest.slice(0, hashIndex);
  const queryIndex = rest.indexOf('?');
  const recipients = queryIndex === -1 ? rest : rest.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : rest.slice(queryIndex + 1);
  const result: DecodedLink = { to: [], cc: [], bcc: [], headers: {} };

  result.to.push(
    ...recipients
      .split(',')
      .map((value) => safeDecode(value).trim())
      .filter(Boolean),
  );
  for (const pair of query.split('&')) {
    if (!pair) continue;
    const equalsIndex = pair.indexOf('=');
    const name = safeDecode(equalsIndex === -1 ? pair : pair.slice(0, equalsIndex)).toLowerCase();
    const value = safeDecode(equalsIndex === -1 ? '' : pair.slice(equalsIndex + 1));
    if (name === 'body') result.body = value;
    else if (name === 'subject') result.subject = value;
    else if (name && name !== '__proto__') result.headers[name] = value;
  }

  return result;
};
