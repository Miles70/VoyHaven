import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { markAnalyticsTest } from './analytics-test-context.mjs';

const account = `0x${'11'.repeat(20)}`, recipient = `0x${'22'.repeat(20)}`;
const hash = `0x${'aa'.repeat(32)}`;
const server = await createServer({ server: { host: '127.0.0.1', port: 5178, strictPort: true }, define: { 'import.meta.env.VITE_REOWN_PROJECT_ID': JSON.stringify('00000000000000000000000000000000') } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
  for (const asset of ['native', 'erc20']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await markAnalyticsTest(context, { fixture: true });
    await context.addInitScript(({ account, hash }) => {
      let chainId = '0x1';
      const listeners = new Map();
      globalThis.walletCalls = [];
      globalThis.rejectWalletTransaction = true;
      globalThis.ethereum = {
        isMetaMask: true,
        on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); },
        removeListener(event, fn) { listeners.get(event)?.delete(fn); },
        async request({ method, params }) {
          globalThis.walletCalls.push({ method, params });
          if (method === 'eth_chainId') return chainId;
          if (method === 'eth_accounts' || method === 'eth_requestAccounts') return [account];
          if (method === 'wallet_requestPermissions' || method === 'wallet_getPermissions') return [{ parentCapability: 'eth_accounts' }];
          if (method === 'wallet_switchEthereumChain') {
            chainId = params[0].chainId;
            for (const fn of listeners.get('chainChanged') || []) fn(chainId);
            return null;
          }
          if (method === 'eth_sendTransaction') {
            if (globalThis.rejectWalletTransaction) throw Object.assign(new Error('User rejected request'), { code: 4001 });
            return hash;
          }
          if (method === 'eth_getBalance') return '0xde0b6b3a7640000';
          if (method === 'eth_estimateGas') return '0x186a0';
          if (method === 'eth_gasPrice') return '0x3b9aca00';
          throw new Error(`Unexpected wallet request: ${method}`);
        },
      };
    }, { account, hash });
    await context.routeWebSocket('**/*', socket => {
      if (new URL(socket.url()).hostname === '127.0.0.1') socket.connectToServer();
      else socket.close();
    });
    // Never contact live APIs, analytics, WalletConnect relays, or blockchains.
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1' && url.pathname.startsWith('/api/')) return route.fulfill({ contentType: 'application/json', body: '{}' });
      if (url.hostname === '127.0.0.1') return route.continue();
      let body;
      try { body = route.request().postDataJSON(); } catch { /* Not JSON-RPC. */ }
      if (body && (body.method || Array.isArray(body))) {
        const reply = request => {
          let result = null;
          if (request.method === 'eth_chainId') result = '0x38';
          if (request.method === 'eth_call') result = `0x${(10n ** 18n).toString(16).padStart(64, '0')}`;
          if (request.method === 'eth_getBalance') result = '0xde0b6b3a7640000';
          if (request.method === 'eth_blockNumber') result = '0x10';
          if (request.method === 'eth_getTransactionReceipt') result = { transactionHash: hash, transactionIndex: '0x0', blockHash: `0x${'bb'.repeat(32)}`, blockNumber: '0x10', from: account, to: recipient, cumulativeGasUsed: '0x5208', gasUsed: '0x5208', contractAddress: null, logs: [], logsBloom: `0x${'00'.repeat(256)}`, status: '0x1', effectiveGasPrice: '0x1', type: '0x0' };
          return { jsonrpc: '2.0', id: request.id, result };
        };
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(Array.isArray(body) ? body.map(reply) : reply(body)) });
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ planLimits: { tier: 'free' }, data: [] }) });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:5178/scripts/fixtures/wallet-security.html?asset=${asset}`);
    await page.getByRole('button', { name: 'Connect Wallet', exact: true }).click();
    await page.locator('w3m-modal.open').waitFor({ state: 'visible' });
    await page.evaluate(() => globalThis.walletFixture.connect());
    await page.locator('w3m-modal.open').waitFor({ state: 'hidden' });
    const pay = page.getByRole('button', { name: `Pay 1 ${asset === 'native' ? 'BNB' : 'USDT'}`, exact: true });
    await pay.click();
    await page.getByText('The wallet request was cancelled.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => globalThis.walletFixture.verified.length), 0);
    await page.evaluate(() => { globalThis.rejectWalletTransaction = false; });
    await pay.click();
    await page.locator('.cryptoPaymentHashPaid').waitFor({ timeout: 30000 });
    const { calls, verified } = await page.evaluate(() => ({ calls: globalThis.walletCalls, verified: globalThis.walletFixture.verified }));
    assert.ok(calls.some(call => call.method === 'wallet_switchEthereumChain' && call.params[0].chainId === '0x38'));
    const transaction = calls.filter(call => call.method === 'eth_sendTransaction').at(-1).params[0];
    assert.equal(transaction.from.toLowerCase(), account);
    if (asset === 'native') {
      assert.equal(transaction.to.toLowerCase(), recipient);
      assert.equal(BigInt(transaction.value), 10n ** 18n);
    } else {
      assert.equal(transaction.to.toLowerCase(), `0x${'33'.repeat(20)}`);
      assert.ok(transaction.data.startsWith('0xa9059cbb'));
      assert.equal(transaction.data.slice(10, 74), recipient.slice(2).padStart(64, '0'));
      assert.equal(BigInt(`0x${transaction.data.slice(74)}`), 10n ** 18n);
    }
    assert.equal(verified.length, 1);
    assert.equal(verified[0].transactionHash, hash);
    assert.equal(verified[0].payerAddress, account);
    await page.evaluate(() => globalThis.walletFixture.disconnect());
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`Wallet ${asset}: connect modal, injected connection, chain switch, rejection, exact transfer, receipt and verification passed.`);
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}
