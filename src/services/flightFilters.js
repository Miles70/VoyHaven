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
