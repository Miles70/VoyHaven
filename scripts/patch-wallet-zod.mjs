import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

// CDP 1.55 uses Zod 3's single-argument record API once. Zod 4 requires
// an explicit key schema. Apply the same adaptation to both published runtimes.
// Fail installation on unexpected upstream changes rather than silently shipping
// an unadapted SDK. Remove this bridge when CDP officially supports Zod 4.
const require = createRequire(import.meta.url);
const root = resolve(dirname(require.resolve('@coinbase/cdp-sdk')), '..');
const { version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
if (version !== '1.55.0') throw new Error(`Review CDP Zod migration for version ${version}`);
for (const [file, namespace] of [['_esm/policies/evmSchema.js', 'z'], ['_cjs/policies/evmSchema.js', 'zod_2.z']]) {
  const path = resolve(root, file);
  const source = readFileSync(path, 'utf8');
  const before = `types: ${namespace}.record(${namespace}.array(`;
  const after = `types: ${namespace}.record(${namespace}.string(), ${namespace}.array(`;
  if (source.includes(after) && !source.includes(before)) continue;
  if (source.split(before).length !== 2 || source.includes(after)) {
    throw new Error(`Unexpected CDP schema source: ${file}`);
  }
  writeFileSync(path, source.replace(before, after));
}
console.log('CDP ESM/CommonJS typed-data records adapted for Zod 4.');
