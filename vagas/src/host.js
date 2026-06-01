export function getTalentosCompanySlug(hostname = window.location.hostname) {
  const host = String(hostname || '').toLowerCase();

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return null;
  }

  if (!host.endsWith('.bmtalentos.com.br')) {
    return null;
  }

  const labels = host.split('.');
  if (labels.length < 4) {
    return null;
  }

  return labels[0];
}
