# Wallet dependency security migration

This migration removes the vulnerable URI decoder by upgrading the pinned
WalletConnect Ethereum provider from 2.21.1 to 2.26.0. Its supported utilities
no longer depend on query-string/decode-uri-component. It also removes obsolete
nested Viem/Abitype/Zod copies. No URL-parser module-format override is needed.

Reown's wallet schemas and Coinbase CDP still declare Zod 3. Scoped overrides
move these consumers to Zod 4.6.7, which fixes GHSA-mrhx-c7xc-m3w5. CDP's Abitype
is upgraded to 1.3.0, which supports Zod 4. Reown uses the retained APIs; both
installed Reown copies are covered by schema regression tests.

CDP 1.55.0 has one Zod 3-only record call. `scripts/patch-wallet-zod.mjs` adds the
explicit string key schema in its ESM and CommonJS distributions on npm install
and npm ci. It is idempotent and fails installation for an unexpected version or
source pattern. CDP is pinned until this adaptation can be removed in favor of
upstream Zod 4 support. Do not install with --ignore-scripts for frontend builds.
This is a runtime JavaScript compatibility bridge, not an upstream CDP release.

Tests cover typed-data records, ABI address validation, connection/network/signing
schemas, early rejection of oversized constrained collections, and WalletConnect
pairing URI parsing. Browser tests mount the real CryptoPayment component and
production Wagmi/AppKit configuration against a synthetic EIP-1193 provider.
They verify modal opening, connection, network switching, user rejection, exact
native and ERC-20 recipient/amount, receipt handling and payment verification.
All external requests are intercepted, and analytics uses the fixture marker.
No real wallet signature, relay pairing, booking or blockchain payment is made.

The audit threshold remains unchanged; no advisories are allowlisted. Re-run
`npm ci`, `npm run test:wallet-security`, `npm run test:wallet-e2e`, and
`npm run security:check` when updating these overrides. The complete existing CI
suite also runs before release.
