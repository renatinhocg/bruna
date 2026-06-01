import slugify from './slugify.js';

const IGNORED_COMPANY_TERMS = new Set([
  'casa',
  'empresa',
  'grupo',
  'instituto',
  'holding',
  'ltda',
  'eireli',
  'me',
  'epp',
  'sa',
  's',
  'a'
]);

export function getCompanyPortalSlugs(companyName = '') {
  const fullSlug = slugify(companyName);
  const parts = fullSlug.split('-').filter(Boolean);
  const meaningfulParts = parts.filter((part) => !IGNORED_COMPANY_TERMS.has(part));

  return Array.from(new Set([fullSlug, ...meaningfulParts]));
}

export function matchesCompanyPortalSlug(companyName, requestedSlug) {
  return getCompanyPortalSlugs(companyName).includes(slugify(requestedSlug));
}
