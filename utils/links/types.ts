export type LinkType = 'mailto' | 'tel' | 'sms';

export interface DecodedLink {
  to: string[];
  cc: string[];
  bcc: string[];
  subject?: string;
  body?: string;

  headers: Record<string, string>;
}

export interface LinkHandler {
  type: LinkType;
  matches: (href: string) => boolean;
  decode: (href: string) => DecodedLink;
}

export type IsHrefFunction = (href: string) => boolean;
