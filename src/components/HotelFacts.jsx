import { Clock, MapPin } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import "./HotelFacts.css";

export function hotelFacts(hotel = {}) {
  const clock = (value) => {
    if (typeof value !== "string") return null;
    const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    if (minute > 59 || (match[3] ? hour < 1 || hour > 12 : hour > 23)) return null;
    if (match[3]) hour = hour % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };
  const times = hotel.checkinCheckoutTimes || {};
  const location = hotel.location || hotel;
  const validCoordinate = (value, limit) => value !== null && value !== undefined && String(value).trim() !== "" && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit;
  const map = validCoordinate(location.latitude, 90) && validCoordinate(location.longitude, 180)
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${Number(location.latitude)},${Number(location.longitude)}`)}` : null;
  return { checkin: clock(times.checkinStart || times.checkin), checkout: clock(times.checkout), map };
}

export default function HotelFacts({ hotel }) {
  const { t } = useLanguage();
  const facts = hotelFacts(hotel);
  if (!facts.checkin && !facts.checkout && !facts.map) return null;
  return (
    <section className="hotelFacts" aria-label={t("hotelFacts.title")}>
      {(facts.checkin || facts.checkout) && <div className="hotelFactsTimes">
        <Clock size={20} aria-hidden="true" />
        <div><div className="hotelFactsTimeValues">
          {facts.checkin && <span>{t("hotelFacts.checkin")} <strong>{facts.checkin}</strong></span>}
          {facts.checkout && <span>{t("hotelFacts.checkout")} <strong>{facts.checkout}</strong></span>}
        </div><small>{t("hotelFacts.localTime")}</small></div>
      </div>}
      {facts.map && <a href={facts.map} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true" />{t("hotelFacts.map")}</a>}
    </section>
  );
}
