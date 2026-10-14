import { Link } from "react-router-dom";
import { ArrowRight, MapPin, CalendarDays, ShieldCheck, Ticket, RefreshCw, Luggage, ClipboardCheck, Headphones } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import questionTranslations from '../i18n/travelQuestionTranslations';
import { showcaseDestinations } from "../services/hotelDiscovery.js";

export function DestinationDiscovery({ hotels, checkin, checkout, adults }) {
  const { t } = useLanguage();
  const destinations = showcaseDestinations(hotels);
  if (!destinations.length) return null;
  return (
    <section className="travelDiscoverySection" aria-labelledby="travel-destinations-title">
      <div className="travelContainer">
        <div className="travelDiscoveryHeading">
          <h2 id="travel-destinations-title">{t("discovery.destinationsTitle")}</h2>
          <p>{t("discovery.destinationsText")}</p>
        </div>
        <div className="travelDestinationGrid">
          {destinations.map((destination) => (
            <Link key={destination.key} className="travelDestinationCard" to={`/hotels?${new URLSearchParams({ cityName: destination.city, checkin, checkout, adults: String(adults), auto: "1" })}`}>
              <img src={destination.image} alt="" loading="lazy" />
              <div>
                <span><MapPin size={16} aria-hidden="true" />{destination.city}</span>
                <small>{t("discovery.discoverHotels")} <ArrowRight size={16} aria-hidden="true" /></small>
              </div>
            </Link>
          ))}
        </div>
        <p className="travelDiscoveryCaption">{t("discovery.destinationPhotoNote")}</p>
      </div>
    </section>
  );
}

export function TravelQuestions() {
  const { t, language } = useLanguage();
  const copy = questionTranslations[language] || questionTranslations.en;
  const cards = [
    [CalendarDays, t('discovery.datesQuestion'), t('discovery.datesAnswer')],
    [ShieldCheck, t('discovery.cancellationQuestion'), t('discovery.cancellationAnswer')],
    [Ticket, t('discovery.bookingQuestion'), t('discovery.bookingAnswer')],
    [RefreshCw, copy.priceQuestion, copy.priceAnswer],
    [Luggage, copy.baggageQuestion, copy.baggageAnswer],
    [ClipboardCheck, copy.checkQuestion, copy.checkAnswer],
  ];
  return (
    <section className="travelQuestionsSection" aria-labelledby="travel-questions-title">
      <div className="travelContainer travelQuestionsLayout">
        <div className="travelQuestionsHeader">
          <div className="travelDiscoveryHeading">
            <h2 id="travel-questions-title">{t('discovery.questionsTitle')}</h2>
            <p>{t('discovery.questionsText')}</p>
          </div>
          <Link className="travelQuestionsSupport" to={`/support?lang=${language}`}><Headphones size={19} aria-hidden="true" />{t('discovery.support')} <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="travelQuestionCards">
          {cards.map(([Icon, question, answer], index) => <article className={`travelQuestionCard travelQuestionCard--${index + 1}`} key={question}>
            <span className="travelQuestionIcon"><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></span>
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>)}
        </div>
      </div>
    </section>
  );
}

export function HotelResultControls({ filters, onChange, currency, visibleCount, loadedCount, hasMore }) {
  const { t } = useLanguage();
  const update = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  return (
    <div className="travelResultControls">
      <div className="travelFilterFields">
        <label><span>{t("discovery.hotelName")}</span><input type="search" value={filters.name} onChange={update("name")} /></label>
        <label><span>{t("discovery.stars")}</span><select value={filters.stars} onChange={update("stars")}><option value="">{t("discovery.all")}</option>{[3, 4, 5].map((stars) => <option key={stars} value={stars}>{stars}★+</option>)}</select></label>
        <label><span>{t("discovery.rating")}</span><select value={filters.rating} onChange={update("rating")}><option value="">{t("discovery.all")}</option>{[7, 8, 9].map((rating) => <option key={rating} value={rating}>{rating}+/10</option>)}</select></label>
        {currency && <label><span>{t("discovery.maxPrice")} ({currency})</span><input type="number" min="0" step="any" value={filters.maxPrice} onChange={update("maxPrice")} /></label>}
        <label><span>{t("discovery.sort")}</span><select value={filters.sort} onChange={update("sort")}><option value="recommended">{t("discovery.defaultOrder")}</option>{currency && <><option value="priceAsc">{t("discovery.priceAsc")}</option><option value="priceDesc">{t("discovery.priceDesc")}</option></>}<option value="rating">{t("discovery.rating")}</option></select></label>
      </div>
      <div className="travelFilterSummary">
        <p role="status">{visibleCount} / {loadedCount} · {t("discovery.loadedNote")}{hasMore ? ` ${t("discovery.moreNote")}` : ""}</p>
        <button type="button" onClick={() => onChange({ name: "", stars: "", rating: "", maxPrice: "", sort: "recommended" })}>{t("discovery.reset")}</button>
      </div>
    </div>
  );
}
