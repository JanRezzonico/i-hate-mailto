import { defineSettings } from './define-settings';

// Separate settings declaration to avoid the
// settings reset to also reset the disabled sites list
export const disabledSites = defineSettings({
  domains: [] as string[],
});

export const normalizeDomain = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  const domain = value.trim().toLowerCase();
  const MAX_DOMAIN_LENGTH = 250;
  if (
    !domain ||
    domain.length > MAX_DOMAIN_LENGTH ||
    domain.includes('/') ||
    domain.includes('?') ||
    domain.includes('#')
  )
    return null;

  try {
    const hostname = new URL(`http://${domain}`).hostname.toLowerCase();
    return hostname === domain ? domain : null;
  } catch {
    return null;
  }
};

export const getValidDomains = async (): Promise<string[]> => {
  const domains = await disabledSites.get('domains');
  if (!Array.isArray(domains)) return [];

  return [...new Set(domains.map(normalizeDomain).filter((domain): domain is string => domain !== null))].sort();
};

export const isDomainDisabled = async (domain: unknown): Promise<boolean> => {
  const normalizedDomain = normalizeDomain(domain);
  return normalizedDomain !== null && (await getValidDomains()).includes(normalizedDomain);
};
