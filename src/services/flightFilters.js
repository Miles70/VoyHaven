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

export function nearbyFlightSearches(search, today) {
 const shift = (value, days) => {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
 };
 return [-1,1,-3,3,-7,7].map(days => ({ ...search, departure: shift(search.departure, days), ...(search.returnDate ? { returnDate: shift(search.returnDate, days) } : {}) })).filter(candidate => candidate.departure >= today);
}
export async function findNearbyFlightOffers(search, today, request, parse, isActive = () => true) {
 const candidates = nearbyFlightSearches(search, today);
 let failure;
 for (let index = 0; index < candidates.length; index += 2) {
  if (!isActive()) return null;
  const pair = candidates.slice(index, index + 2);
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
