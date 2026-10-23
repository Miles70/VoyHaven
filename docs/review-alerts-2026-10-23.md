# Review notification follow-up — 23 October 2026

Historical review comments are checked against current code, not applied blindly.

## Fixed in this follow-up

- #49: preserve 502 for malformed upstream hotel catalog responses.
- #45: reject flight batches containing only malformed journeys; retain valid partial batches and genuine empty availability.
- #42/#43: separate full reset history from visitor removal history and provide seek pagination for both, including UI controls for older archives.
- #42: claim crypto verification before blockchain requests. An active claim prevents reset; paid state is committed atomically for the claim owner. Failed attempts release the claim and abandoned claims expire.
- #42: preserve operational documents modified after the preview cutoff.
- #41: version normal analytics fixtures while retaining an explicitly unversioned legacy record.
- #33: create the flight checkout payment-ready attribution binding, and discard unverifiable queued admin events without blocking later visitor events.
- #27: require review of newly supplied booking conditions.
- #17: keep displayed hotel stay criteria, detail links and checkout state tied to the completed search, including when the form changes while results remain visible.

## Already addressed in current code

- #53: hotel results are hidden outside the Hotels tab (#54).
- #40: Polish available-room, twin-bed and flight-connection labels are corrected.
- #38: crypto UI uses localized flow strings and the pending booking status exists in the additional locale catalogs.
- #35: language selection is preserved by the current language/navigation policy.
- #34: search parameters have noindex rules; general pages have route-specific metadata; hotel refresh checks all updated public facts.
- #28: checkout return link uses the confirmed hotel ID.
- #19: the hero uses the repository-hosted video.
- Old CJ dropshipping comments target functionality removed from the travel-only application; no CJ functionality was reintroduced.

## Validation

ESLint, production build, server tests, flight-result tests, 18-language coverage, localized checkout flows and SEO validation pass. Intercepted local browser tests verify mobile/desktop tab switching and unchanged offer criteria, older reset/visitor history loading, and analytics queue recovery. All browser fixtures carry the analytics test marker and make no production provider or payment requests.

The Mongo-backed analytics E2E fixture was corrected; its complete database/browser run is delegated to the existing CI Mongo service because no local Mongo daemon is installed. No production data was reset, restored or deleted during this follow-up.
