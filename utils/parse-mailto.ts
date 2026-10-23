const parseMailto = (hrefValue: string): string => {
  // Remove the mailto: prefix and any query parameters
  const raw = hrefValue.slice('mailto:'.length).split('?')[0] ?? '';
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
};

export default parseMailto;
