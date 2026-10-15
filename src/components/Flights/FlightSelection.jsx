import { useFlowText } from '../../i18n/flowTranslations';
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import FlightCard from './FlightCard';
import { flightRequest } from '../../services/flightsApi';
import { verifiedFlightResult } from '../../services/flightResults';

export default function FlightSelection({ result, copy, language, passengers, onVerified, onClose }) {
  const ui = useFlowText();

  const navigate = useNavigate();
  const dialog = useRef(null);
  const [verified, setVerified] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 70000);
    setVerified(null); setError('');
    onVerified(null);
    flightRequest('/verify', { signal: controller.signal, body: { offerId: result.offer.offerId } })
      .then((payload) => {
        if (!active || controller.signal.aborted) return;
        setVerified(verifiedFlightResult(payload, result));
        onVerified(result.offer.offerId);
      }).catch((err) => {
        if (!active) return;
        setError(err.message === 'OFFER_EXPIRED' ? 'expired' : err.name === 'AbortError' || err.message === 'TIMEOUT' ? 'timeout' : 'verifyError');
      }).finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [result, attempt, onVerified]);
  const terms = verified?.offer.terms;
  const money = (amount, currency) => new Intl.NumberFormat(language, { style: 'currency', currency }).format(amount);
  return <dialog ref={dialog} className="flightSelection" aria-labelledby="flight-selection-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header><h2 id="flight-selection-title">{ui(copy.selectionTitle)}</h2><button type="button" className="flightClose" onClick={onClose} aria-label={ui(copy.back)}><X /></button></header>
    <div aria-live="polite" aria-busy={!verified && !error}>
      {ui(!verified && !error && <p className="flightVerifyStatus"><LoaderCircle className="flightSpin" size={20} />{ui(copy.verifying)}</p>)}
      {ui(error && <p className="flightError" role="alert">{ui(copy[error])}</p>)}
      {ui(verified && <>
        <p className="flightVerified">{ui(copy.verified)}</p>
        {ui(verified.priceChanged && <p className="flightSandbox">{ui(copy.priceChanged)}: <del>{ui(money(result.total, result.currency))}</del> → <strong>{ui(money(verified.total, verified.currency))}</strong></p>)}
        {ui(verified.changes?.messages?.length > 0 && <ul className="flightChanges">{ui(verified.changes.messages.filter((message) => typeof message === 'string').map((message, index) => <li key={index}>{ui(message)}</li>))}</ul>)}
        <FlightCard result={verified} copy={copy} language={language} />
        <section className="flightTerms"><h3>{ui(copy.conditions)}</h3>
          <p>{ui(copy.refund)}: <strong>{ui(terms?.refundable === true ? copy.allowed : terms?.refundable === false ? copy.notAllowed : copy.unknown)}</strong></p>
          <p>{ui(copy.change)}: <strong>{ui(terms?.changeable === true ? copy.allowed : terms?.changeable === false ? copy.notAllowed : copy.unknown)}</strong></p>
          {ui((terms?.summary || []).filter((item) => typeof item.message === 'string').map((item, index) => <p key={index}>{ui(item.message)}</p>))}
        </section>
        <button type="button" className="flightSearchButton" onClick={() => navigate("/flights/checkout", { state: { result: verified, passengers } })}>{ui(language === "tr" ? "Yolcu bilgilerine ve ödemeye geç" : "Continue to passengers and payment")}</button>
      </>)}
    </div>
    <footer>{ui(error && error !== 'expired' && <button type="button" className="flightSearchButton" onClick={() => setAttempt((n) => n + 1)}>{ui(copy.retry)}</button>)}<button type="button" className="flightBackButton" onClick={onClose}>{ui(copy.back)}</button></footer>
  </dialog>;
}
