type AnyAnchor = HTMLAnchorElement | SVGAElement;

const isAnchor = (n: EventTarget): n is AnyAnchor => n instanceof HTMLAnchorElement || n instanceof SVGAElement;

const XLINK_NS = 'http://www.w3.org/1999/xlink';

/**
 * Returns the href attribute of an anchor element, checking both the standard href attribute and the xlink:href attribute for SVG anchors.
 */
const getHref = (a: AnyAnchor): string => a.getAttribute('href') ?? a.getAttributeNS(XLINK_NS, 'href') ?? '';

export { isAnchor, getHref };
export type { AnyAnchor };
