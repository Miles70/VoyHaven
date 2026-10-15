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
  return <section className="accountCard"><h1>{confirmed ? (booking.kind === 'flight' ? ui('Uçuş rezervasyonun onaylandı') : ui('Otel rezervasyonun onaylandı')) : terminal ? ui('Rezervasyon tamamlanamadı') : ui('Rezervasyonun kontrol ediliyor')}</h1><p>{ui("VoyHaven referansı: ")}<strong>{booking.clientReference}</strong></p>{reservation.bookingId && <p>{ui("Rezervasyon numarası: ")}<strong>{reservation.bookingId}</strong></p>}{reservation.hotelConfirmationCode && <p>{ui("Otel onay kodu: ")}<strong>{reservation.hotelConfirmationCode}</strong></p>}{reservation.bookingRef && <p>{ui("Uçuş referansı: ")}<strong>{reservation.bookingRef}</strong></p>}{reservation.airlineLocators?.map((a, i) => <p key={i}>{a.airlineName || a.airlineCode}: <strong>{a.airlinePnr || a.pnr}</strong></p>)}{!confirmed && !terminal && <p>{ui("Sağlayıcıdan kesin sonuç bekleniyor. Yeni ödeme yapmadan mevcut rezervasyonun durumunu kontrol edebilirsin.")}</p>}<div className="accountCardBottom">{!confirmed && onRefresh && <button onClick={onRefresh}>{ui("Durumu kontrol et")}</button>}<Link to="/account">{ui("Rezervasyonlarım")}</Link><Link to="/support">{ui("Destek")}</Link></div></section>;
}
