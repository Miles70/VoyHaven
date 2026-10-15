import assert from 'node:assert/strict';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import catalogs from '../src/i18n/extended/flows.js';
import { addedLanguages } from '../shared/languages.js';
const root = process.cwd(), temporary = await mkdtemp(path.join(root, 'node_modules/.localized-flows-'));
try {
  await writeFile(path.join(temporary, 'entry.jsx'), `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '${root}/src/i18n/LanguageContext.jsx';
import ReservationResult from '${root}/src/components/ReservationResult.jsx';
import FlightCheckout from '${root}/src/pages/FlightCheckout.jsx';
import StripePayment from '${root}/src/components/StripePayment.jsx';
export { flowText } from '${root}/src/i18n/flowTranslations.js';
export function render(language) {
 globalThis.localStorage = { getItem: () => language };
 const result = { total: 123.45, currency: 'EUR', offer: { offerId: 'fixture' }, segments: [{ originCode: 'AYT', destinationCode: 'FRA', departureTime: '2099-10-01T10:00:00', direction: 'OUTBOUND' }] };
 return renderToStaticMarkup(<MemoryRouter initialEntries={[{ pathname:'/flights/checkout', state:{result,passengers:{adults:1}} }]}><LanguageProvider><FlightCheckout/><StripePayment session={{amount:123.45,currency:'EUR'}}/><ReservationResult booking={{status:'confirmed',kind:'hotel',clientReference:'fixture-reference'}}/></LanguageProvider></MemoryRouter>);
}
`);
  await build({ configFile: false, plugins: [react()], logLevel: 'error', publicDir: false, build: { ssr: path.join(temporary, 'entry.jsx'), outDir: path.join(temporary, 'out'), emptyOutDir: true } });
  const { render, flowText } = await import(pathToFileURL(path.join(temporary, 'out/entry.js')));
  const keys = Object.keys(catalogs.nl).sort();
  for (const language of addedLanguages) {
    assert.deepEqual(Object.keys(catalogs[language]).sort(), keys, language);
    for (const text of Object.values(catalogs[language])) assert.ok(text.trim() && !/98765\d+|<unk>/.test(text), language);
    const html = render(language);
    for (const key of ['İletişim bilgileri','Kartla güvenli ödeme','Otel rezervasyonun onaylandı']) assert.ok(html.includes(catalogs[language][key]), `${language}: ${key}`);
    assert.ok(!html.includes('İletişim bilgileri') && !html.includes('Otel rezervasyonun onaylandı'), language);
    assert.ok(html.includes('fixture-reference') && html.includes('AYT') && html.includes('FRA'));
    assert.equal(flowText(123, language), 123);
    const object = { price: 100 }; assert.equal(flowText(object, language), object);
    assert.equal(flowText('  İletişim bilgileri ', language), `  ${catalogs[language]['İletişim bilgileri']} `);
  }
  assert.equal(flowText('İletişim bilgileri', 'tr'), 'İletişim bilgileri');
  console.log(`Account/payment copy: ${addedLanguages.length} new locales, ${keys.length} strings each; flight checkout, card loading and reservation-result rendering passed without payment requests.`);
} finally { await rm(temporary, { recursive: true, force: true }); delete globalThis.localStorage; }
