import { flightStops } from './flightResults.js';
export function flightRefundStatus(result) {
 const refundable = result.offer?.terms?.refundable;
 if (refundable === false) return 'nonRefundable';
 const name = result.offer?.fare?.family || '';
 if (/partially[\s_-]+refundable/i.test(name)) return 'partial';
 if (refundable === true) return 'refundable';
 if (/(?:non[\s_-]?refundable|not[\s_-]+refundable)/i.test(name)) return 'nonRefundable';
 if (/\brefundable\b/i.test(name)) return 'refundable';
 return 'unknown';
}
export function filterFlightResults(results, { sort = 'low', refund = 'all', stops = 'all' } = {}) {
 return results.filter(result => {
  if (refund !== 'all' && flightRefundStatus(result) !== refund) return false;
  if (stops !== 'all') {
   const legs = ['OUTBOUND','INBOUND'].map(direction => result.segments.filter(segment => (segment.direction || 'OUTBOUND') === direction)).filter(segments => segments.length);
   if (legs.some(segments => flightStops(segments) > Number(stops))) return false;
  }
  return true;
 }).sort((a,b) => sort === 'high' ? b.total - a.total : a.total - b.total);
}

export function matchingFlightOffer(results, original) {
 const signature = result => JSON.stringify(result.segments.map(segment => [segment.direction || 'OUTBOUND', segment.originCode, segment.destinationCode, segment.departureTime, segment.carrier?.marketingCode, segment.flight?.marketingNumber]));
 return results.find(result => signature(result) === signature(original));
}

export function nearbyFlightSearches(search, today, range = 30) {
 const shift = (value, days) => {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
 };
 const limit = new Date(`${today}T12:00:00Z`); limit.setUTCMonth(limit.getUTCMonth() + 11);
 const maxDate = limit.toISOString().slice(0,10);
 const offsets = Array.from({ length: Math.min(335, Math.max(1, Number(range) || 30)) }, (_, index) => index + 1).flatMap(days => [-days, days]);
 return offsets.map(days => ({ ...search, departure: shift(search.departure, days), ...(search.returnDate ? { returnDate: shift(search.returnDate, days) } : {}) })).filter(candidate => candidate.departure >= today && (candidate.returnDate || candidate.departure) <= maxDate);
}
export async function findNearbyFlightOffers(search, today, request, parse, isActive = () => true, range = 30, onProgress = () => {}) {
 const candidates = nearbyFlightSearches(search, today, range);
 let failure;
 for (let index = 0; index < candidates.length; index += 2) {
  if (!isActive()) return null;
  const pair = candidates.slice(index, index + 2);
  onProgress(pair.map(candidate => candidate.departure));
  const responses = await Promise.allSettled(pair.map(async candidate => ({ search: candidate, offers: parse(await request(candidate)) })));
  let found;
  for (const response of responses) {
   if (response.status === 'rejected') failure = response.reason;
   else if (!found && response.value.offers.length) found = response.value;
  }
  if (!isActive()) return null;
  if (found) return found;
  if (failure) throw failure;
 }
 return null;
}
