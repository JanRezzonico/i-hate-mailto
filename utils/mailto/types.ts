export interface DecodedMailto {
  to: string[];
  cc: string[];
  bcc: string[];
  subject?: string;
  body?: string;
  /** Any other headers (in-reply-to, references, ...), lowercased names. */
  headers: Record<string, string>;
}
