# Language support

VoyHaven supports 17 interface and SEO languages. `shared/languages.js` is the common registry for the language picker, browser detection, SEO language URLs, hotel-content translation and server request validation. The existing language-picker order is preserved; the seven additions follow it.

| Language | Code | Native label |
| --- | --- | --- |
| Dutch | `nl` | Nederlands |
| Norwegian Bokmål | `nb` | Norsk bokmål |
| Swedish | `sv` | Svenska |
| Danish | `da` | Dansk |
| Finnish | `fi` | Suomi |
| Japanese | `ja` | 日本語 |
| Korean | `ko` | 한국어 |

Browser `no`/`no-NO` maps to Bokmål. The website and hreflang use `nb`. Language detection also supports regional browser codes such as `nl-NL`, `fi-FI`, `ja-JP` and `ko-KR`. Formatting uses the existing `Intl` currency, number and date paths.

## Static copy

`src/i18n/extended/` contains the seven additional catalogs. They extend every existing translation table, including named flight-message and facility exports, the base travel pages, hotel rates, cancellation details, payment, authentication, About, policies, support and category pages. These are static files; page visitors do not call a translation service for interface copy. Initial machine drafts were edited for booking terminology and SEO copy; the catalogs are not a substitute for a native-language editorial review.

`src/i18n/flowTranslations.js` also localizes previously hard-coded account, checkout, reservation-result and payment-status strings for the seven additions. It translates display strings only; numbers, React elements, objects and payment handlers pass through unchanged. Checkout totals and account dates use the selected locale. Existing dictionaries remain in their original modules. When changing English interface keys, update the corresponding keys in the additional catalogs as well. Do not use an English dictionary as a new locale.

## SEO and hotel content

Each added locale has its own generated home, hotel-search, flight-search, Antalya destination, published hotel profile and flight-route pages. Localized titles, descriptions, guides, destination names and hotel summaries are included in the initial HTML. Reciprocal hreflang includes all 17 languages and `x-default`; canonical links point to the same-language page. The sitemap is generated from those pages.

The three reviewed production hotel snapshots contain all 17 descriptions, preserving the publication gate that requires complete translations. Their original provider descriptions, hashes and fetch dates are retained. Search results and private booking URLs keep their existing indexing rules.

The server accepts the same language registry for hotel information and reviews. Dynamic hotel-description translation requests and cached descriptions use the additional language names; an older cache without a requested language is regenerated through the existing translation service.

## Validation

- `npm run test:localized-flows`: renders flight checkout, card loading and reservation results for all seven additions without provider/payment requests; checks locale catalogs and preserves non-string values.
- `npm run test:languages`: dictionary-key and placeholder parity, nonempty values, locale detection, names and SEO guide coverage.
- `npm run build && npm run test:seo`: generated HTML, canonical URLs, reciprocal alternates, schemas, links, sitemaps and publication gates.
- `npm run test:hotel-ui`: rate disclosure rendering in all supported languages.
- `npm run server:test && npm run test:flight-results`: reservation, payment, hotel and flight regression tests.
- Existing CI browser checks enumerate the expanded dictionaries, including About and policy layouts at mobile widths.
