import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url)));
const account = `0x${'11'.repeat(20)}`;
const recipient = `0x${'22'.repeat(20)}`;

test('installed wallet tree contains patched validators and no legacy URI decoder', () => {
  for (const [path, pkg] of Object.entries(lock.packages)) {
    assert.ok(!path.endsWith('/decode-uri-component'), path);
    assert.ok(!path.endsWith('/query-string'), path);
    if (path.endsWith('/zod')) assert.equal(pkg.version, '4.6.7', path);
  }
});

for (const path of Object.keys(lock.packages).filter(path => path.endsWith('/@reown/appkit-wallet'))) {
  const schema = await import(pathToFileURL(resolve(path, 'dist/esm/src/W3mFrameSchema.js')));
  test(`${path}: connection, network, signing and transaction schemas preserve payloads`, () => {
    const cases = [
      ['AppSwitchNetworkRequest', { chainId: 56 }],
      ['FrameSwitchNetworkResponse', { chainId: '0x38' }],
      ['FrameGetUserResponse', { address: account, chainId: 1, accounts: [{ address: account, type: 'eoa' }] }],
      ['AppSyncThemeRequest', { themeVariables: { '--w3m-accent': '#123456', '--w3m-z-index': 1000 }, w3mThemeVariables: { color: 'blue' } }],
      ['RpcPersonalSignRequest', { method: 'personal_sign', params: ['0x1234', account] }],
      ['RpcEthSendTransactionRequest', { method: 'eth_sendTransaction', params: [{ from: account, to: recipient, value: '0x1' }] }],
    ];
    for (const [name, payload] of cases) assert.deepEqual(schema[name].parse(payload), payload, name);
    assert.equal(schema.AppSwitchNetworkRequest.safeParse({ chainId: {} }).success, false);
    assert.equal(schema.FrameGetUserResponse.safeParse({ address: account, chainId: 1, accounts: [{ address: 42, type: 'eoa' }] }).success, false);
    assert.equal(schema.RpcPersonalSignRequest.safeParse({ method: 'personal_sign', params: {} }).success, false);
  });
}

const cdpRoot = resolve(dirname(require.resolve('@coinbase/cdp-sdk')), '..');
for (const runtime of ['_esm', '_cjs']) {
  const schemas = await import(pathToFileURL(resolve(cdpRoot, runtime, 'policies/evmSchema.js')));
  test(`CDP ${runtime}: EIP-712 records accept valid types and reject invalid fields`, () => {
    const payload = { type: 'evmTypedDataField', types: { types: { Mail: [{ name: 'recipient', type: 'address' }] }, primaryType: 'Mail' }, conditions: [{ addresses: [recipient], operator: 'in', path: 'recipient' }] };
    assert.deepEqual(schemas.SignEvmTypedDataFieldCriterionSchema.parse(payload), payload);
    const invalid = structuredClone(payload);
    invalid.types.types.Mail[0].name = 123;
    assert.equal(schemas.SignEvmTypedDataFieldCriterionSchema.safeParse(invalid).success, false);
    assert.equal(schemas.EvmTypedAddressConditionSchema.safeParse({ addresses: ['not-an-address'], operator: 'in', path: 'recipient' }).success, false);
  });
}

test('oversized constrained collections stop before validating individual elements', async () => {
  let visits = 0;
  const item = z.string().superRefine(() => { visits++; });
  const schema = z.array(item).max(10);
  const payload = Array(100_000).fill('untrusted');
  assert.equal(schema.safeParse(payload).success, false);
  assert.equal((await schema.safeParseAsync(payload)).success, false);
  assert.equal(visits, 0);
});

test('WalletConnect URI parsing preserves pairing information and tolerates malformed escapes', async () => {
  const { parseUri } = await import('@walletconnect/utils');
  const topic = 'a'.repeat(64), symKey = 'b'.repeat(64);
  const parsed = parseUri(`wc:${topic}@2?relay-protocol=irn&symKey=${symKey}`);
  assert.equal(parsed.topic, topic);
  assert.equal(parsed.symKey, symKey);
  assert.equal(parsed.relay.protocol, 'irn');
  assert.doesNotThrow(() => parseUri(`wc:${topic}@2?relay-protocol=irn&symKey=%zz`));
});
