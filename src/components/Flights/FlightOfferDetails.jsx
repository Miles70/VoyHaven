import { flightSupplierText } from '../../services/flightSupplierText';
import detailLabels from '../../i18n/flightDetailLabels';
import { baggageRows, baggageText } from '../../services/flightBaggage';

export default function FlightOfferDetails({ result, copy, language, summary = false }) {
 const labels = detailLabels[language] || detailLabels.en;
 const bags = baggageRows(result.offer.baggage?.included);
 const paid = baggageRows(result.offer.baggage?.paid);
 const terms = result.offer.terms;
 const status = value => value === true ? copy.allowed : value === false ? copy.notAllowed : copy.unknown;
 const money = (value, currency) => value != null && value !== '' && Number.isFinite(Number(value)) && /^[A-Z]{3}$/.test(currency || '') ? new Intl.NumberFormat(language, { style: 'currency', currency }).format(Number(value)) : '';
 const fee = value => {
  if (!value || typeof value !== 'object') return '';
  const price = value.pricing?.display;
  const amount = money(price?.amount ?? value.amount, price?.currency || value.currency);
  const percent = value.percent != null && Number.isFinite(Number(value.percent)) ? `${value.percent}%` : '';
  return [amount, percent].filter(Boolean).join(' + ');
 };
 const scope = bag => {
  const passenger = { ADT: copy.adults, adult: copy.adults, CHD: copy.children, child: copy.children, INF: copy.infants, infant: copy.infants }[bag.passengerType];
  const segment = result.segments.find(item => item.segmentKey && item.segmentKey === bag.segmentKey);
  return [passenger, segment && `${segment.originCode} → ${segment.destinationCode}`].filter(Boolean).join(' · ');
 };
 const bagLine = (bag, index) => <li key={index}>{baggageText(bag, labels, language)}{scope(bag) && <small>{scope(bag)}</small>}</li>;
 if (summary) return <div className="flightBaggageSummary"><strong>{copy.baggage}</strong><ul>{bags.length ? bags.map(bagLine) : <li>{labels.unspecified}</li>}</ul></div>;
 return <div className="flightOfferDetails">
  {Number.isInteger(result.offer.fare?.seatsRemaining) && result.offer.fare.seatsRemaining >= 0 && <p>{labels.seats}: <strong>{result.offer.fare.seatsRemaining}</strong></p>}
  <section><h4>{copy.conditions}</h4><p>{copy.refund}: <strong>{status(terms?.refundable)}</strong>{fee(terms?.refundFee) && <> · {labels.fee}: {fee(terms.refundFee)}</>}</p><p>{copy.change}: <strong>{status(terms?.changeable)}</strong>{fee(terms?.changeFee) && <> · {labels.fee}: {fee(terms.changeFee)}</>}</p>{Array.isArray(terms?.summary) && terms.summary.filter(item => typeof item?.message === 'string').map((item, index) => <p key={index}>{flightSupplierText(item.message, language)}</p>)}</section>
  {paid.length > 0 && <details className="flightPaidBaggage"><summary>{labels.paid} ({paid.length})</summary><ul>{paid.map((bag, index) => { const price = bag.pricing?.display; return <li key={index}>{baggageText(bag, labels, language)} · {money(price?.amount, price?.currency) || labels.unspecified}{scope(bag) && <small>{scope(bag)}</small>}</li>; })}</ul></details>}
 </div>;
}
