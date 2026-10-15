import { useLanguage } from "../i18n/LanguageContext";
import { useFlowText } from '../i18n/flowTranslations';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { flightRequest } from '../services/flightsApi';
import { getTravelReservation } from '../services/hotelsApi';
import StripePayment from '../components/StripePayment';
import ReservationResult from '../components/ReservationResult';
import './TravelAccount.css';
export default function FlightCheckout() {
  const { language } = useLanguage();
  const ui = useFlowText();

  const location = useLocation(), navigate = useNavigate();
  const result = location.state?.result;
  const reference = new URLSearchParams(location.search).get('flightRef');
  const [session, setSession] = useState(null), [booking, setBooking] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [attempt, setAttempt] = useState(0);
  const [price, setPrice] = useState(() => ({ total: result?.total, currency: result?.currency }));
  const counts = location.state?.passengers || { adults: 1, children: 0, infants: 0 };
  const types = [0, 1, 2].flatMap((type, i) => Array.from({ length: Math.min(9, Math.max(0, Number(counts[['adults', 'children', 'infants'][i]]) || 0)) }, () => type));
  useEffect(() => {
    if (!reference) return undefined;
    let active = true, timer;
    let polls = 0;
    async function check(initial = false) {
      setError('');
      try {
        const current = initial
          ? (await flightRequest(`/${encodeURIComponent(reference)}/finalize`, { body: {}, reference })).booking
          : await getTravelReservation(reference);
        if (!active) return;
        setBooking(current);
        if (current.status === 'processing' && ++polls < 30) timer = setTimeout(() => check(), 6000);
      } catch (e) { if (active) setError(e.message); }
    }
    check(true); return () => { active = false; clearTimeout(timer); };
  }, [reference, attempt]);
  async function submit(e) {
    e.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    const values = new FormData(e.currentTarget);
    const contact = Object.fromEntries(['firstName', 'lastName', 'email', 'phoneCountryCode', 'phoneNumber'].map(k => [k, values.get(`contact.${k}`)]));
    const passengers = types.map((type, i) => ({ passengerType: type, ...Object.fromEntries(['firstName', 'lastName', 'birthday', 'gender', 'nationality', 'documentType', 'documentNumber', 'documentIssueCountry', 'documentExpiry'].map(k => [k, ['nationality', 'documentIssueCountry'].includes(k) ? String(values.get(`${i}.${k}`)).toUpperCase() : values.get(`${i}.${k}`)])) }));
    try {
      const payload = await flightRequest('/checkout', { body: { offerId: result.offer.offerId, contact, passengers, acceptedTotal: price.total, acceptedCurrency: price.currency } });
      setSession(payload.paymentSession); setBooking(payload.booking);
    } catch (e) { if (e.code === 'PRICE_CHANGED') setPrice({ total: e.payload.total, currency: e.payload.currency }); setError(e.message); }
    finally { setBusy(false); }
  }
  if (reference) return <main className="travelAccount">{error && <p className="accountError" role="alert">{ui(error)}<button onClick={() => setAttempt(v => v + 1)}>{ui("Tekrar kontrol et")}</button></p>}{booking ? <ReservationResult booking={booking} onRefresh={() => setAttempt(v => v + 1)} /> : !error && <p role="status">{ui("Uçuş rezervasyonun tamamlanıyor…")}</p>}</main>;
  if (!result) return <main className="travelAccount"><h1>{ui("Önce bir uçuş seç.")}</h1><Link to="/flights">{ui("Uçuş ara")}</Link></main>;
  const departure = result.segments?.[0]?.departureTime?.slice(0, 10);
  return <main className="travelAccount"><Link to="/flights">{ui("← Uçuşlara dön")}</Link><section className="accountHero"><div><p className="accountEyebrow">{ui("VOYHAVEN · UÇUŞ REZERVASYONU")}</p><h1>{result.segments?.[0]?.originCode} → {result.segments?.filter(s => s.direction !== 'INBOUND').at(-1)?.destinationCode}</h1><p>{departure} · {types.length}{ui(" yolcu")}</p></div><strong>{new Intl.NumberFormat(language, { style: 'currency', currency: session?.currency || price.currency }).format(session?.amount || price.total)}</strong></section>{error && <p className="accountError" role="alert">{ui(error)}</p>}{session ? <><p>{ui("Güncel toplamı kontrol ederek ödemeyi tamamla. Referans: ")}{booking.clientReference}</p><StripePayment session={session} returnUrl={`${window.location.origin}/flights/checkout?flightRef=${encodeURIComponent(booking.clientReference)}`} /><button className="accountPrimary" onClick={() => navigate(`/flights/checkout?flightRef=${encodeURIComponent(booking.clientReference)}`)}>{ui("Ödeme yaptıysan rezervasyonu kontrol et")}</button></> : <form className="accountForm" style={{ marginTop: 24 }} onSubmit={submit}><fieldset disabled={busy}><h2>{ui("İletişim bilgileri")}</h2><div className="accountPassengerGrid">{[['firstName', 'Ad'], ['lastName', 'Soyad'], ['email', 'E-posta'], ['phoneCountryCode', 'Telefon ülke kodu (90)'], ['phoneNumber', 'Telefon numarası']].map(([key, title]) => <label key={key}>{ui(title)}<input name={`contact.${key}`} type={key === 'email' ? 'email' : 'text'} required maxLength={key === 'email' ? 254 : 100} defaultValue={key === 'phoneCountryCode' ? '90' : ''} /></label>)}</div>{types.map((type, i) => <section key={i}><h2>{i + 1}{ui(". yolcu · ")}{['Yetişkin', 'Çocuk', 'Bebek'][type]}</h2><div className="accountPassengerGrid">{[['firstName', 'Belgedeki ad'], ['lastName', 'Belgedeki soyad'], ['birthday', 'Doğum tarihi'], ['nationality', 'Uyruk ülke kodu (TR)'], ['documentNumber', 'Belge numarası'], ['documentIssueCountry', 'Belgeyi veren ülke kodu (TR)'], ['documentExpiry', 'Belgenin son geçerlilik tarihi']].map(([key, title]) => <label key={key}>{ui(title)}<input name={`${i}.${key}`} required type={['birthday', 'documentExpiry'].includes(key) ? 'date' : 'text'} max={key === 'birthday' ? departure : undefined} min={key === 'documentExpiry' ? departure : undefined} maxLength={['nationality', 'documentIssueCountry'].includes(key) ? 2 : 100} defaultValue={['nationality', 'documentIssueCountry'].includes(key) ? 'TR' : ''} /></label>)}<label>{ui("Cinsiyet")}<select name={`${i}.gender`}><option value="M">{ui("Erkek")}</option><option value="F">{ui("Kadın")}</option></select></label><label>{ui("Belge türü")}<select name={`${i}.documentType`}><option value="passport">{ui("Pasaport")}</option><option value="id_card">{ui("Kimlik kartı")}</option></select></label></div></section>)}<p>{ui("Bilgileri seyahat belgesindeki haliyle gir. Ödeme öncesinde fiyat ve müsaitlik yeniden doğrulanır.")}</p><button className="accountPrimary">{busy ? ui('Uçuş doğrulanıyor…') : ui('Güncel fiyatı onayla ve ödemeye geç')}</button></fieldset></form>}</main>;
}
