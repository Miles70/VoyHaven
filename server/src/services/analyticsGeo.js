import { isIP } from 'node:net';
const cache = new Map();
const empty = () => ({ country: '', city: '', geoSource: 'unavailable', geoVersion: 2 });
const normalize = v => typeof v === 'string' ? v.trim().replace(/^::ffff:/i, '') : '';
export function analyticsClientIp(request, railway = Boolean(process.env.RAILWAY_ENVIRONMENT_ID)) {
  // X-Real-IP is supplied by Railway public ingress, not trusted in other deployments.
  const ip = normalize(railway ? request.get('x-real-ip') : request.ip);
  return isIP(ip) ? ip : '';
}
export async function analyticsGeo(ip, lookup = fetch) {
  if (isIP(ip) === 4 && Number(ip.split('.')[0]) >= 224) return empty();
  if (isIP(ip) === 6 && (!/^[23]/.test(ip) || /^2001:db8:/i.test(ip))) return empty();
  if (!isIP(ip) || /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|0\.|::|f[cd]|fe80)/i.test(ip)) return empty();
  if (cache.get(ip)?.expires > Date.now()) return { ...cache.get(ip).value };
  let value = empty();
  try {
    const response = await lookup(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(1800) });
    if (response.ok) {
      const data = await response.json();
      if (data.success === true && normalize(data.ip) === ip && /^[A-Z]{2}$/.test(data.country_code || '') && typeof data.country === 'string' && data.country.trim()) value = { country: data.country.trim().slice(0, 80), city: typeof data.city === 'string' ? data.city.trim().slice(0, 80) : '', geoSource: 'ipwho.is', geoVersion: 2 };
    }
  } catch { /* Unknown instead of a default/server country. */ }
  if (cache.size >= 1000) cache.delete(cache.keys().next().value);
  cache.set(ip, { value, expires: Date.now() + (value.country ? 3600000 : 30000) });
  return { ...value };
}
