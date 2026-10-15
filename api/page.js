import { SITE_URL } from '../seo/model.js';
import { readFile } from 'node:fs/promises';
import { appPolicy } from '../seo/app-policy.js';
import { escapeHtml } from '../seo/html.js';
let assets;
async function loadAssets() {
 assets ||= Promise.all([readFile(new URL('../.seo-server/app-shell.html', import.meta.url), 'utf8'), readFile(new URL('../dist/seo-manifest.json', import.meta.url), 'utf8').then(JSON.parse), readFile(new URL('../.seo-server/information.json', import.meta.url), 'utf8').then(JSON.parse)]).catch(error => { assets = undefined; throw error; });
 return assets;
}
export default async function handler(request, response) {
 const url = new URL(request.url, SITE_URL);
 const rawPath = request.query?.path ?? url.searchParams.get('path') ?? url.pathname.replace(/^\//, '');
 const path = '/' + (Array.isArray(rawPath) ? rawPath.join('/') : rawPath);
 url.searchParams.delete('path');
 try {
  const [template, manifest, information] = await loadAssets();
  const policy = appPolicy(path, url.searchParams.toString(), manifest.hotels);
  if (policy.redirect) { response.setHeader('Location', policy.redirect); response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600'); return response.status(308).end(); }
  const content = information[policy.lang]?.[path];
  const shell = content ? template.replace(/<div id="root">[\s\S]*?<\/div>/, () => `<div id="root">${content}</div>`) : template;
  const html = shell.replace(/<html\b[^>]*>/i, `<html lang="${policy.lang}" dir="${policy.lang === 'ar' ? 'rtl' : 'ltr'}">`).replace(/<meta\s+name="robots"[^>]*>/gi, '').replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(policy.title)}</title>`).replace(/<meta\s+name="description"[\s\S]*?>/i, '').replace(/<link\s+rel="canonical"[\s\S]*?>/i, '').replace(/<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*")[\s\S]*?>/gi, '').replace('</head>', `<meta name="description" content="${escapeHtml(policy.description)}"><meta name="robots" content="${policy.noIndex ? 'noindex, follow' : 'index, follow'}"><link rel="canonical" href="${escapeHtml(policy.canonical)}">${(policy.alternates || []).map(a => `<link rel="alternate" hreflang="${a.language}" href="${escapeHtml(SITE_URL + a.path)}">`).join('')}<meta property="og:site_name" content="VoyHaven"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(policy.title)}"><meta property="og:description" content="${escapeHtml(policy.description)}"><meta property="og:url" content="${escapeHtml(policy.canonical)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escapeHtml(policy.title)}"><meta name="twitter:description" content="${escapeHtml(policy.description)}"></head>`);
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Query pages may include personal references: never put them into a shared cache.
  response.setHeader('Cache-Control', url.search ? 'private, no-store' : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  if (policy.noIndex) response.setHeader('X-Robots-Tag', 'noindex, follow');
  return response.status(policy.status).send(html);
 } catch {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex');
  return response.status(503).send('Page temporarily unavailable.');
 }
}
