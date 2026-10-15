import assert from 'node:assert/strict';
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import catalogs from '../src/i18n/extended/flows.js';
import { addedLanguages } from '../shared/languages.js';
const root = process.cwd(), temporary = await mkdtemp(path.join(root, 'node_modules/.localized-flows-'));
try {
  await writeFile(path.join(temporary, 'wallet-mock.js'), `
export const useAppKit = () => ({ open() {} });
export const useAppKitAccount = () => ({ isConnected: false, address: '' });
export const usePublicClient = () => ({});
export const useSendTransaction = () => ({});
export const useSwitchChain = () => ({});
export const useWriteContract = () => ({});
`);
  await writeFile(path.join(temporary, 'entry.jsx'), `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '${root}/src/i18n/LanguageContext.jsx';
import ReservationResult from '${root}/src/components/ReservationResult.jsx';
import FlightCheckout from '${root}/src/pages/FlightCheckout.jsx';
import StripePayment from '${root}/src/components/StripePayment.jsx';
import CryptoPayment from '${root}/src/components/CryptoPayment/CryptoPayment.jsx';
export { flowText } from '${root}/src/i18n/flowTranslations.js';
export function render(language, status = 'confirmed', reference = 'fixture-reference') {
 globalThis.localStorage = { getItem: () => language };
 const result = { total: 123.45, currency: 'EUR', offer: { offerId: 'fixture' }, segments: [{ originCode: 'AYT', destinationCode: 'FRA', departureTime: '2099-10-01T10:00:00', direction: 'OUTBOUND' }] };
 return renderToStaticMarkup(<MemoryRouter initialEntries={[{ pathname:'/flights/checkout', state:{result,passengers:{adults:1}} }]}><LanguageProvider><FlightCheckout/><StripePayment session={{amount:123.45,currency:'EUR'}}/><ReservationResult booking={{status,kind:'hotel',clientReference:reference}}/><CryptoPayment booking={{id:'fixture',paymentMethod:'crypto',paymentStatus:'unpaid',total:12.345,payment:{expectedAmount:'12.345',token:'USDT',network:'BNB Chain',chainId:56,tokenDecimals:18,tokenAddress:'0x0000000000000000000000000000000000000001',recipientAddress:'0x0000000000000000000000000000000000000002'}}}/></LanguageProvider></MemoryRouter>);
}
`);
  await build({ configFile: false, resolve: { alias: [{ find: '@reown/appkit/react', replacement: path.join(temporary, 'wallet-mock.js') }, { find: 'wagmi', replacement: path.join(temporary, 'wallet-mock.js') }] }, plugins: [react()], logLevel: 'error', publicDir: false, build: { ssr: path.join(temporary, 'entry.jsx'), outDir: path.join(temporary, 'out'), emptyOutDir: true } });
  const { render, flowText } = await import(pathToFileURL(path.join(temporary, 'out/entry.js')));
  const keys = Object.keys(catalogs.nl).sort();
  for (const language of addedLanguages) {
    assert.deepEqual(Object.keys(catalogs[language]).sort(), keys, language);
    for (const [source, text] of Object.entries(catalogs[language])) {
      assert.ok(text.trim() && !/98765\d+|<unk>/.test(text), language);
      assert.deepEqual((source.match(/\{\w+\}/g) || []).sort(), (text.match(/\{\w+\}/g) || []).sort(), source);
    }
    const html = render(language);
    for (const key of ['İletişim bilgileri','Kartla güvenli ödeme','Otel rezervasyonun onaylandı']) assert.ok(html.includes(catalogs[language][key]), `${language}: ${key}`);
    assert.ok(!html.includes('İletişim bilgileri') && !html.includes('Otel rezervasyonun onaylandı'), language);
    assert.ok(html.includes('fixture-reference') && html.includes('AYT') && html.includes('FRA'));
    assert.ok(render(language, 'processing').includes(catalogs[language]['Rezervasyonun kontrol ediliyor']));
    assert.ok(render(language, 'confirmed', 'Ad').includes('<strong>Ad</strong>'), 'Reservation references must never be translated');
    assert.ok(html.includes(catalogs[language]['Cüzdan bağlamadan manuel gönder']));
    assert.ok(html.includes('12.345') && html.includes('BNB Chain'));
    const instruction = flowText('{network} ağında tam olarak {amount} {token} gönder. Yanlış ağdaki transfer sistem tarafından kabul edilmez.', language, { network: 'BNB Chain', amount: '12.345', token: 'USDT' });
    for (const value of ['BNB Chain', '12.345', 'USDT']) assert.ok(instruction.includes(value));
    assert.ok(!instruction.includes('{network}'));
    assert.equal(flowText(123, language), 123);
    const object = { price: 100 }; assert.equal(flowText(object, language), object);
    assert.equal(flowText('  İletişim bilgileri ', language), `  ${catalogs[language]['İletişim bilgileri']} `);
  }
  const displayFiles = ['src/pages/TravelCheckout.jsx','src/pages/FlightCheckout.jsx','src/pages/TravelAccount.jsx','src/pages/NotFound.jsx','src/components/ReservationResult.jsx','src/components/StripePayment.jsx','src/components/NuiteeCardPayment/NuiteeCardPayment.jsx','src/components/Flights/FlightSelection.jsx','src/components/CryptoPayment/CryptoPayment.jsx'];
  const literalPattern = /\bui\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const unchanged = new Set(['USDT · USDC · BNB · ETH', 'VoyHaven Secure Payment']);
  for (const file of displayFiles) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(literalPattern)) {
      const token = match[1];
      const value = (token.startsWith('"') ? JSON.parse(token) : token.slice(1, -1).replace(/\\'/g, "'")).trim();
      if (!value || !/[A-Za-zığüşöçİĞÜŞÖÇ]/.test(value) || unchanged.has(value)) continue;
      for (const language of addedLanguages) assert.ok(catalogs[language][value], `${file}: missing ${language} display string: ${value}`);
    }
  }
  assert.equal(flowText('İletişim bilgileri', 'tr'), 'İletişim bilgileri');
  console.log(`Account/payment copy: ${addedLanguages.length} new locales, ${keys.length} strings each; flight checkout, card/crypto instructions and pending reservation-result rendering passed without payment requests.`);
} finally { await rm(temporary, { recursive: true, force: true }); delete globalThis.localStorage; }
