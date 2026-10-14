export function airportResults(payload) {
  return (payload?.data || []).flatMap((batch) => batch.airports || [])
    .filter((airport) => /^[A-Z]{3}$/.test(airport.iata));
}
export function flightResults(payload, currency) {
  if (!Array.isArray(payload?.data) || payload.data.some((batch) => !Array.isArray(batch.journeys))) throw new Error('FLIGHT_UNAVAILABLE');
  const results = new Map();
  for (const batch of payload.data) {
    for (const journey of batch.journeys) {
      if (!Array.isArray(journey.segments) || !journey.segments.length || journey.segments.some(segment => !segment || typeof segment !== 'object')) continue;
      for (const offer of journey.offers || []) {
        const price = offer.pricing?.display;
        if (typeof offer.offerId !== 'string' || !offer.offerId || price?.total == null || !Number.isFinite(Number(price.total)) || Number(price.total) <= 0 || price.currency !== currency) continue;
        results.set(offer.offerId, { ...journey, offer, total: Number(price.total), currency: price.currency });
      }
    }
  }
  return [...results.values()].sort((a, b) => a.total - b.total);
}
// Provider timestamps are airport-local. Do not convert them to the viewer's timezone.
export function flightLocalTime(value) {
  return typeof value === 'string' ? value.replace('T', ' ').slice(0, 16) : '—';
}
export function flightStops(segments) {
  return Math.max(0, segments.length - 1) + segments.reduce((sum, segment) => sum + (Number(segment.stopCount) || 0), 0);
}

export function verifiedFlightResult(payload, original) {
  const entry = payload?.data?.[0];
  const journey = entry?.journey;
  const price = journey?.pricing?.display;
  if (!Array.isArray(journey?.segments) || !journey.segments.length || price?.total == null || !Number.isFinite(Number(price.total)) || Number(price.total) <= 0 || !/^[A-Z]{3}$/.test(price.currency || '')) throw new Error('FLIGHT_UNAVAILABLE');
  return {
    ...journey,
    offer: { ...journey, offerId: journey.offerId || original.offer.offerId },
    total: Number(price.total), currency: price.currency,
    priceChanged: Number(price.total) !== original.total || price.currency !== original.currency,
    changes: entry.changes,
  };
}

export function flightDisplayDate(value, language = 'en') {
 if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—';
 const date = new Date(`${value}T12:00:00Z`);
 if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) return '—';
 return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}
