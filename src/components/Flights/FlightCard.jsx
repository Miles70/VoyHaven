import { useState } from 'react';
import flightCopy from '../../i18n/flightTranslations';
import { cabinOfferMessages, cabinAlternativeMessages, nearbyCabinMessages } from '../../i18n/flightFilterTranslations';
import { Plane, Luggage, ChevronDown } from 'lucide-react';
import { flightLocalTime, flightStops } from '../../services/flightResults';
import translations from '../../i18n/flightCardTranslations';
import { flightFareLabel } from '../../services/flightFareLabel';

// These are airport-local wall times; keep the provider's calendar date and clock.
function clock(value) {
  return typeof value === 'string' ? value.match(/[T ](\d{2}:\d{2})/)?.[1] || '—' : '—';
}
function calendar(value, language) {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '—';
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))));
}
function carrier(segment, copy) {
  return segment.carrier?.marketingName || segment.carrier?.marketingCode || copy.unknown;
}
export default function FlightCard({ result, copy, language, onSelect, selected = false, onCabinChange, searchedCabin }) {
  const [nearbyBusy, setNearbyBusy] = useState(false);
  const [cabinBusy, setCabinBusy] = useState(false);
  const [cabinError, setCabinError] = useState('');
  const cabinLabels = flightCopy[language] || flightCopy.en;
  const cabinMessages = cabinOfferMessages[language] || cabinOfferMessages.en;
  async function changeCabin(value) {
    setCabinBusy(true); setNearbyBusy(false); setCabinError('');
    try { await onCabinChange(result, value, () => setNearbyBusy(true)); } catch (error) { setCabinError(error.message === 'NO_NEARBY_CABIN_OFFER' ? (nearbyCabinMessages[language] || nearbyCabinMessages.en)[2] : error.message === 'NO_ROUTE_CABIN_OFFER' ? (cabinAlternativeMessages[language] || cabinAlternativeMessages.en)[0] : error.message === 'NO_CABIN_OFFER' ? cabinMessages[0] : copy.error); } finally { setCabinBusy(false); }
  }
  const labels = translations[language] || translations.en;
  const money = new Intl.NumberFormat(language, { style: 'currency', currency: result.currency }).format(result.total);
  const bags = result.offer.baggage?.included || [];
  const legs = ['OUTBOUND', 'INBOUND'].map(direction => ({ direction, segments: result.segments.filter(segment => (segment.direction || 'OUTBOUND') === direction) })).filter(leg => leg.segments.length);
  return <article className={`flightCard${selected ? ' flightCardSelected' : ''}`}>
    <div className="flightItinerary">
      {legs.map(({ direction, segments }) => {
        const first = segments[0];
        const last = segments.at(-1);
        const stops = flightStops(segments);
        const carriers = [...new Set(segments.map(segment => carrier(segment, copy)))];
        const connections = [...new Set(segments.slice(0, -1).map(segment => segment.destinationCode).filter(Boolean))];
        return <section className="flightLeg" key={direction}>
          <div className="flightLegHeading"><strong><Plane size={15} aria-hidden="true" />{direction === 'OUTBOUND' ? copy.outbound : copy.inbound}</strong><span className={`flightStopBadge${stops === 0 ? ' flightStopBadge--direct' : ''}`}>{stops === 0 ? copy.nonstop : `${copy.stops}: ${stops}`}</span></div>
          <p className="flightCarrier">{carriers.join(' · ')}</p>
          <div className="flightSummaryRoute" dir="ltr">
            <div className="flightEndpoint"><time>{clock(first.departureTime)}</time><strong>{first.originCode}</strong><small>{calendar(first.departureTime, language)}</small><span title={first.originName}>{first.originName}</span></div>
            <div className="flightRouteLine"><span><i /><Plane size={18} aria-hidden="true" /><i /></span>{connections.length > 0 && <small>{labels.connections}: {connections.join(' · ')}</small>}</div>
            <div className="flightEndpoint flightEndpoint--arrival"><time>{clock(last.arrivalTime)}</time><strong>{last.destinationCode}</strong><small>{calendar(last.arrivalTime, language)}</small><span title={last.destinationName}>{last.destinationName}</span></div>
          </div>
        </section>;
      })}
      <details className="flightCardDetails"><summary><span><ChevronDown size={17} aria-hidden="true" />{labels.details}</span><span><Luggage size={16} aria-hidden="true" />{labels.baggageDetails}</span></summary>
        <div className="flightExpandedContent">
          {legs.map(({ direction, segments }) => <section key={direction} className="flightDetailLeg"><h3>{direction === 'OUTBOUND' ? copy.outbound : copy.inbound}</h3>{segments.map((segment, index) => <div className="flightSegment" key={segment.segmentKey || index}>
            <p className="flightCarrier"><Plane size={16} aria-hidden="true" />{carrier(segment, copy)} · {[segment.carrier?.marketingCode, segment.flight?.marketingNumber].filter(Boolean).join(' ')}</p>
            <div className="flightRoute" dir="ltr"><div><strong>{segment.originCode}</strong><time>{flightLocalTime(segment.departureTime)}</time><small>{segment.originName}</small></div><Plane size={18} aria-hidden="true" /><div><strong>{segment.destinationCode}</strong><time>{flightLocalTime(segment.arrivalTime)}</time><small>{segment.destinationName}</small></div></div>
            {Number(segment.stopCount) > 0 && <small>{copy.stops}: {segment.stopCount} {(segment.stops || []).map(stop => stop.airportCode).join(', ')}</small>}
          </div>)}</section>)}
          <div className="flightBaggage"><Luggage size={18} aria-hidden="true" /><div><strong>{copy.baggage}</strong>{bags.length ? bags.map((bag, index) => <small key={index}>{bag.description || `${bag.pieces ?? '—'} × ${bag.weightKg ?? '—'} kg`}</small>) : <small>{copy.unknown}</small>}</div></div>
        </div>
      </details>
    </div>
    <div className="flightPrice">{onCabinChange && <label className="flightCardCabin">{copy.cabin}<select aria-label={copy.cabin} disabled={cabinBusy} value={result.requestedCabin || searchedCabin || 'ECONOMY'} onChange={event => changeCabin(event.target.value)}>{[['ECONOMY','economy'], ['PREMIUM_ECONOMY','premium'], ['BUSINESS','business'], ['FIRST','first']].map(([value,key]) => <option key={value} value={value}>{cabinLabels[key]}</option>)}</select></label>}{cabinBusy && <small role="status">{nearbyBusy ? (nearbyCabinMessages[language] || nearbyCabinMessages.en)[0] : cabinMessages[1]}</small>}{cabinError && <small role="alert">{cabinError}</small>}{result.offer.fare?.family && <small className="flightFareBadge">{flightFareLabel(result.offer.fare.family, language)}</small>}<strong>{money}</strong><span>{copy.total}</span>{onSelect && <button type="button" className="flightSearchButton" disabled={cabinBusy} aria-pressed={selected} onClick={() => onSelect(result)}>{selected ? copy.selected : copy.select}</button>}</div>
  </article>;
}
