# Public legal pages

Routes `/privacy`, `/terms` and `/refund` use `src/i18n/legalTranslations.js` in all ten supported languages. The same titles and introductions supply SEO metadata through `seo/app-policy.js`. Footer labels live in `src/i18n/footerTranslations.js`; information links retain the selected language. Update the policy date in `LegalPage.jsx` when substantive wording changes.

Content reflects the existing account, booking, provider checkout, wallet and analytics implementations. A support request is not provider cancellation confirmation. An irreversible blockchain transfer is distinct from a separately arranged eligible reservation refund. No automatic refund flow, fixed refund deadline or blanket exclusion of statutory rights is promised.

## Outstanding operator details

The verified legal operator name, business contact address and applicable registration details have not been provided. They must be obtained from the owner and added before treating these pages as a complete jurisdiction-specific legal notice. Do not infer them from the brand, a private Gmail forwarding destination or an account profile. The actual purposes/legal grounds, retention schedule, international transfer safeguards and any required analytics consent mechanism also require operator confirmation; descriptive website copy is not a substitute for these controls.

## References checked

- KVKK disclosure obligations: https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-
- LiteAPI cancellation outcomes: https://docs.liteapi.travel/reference/put_bookings-bookingid

## Verification

`npm run test:legal-ui` covers all three policies in all supported languages at 320px and 1280px, including RTL, contents navigation, localized SEO, support destinations and actual footer navigation. Browser/API requests are intercepted and marked as fixtures. Existing hotel browser tests verify card/crypto checkout separately without making real reservations or payments.
