import { useFlowText } from '../i18n/flowTranslations';
import { useEffect } from 'react';
import { trackTravel } from '../services/analytics';
import { Link } from 'react-router-dom';
export default function ReservationResult({ booking, onRefresh }) {
  const ui = useFlowText();

  const confirmed = booking?.status === 'confirmed';
  useEffect(() => { if (confirmed && booking?.clientReference) trackTravel('booking_confirmed', {}, booking.clientReference); }, [confirmed, booking?.clientReference]);
  const terminal = ['failed', 'expired'].includes(booking?.status);
  const reservation = booking?.reservation || {};
  return <section className="accountCard"><h1>{ui(confirmed ? (booking.kind === 'flight' ? 'Uçuş rezervasyonun onaylandı' : 'Otel rezervasyonun onaylandı') : terminal ? 'Rezervasyon tamamlanamadı' : 'Rezervasyonun kontrol ediliyor')}</h1><p>{ui("VoyHaven referansı: ")}<strong>{ui(booking.clientReference)}</strong></p>{ui(reservation.bookingId && <p>{ui("Rezervasyon numarası: ")}<strong>{ui(reservation.bookingId)}</strong></p>)}{ui(reservation.hotelConfirmationCode && <p>{ui("Otel onay kodu: ")}<strong>{ui(reservation.hotelConfirmationCode)}</strong></p>)}{ui(reservation.bookingRef && <p>{ui("Uçuş referansı: ")}<strong>{ui(reservation.bookingRef)}</strong></p>)}{ui(reservation.airlineLocators?.map((a, i) => <p key={i}>{ui(a.airlineName || a.airlineCode)}: <strong>{ui(a.airlinePnr || a.pnr)}</strong></p>))}{ui(!confirmed && !terminal && <p>{ui("Sağlayıcıdan kesin sonuç bekleniyor. Yeni ödeme yapmadan mevcut rezervasyonun durumunu kontrol edebilirsin.")}</p>)}<div className="accountCardBottom">{ui(!confirmed && onRefresh && <button onClick={onRefresh}>{ui("Durumu kontrol et")}</button>)}<Link to="/account">{ui("Rezervasyonlarım")}</Link><Link to="/support">{ui("Destek")}</Link></div></section>;
}
