import { flightStops } from './flightResults.js';
export function flightRefundStatus(result) {
 const refundable = result.offer?.terms?.refundable;
 if (refundable === false) return 'nonRefundable';
 if (refundable === true) {
  const fee = result.offer?.terms?.refundFee;
  const amount = Number(fee?.pricing?.display?.amount ?? fee?.amount ?? 0);
  const percent = Number(fee?.percent ?? 0);
  return amount > 0 || percent > 0 ? 'partial' : 'refundable';
 }
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
 const daysToCheck = Math.min(30, Math.max(1, Math.floor(Number(range) || 30)));
 const offsets = Array.from({ length: Math.ceil(daysToCheck / 2) }, (_, index) => index + 1).flatMap(days => [-days, days]).slice(0, daysToCheck);
 return offsets.map(days => ({ ...search, departure: shift(search.departure, days), ...(search.returnDate ? { returnDate: shift(search.returnDate, days) } : {}) })).filter(candidate => candidate.departure >= today && (candidate.returnDate || candidate.departure) <= maxDate);
}
export async function findNearbyFlightOffers(search, today, request, parse, isActive = () => true, range = 30, onProgress = () => {}, startCursor = 0, requestBudget = 12) {
 const candidates = nearbyFlightSearches(search, today, range);
 let failure;
 const end = Math.min(candidates.length, startCursor + requestBudget);
 for (let index = startCursor; index < end; index += 2) {
  if (!isActive()) return null;
  const pair = candidates.slice(index, Math.min(index + 2, end));
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
 return end < candidates.length ? { paused: true, cursor: end, search } : null;
}

export function flightOfferCabin(result) {
 const normalize = value => {
  const token = String(value || '').toUpperCase().replace(/[ -]/g, '_');
  return { ECONOMY:'ECONOMY', PREMIUM_ECONOMY:'PREMIUM_ECONOMY', BUSINESS:'BUSINESS', BUSINESS_CLASS:'BUSINESS', FIRST:'FIRST', FIRST_CLASS:'FIRST' }[token];
 };
 const fares = result.offer?.segmentFares;
 if (Array.isArray(fares) && fares.length) {
  const cabins = fares.map(fare => normalize(fare.cabin));
  if (cabins.some(cabin => !cabin)) return null;
  return new Set(cabins).size === 1 ? cabins[0] : 'MIXED';
 }
 return normalize(result.offer?.cabinClass) || null;
}
