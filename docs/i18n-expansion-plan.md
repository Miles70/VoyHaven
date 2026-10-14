# VoyHaven: 14-language rollout

Existing: en, tr, ru, ar, zh, es, pt, fr, de, it.
New: nb (Norwegian Bokmal), sv (Swedish), nl (Dutch), da (Danish).

Audit targets: LanguageContext, LanguageSwitcher, all locale dictionaries, hotel and flight booking, checkout and payments, emails, SEO copy and hotel descriptions.

Important: seo/model.js requires hotel descriptions in every supported SEO language. Translate the existing catalog before enabling new SEO locales, or hotel pages could disappear.

Tests: translation key coverage, booking and payment screens, emails, canonical and hreflang (15 entries), sitemap and build. No production activation before completion.
