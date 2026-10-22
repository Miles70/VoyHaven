# Empty flight searches

Live checks on 22 October 2026, one adult / Economy / USD / Turkey point of sale:

| Request | Result |
| --- | --- |
| AYT–UFA, 29/30 October and 5 November 2026 | Valid production response, empty journeys |
| AYT–UFA, 15 June 2027 | One itinerary via DXB |
| AYT–UFA, 15–22 June 2027 round trip | One itinerary |
| UFA–AYT, 22 June 2027 | One itinerary, three offers |
| AYT–LED, 29 October 2026 | 42 itineraries, 80 offers |
| AYT–IST, 29 October 2026 | 104 itineraries, 151 offers |

UFA airport lookup resolves correctly. These checks do not identify the exact user's original date or establish missing airline provisioning; empty supplier inventory cannot be populated by frontend changes.

Recovery now appears for every empty completed search, including Economy. Nearby searches require a click, preserve route/cabin/passengers/point of sale/currency and round-trip duration, reuse bounded two-request concurrency and 12-request continuation, and show the new dates explicitly. No airport or cabin substitution and no separate tickets are constructed. New empty/exhaustion/date-change messages cover all 18 supported languages.

Result parsing preserves valid provider batches even when another batch is malformed, ignores null offers, and uses a priced same-currency cheapestOffer only if no valid detailed offers are available. Malformed-only responses remain errors, rather than false empty availability. Verification and booking continue through the existing offer verification path.

Validation: 65 server tests; 11 flight-result tests; isolated browser fixtures covering Economy empty → nearby recovery → rendered priced offer and date change on one-way/round-trip, desktop/mobile. Existing recorded live China (176), Istanbul (151), St. Petersburg (80), Ufa one-way (1) and Ufa round-trip (1) offer IDs/prices/order match before and after parsing changes. ESLint and production build pass. Browser fixtures intercept all external/API requests and mark analytics as test.

Run UI fixtures with `node scripts/test-flight-recovery-ui.mjs` (optionally set CHROMIUM_EXECUTABLE_PATH).
