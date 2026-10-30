import { decodeMailto, isMailtoHref } from './mailto';
import { decodeSms, isSmsHref } from './sms';
import { decodeTel, isTelHref } from './tel';
import type { LinkHandler } from './types';

export const linkHandlers: LinkHandler[] = [
  { type: 'mailto', matches: isMailtoHref, decode: decodeMailto },
  { type: 'tel', matches: isTelHref, decode: decodeTel },
  { type: 'sms', matches: isSmsHref, decode: decodeSms },
];

type EnabledFunction = (handler: LinkHandler) => boolean;

export const getLinkHandler = (href: string, enabled: EnabledFunction): LinkHandler | undefined => {
  return linkHandlers.find((handler) => enabled(handler) && handler.matches(href));
};
