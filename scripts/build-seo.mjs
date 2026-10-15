import { copy, languageNames } from "../seo/copy.js";
import { informationPaths, informationPath, informationAlternates } from "../seo/information-locales.js";
import { supportedLanguages } from "../shared/languages.js";
import { readFile, readdir, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { buildPages, SITE_URL } from '../seo/model.js';
import { renderDocument, escapeHtml } from '../seo/html.js';
const hotels = await Promise.all((await readdir('seo/hotels')).filter(f => f.endsWith('.json')).map(async f => JSON.parse(await readFile(join('seo/hotels', f), 'utf8'))));
const pages = buildPages(hotels);
const maxPages = Number(process.env.SEO_MAX_PAGES || 15000);
if (pages.length > maxPages) throw new Error(`SEO page budget exceeded: ${pages.length}/${maxPages}. Publish a curated catalog or move large catalogs to cached on-demand rendering.`);
const tmp = await mkdtemp(join(process.cwd(), '.seo-render-'));
try {
 await build({ configFile: false, plugins: [react()], logLevel: 'warn', build: { ssr: 'scripts/seo-render-entry.jsx', outDir: tmp, emptyOutDir: true, rollupOptions: { external: ['react', 'react/jsx-runtime', 'react-dom/server'] } } });
 const { render } = await import(pathToFileURL(join(tmp, 'seo-render-entry.js')));
 const template = await readFile('dist/seo.html', 'utf8');
 // Keep the SPA template outside the public output. Otherwise / bypasses the
 // page adapter and serves English metadata even when ?lang is supplied.
 await mkdir('.seo-server', { recursive: true });
 await writeFile('.seo-server/app-shell.html', await readFile('dist/index.html', 'utf8'));
 await rm('dist/index.html');
 for (const page of pages) {
  const file = join('dist', `${page.path.slice(1)}.html`);
  await mkdir(join(file, '..'), { recursive: true });
  await writeFile(file, renderDocument(template, page, render(page)));
 }
 // Render public information pages for every query-language variant too.
 await build({ configFile: false, plugins: [react()], logLevel: 'warn', build: { ssr: 'scripts/information-render-entry.jsx', outDir: join(tmp, 'information'), emptyOutDir: true, rollupOptions: { external: ['react', 'react/jsx-runtime', 'react-dom/server', 'react-router-dom'] } } });
 const { renderInformation } = await import(pathToFileURL(join(tmp, 'information/information-render-entry.js')));
 const information = Object.fromEntries(supportedLanguages.map(language => [language, Object.fromEntries(informationPaths.map(path => [path, renderInformation(path.slice(1), language)]))]));
 for (const language of supportedLanguages) {
  const c = copy[language];
  information[language]['/'] = `<main><h1>${escapeHtml(c.homeTitle)}</h1><p>${escapeHtml(c.hotelHelp)}</p><nav><a href="/${language}/hotels">${escapeHtml(c.hotels)}</a> · <a href="/${language}/flights">${escapeHtml(c.flights)}</a></nav><nav>${supportedLanguages.map(lang => `<a href="/${lang}" lang="${lang}" hreflang="${lang}">${escapeHtml(languageNames[lang])}</a>`).join(' · ')}</nav></main>`;
 }
 await writeFile('.seo-server/information.json', JSON.stringify(information));
 const xml = value => escapeHtml(value).replaceAll('&#39;', '&apos;');
 await mkdir('dist/sitemaps', { recursive: true });
 const chunks = [];
 // 1,000 entries with 18 alternates remains well below 50MB / 50,000 limits.
 for (let i = 0; i < pages.length; i += 1000) {
  const filename = `pages-${Math.floor(i / 1000) + 1}.xml`;
  const body = pages.slice(i, i + 1000).map(p => `<url><loc>${SITE_URL}${p.path}</loc>${p.modified ? `<lastmod>${p.modified}</lastmod>` : ''}${p.alternates.map(a => `<xhtml:link rel="alternate" hreflang="${a.language}" href="${xml(SITE_URL + a.path)}"/>`).join('')}</url>`).join('\n');
  await writeFile(`dist/sitemaps/${filename}`, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}</urlset>`);
  chunks.push(`/sitemaps/${filename}`);
 }
 const general = informationPaths.flatMap(path => supportedLanguages.map(language => ({ path: informationPath(path, language), alternates: informationAlternates(path) })));
 await writeFile('dist/sitemaps/general.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${general.map(page => `<url><loc>${xml(SITE_URL + page.path)}</loc>${page.alternates.map(a => `<xhtml:link rel="alternate" hreflang="${a.language}" href="${xml(SITE_URL + a.path)}"/>`).join('')}</url>`).join('')}</urlset>`);
 chunks.push('/sitemaps/general.xml');
 await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chunks.map(path => `<sitemap><loc>${SITE_URL}${path}</loc></sitemap>`).join('')}</sitemapindex>`);
 await writeFile('dist/seo-manifest.json', JSON.stringify({ pages: pages.map(({ path, kind, lang }) => ({ path, kind, lang })), hotels: pages.filter(p => p.kind === 'hotel' && p.lang === 'en').map(p => p.hotel.id) }, null, 2));
 // Entry shell contains placeholders, never expose it as an indexable page.
 await rm('dist/seo.html');
 console.log(`SEO: ${pages.length} HTML pages, ${supportedLanguages.length} languages, ${chunks.length} sitemap shards; zero build-time provider requests.`);
} finally { await rm(tmp, { recursive: true, force: true }); }
