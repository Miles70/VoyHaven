import FlightOfferDetails from './FlightOfferDetails';
import detailLabels from '../../i18n/flightDetailLabels';
import { useState } from 'react';
import flightCopy from '../../i18n/flightTranslations';
import { cabinOfferMessages, cabinAlternativeMessages, nearbyCabinMessages, flexibleDateLabels, flightAuditMessages } from '../../i18n/flightFilterTranslations';
import { Plane, Luggage, ChevronDown, Info, LoaderCircle } from 'lucide-react';
import { flightLocalTime, flightStops, flightDisplayDate } from '../../services/flightResults';
import { flightOfferCabin } from '../../services/flightFilters';
import translations from '../../i18n/flightCardTranslations';
import { flightFareLabel } from '../../services/flightFareLabel';

// These are airport-local wall times; keep the provider's calendar date and clock.
function clock(value) {
  return typeof value === 'string' ? value.match(/[T ](\d{2}:\d{2})/)?.[1] || '—' : '—';
}
function calendar(value, language) {
  return flightDisplayDate(typeof value === 'string' ? value.slice(0,10) : null, language);
}

function carrier(segment, copy) {
  return segment.carrier?.marketingName || segment.carrier?.marketingCode || copy.unknown;
}
export default function FlightCard({ result, copy, language, onSelect, selected = false, onCabinChange }) {
  const [checkedDates, setCheckedDates] = useState([]);
  const [nearbyBusy, setNearbyBusy] = useState(false);
  const [cabinBusy, setCabinBusy] = useState(false);
  const [cabinError, setCabinError] = useState('');
  const cabinLabels = flightCopy[language] || flightCopy.en;
  const cabinMessages = cabinOfferMessages[language] || cabinOfferMessages.en;
  async function changeCabin(value) {
    setCabinBusy(true); setNearbyBusy(false); setCheckedDates([]); setCabinError('');
    try { await onCabinChange(result, value, dates => { setNearbyBusy(true); if (dates) setCheckedDates(dates); }); } catch (error) { if (error.name === 'AbortError') return; setCabinError(error.message === 'SCAN_PAUSED' ? (flightAuditMessages[language] || flightAuditMessages.en)[0] : error.message === 'NO_NEARBY_CABIN_OFFER' ? (nearbyCabinMessages[language] || nearbyCabinMessages.en)[2] : error.message === 'NO_ROUTE_CABIN_OFFER' ? (cabinAlternativeMessages[language] || cabinAlternativeMessages.en)[0] : error.message === 'NO_CABIN_OFFER' ? cabinMessages[0] : copy.error); } finally { setCabinBusy(false); }
  }
  const actualCabin = flightOfferCabin(result);
  const auditCopy = flightAuditMessages[language] || flightAuditMessages.en;
  const labels = translations[language] || translations.en;
  const money = new Intl.NumberFormat(language, { style: 'currency', currency: result.currency }).format(result.total);
  const extraLabels = detailLabels[language] || detailLabels.en;
  const legs = ['OUTBOUND', 'INBOUND'].map(direction => ({ direction, segments: result.segments.filter(segment => (segment.direction || 'OUTBOUND') === direction) })).filter(leg => leg.segments.length);
  return <article className={`flightCard${selected ? ' flightCardSelected' : ''}`}>
    {(cabinError || cabinBusy) && <div className="flightCardNotice" role={cabinError ? 'alert' : 'status'}>{cabinBusy ? <LoaderCircle size={21} className="flightSpin" aria-hidden="true" /> : <Info size={21} aria-hidden="true" />}<div><p>{cabinError || (nearbyBusy ? (nearbyCabinMessages[language] || nearbyCabinMessages.en)[0] : cabinMessages[1])}</p>{cabinBusy && nearbyBusy && checkedDates.length > 0 && <strong>{(flexibleDateLabels[language] || flexibleDateLabels.en)[5]}: {checkedDates.map(date => flightDisplayDate(date, language)).join(' · ')}</strong>}</div></div>}
    <div className="flightItinerary">
      {legs.map(({ direction, segments }) => {
        const first = segments[0];
        const last = segments[segments.length - 1];
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
      <FlightOfferDetails result={result} copy={copy} language={language} summary />
      <details className="flightCardDetails"><summary><span><ChevronDown size={17} aria-hidden="true" />{labels.details}</span><span><Luggage size={16} aria-hidden="true" />{labels.baggageDetails}</span></summary>
        <div className="flightExpandedContent">
          {legs.map(({ direction, segments }) => <section key={direction} className="flightDetailLeg"><h3>{direction === 'OUTBOUND' ? copy.outbound : copy.inbound}</h3>{segments.map((segment, index) => <div className="flightSegment" key={segment.segmentKey || index}>
            <p className="flightCarrier"><Plane size={16} aria-hidden="true" />{carrier(segment, copy)} · {[segment.carrier?.marketingCode, segment.flight?.marketingNumber].filter(Boolean).join(' ')}</p>
            <div className="flightRoute" dir="ltr"><div><strong>{segment.originCode}</strong><time>{flightLocalTime(segment.departureTime)}</time><small>{segment.originName}</small></div><Plane size={18} aria-hidden="true" /><div><strong>{segment.destinationCode}</strong><time>{flightLocalTime(segment.arrivalTime)}</time><small>{segment.destinationName}</small></div></div>
            {Number.isFinite(segment.duration?.minutes) && segment.duration.minutes > 0 && <p>{extraLabels.duration}: {Math.floor(segment.duration.minutes / 60)}:{String(segment.duration.minutes % 60).padStart(2, '0')}</p>}
            {segment.carrier?.operatingName && segment.carrier.operatingName !== segment.carrier.marketingName && <p>{extraLabels.operated}: {segment.carrier.operatingName}</p>}
            {Number(segment.stopCount) > 0 && <small>{copy.stops}: {segment.stopCount} {(segment.stops || []).map(stop => stop.airportCode).join(', ')}</small>}
          </div>)}</section>)}
          <FlightOfferDetails result={result} copy={copy} language={language} />
        </div>
      </details>
    </div>
    <div className="flightPrice">{onCabinChange && <label className="flightCardCabin">{copy.cabin}<select aria-label={copy.cabin} disabled={cabinBusy} value={actualCabin || ''} onChange={event => changeCabin(event.target.value)}>{!actualCabin && <option value="">{auditCopy[3]}</option>}{actualCabin === 'MIXED' && <option value="MIXED" disabled>{auditCopy[2]}</option>}{[['ECONOMY','economy'], ['PREMIUM_ECONOMY','premium'], ['BUSINESS','business'], ['FIRST','first']].map(([value,key]) => <option key={value} value={value}>{cabinLabels[key]}</option>)}</select></label>}{result.offer.fare?.family && <small className="flightFareBadge">{flightFareLabel(result.offer.fare.family, language)}</small>}<strong>{money}</strong><span>{copy.total}</span>{onSelect && <button type="button" className="flightSearchButton" disabled={cabinBusy} aria-pressed={selected} onClick={() => onSelect(result)}>{selected ? copy.selected : copy.select}</button>}</div>
  </article>;
}
