import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { getHotelInformation, getHotelReviews } from "../services/hotelsApi";
import { cleanHotelText } from "../../shared/hotelContent.js";
import "./HotelGuestContent.css";

export default function HotelGuestContent({ hotel, hotelId }) {
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState("idle");
  const [nextOffset, setNextOffset] = useState(0);
  const [information, setInformation] = useState(language === "en" ? cleanHotelText(hotel.hotelImportantInformation) : "");
  const [infoStatus, setInfoStatus] = useState(language === "en" ? "success" : "idle");

  async function loadReviews() {
    setReviewStatus("loading");
    try {
      const result = await getHotelReviews(hotelId, language, nextOffset || 0);
      setReviews((current) => nextOffset ? [...current, ...(result.reviews || [])] : result.reviews || []);
      setNextOffset(result.nextOffset);
      setReviewStatus("success");
    } catch { setReviewStatus("error"); }
  }

  async function loadInformation() {
    setInfoStatus("loading");
    try { setInformation((await getHotelInformation(hotelId, language)).information || ""); setInfoStatus("success"); }
    catch { setInfoStatus("error"); }
  }

  return <>
    {cleanHotelText(hotel.hotelImportantInformation) && <section className="hotelDetailCard hotelGuestContent">
      <h2>{t("hotelContent.information")}</h2>
      {information && <p className="hotelImportantText">{information}</p>}
      {infoStatus === "success" && !information && <p>{t("hotelContent.noInformation")}</p>}
      {infoStatus === "error" && <p role="status">{t("hotelContent.error")}</p>}
      {infoStatus !== "success" && <button type="button" disabled={infoStatus === "loading"} onClick={loadInformation}>{t(infoStatus === "loading" ? "hotelContent.loading" : "hotelContent.showInformation")}</button>}
    </section>}
    <section className="hotelDetailCard hotelGuestContent">
      <h2>{t("hotelContent.reviews")}</h2>
      {reviews.length > 0 && <small>{t("hotelContent.source")}</small>}
      {reviews.map((review, index) => <article className="hotelGuestReview" key={`${review.name}:${review.date}:${index}`}>
        <div><strong>{review.name || t("hotelContent.guest")}</strong>{review.score !== null && review.score !== undefined && <b>{review.score}/10</b>}</div>
        {review.date && <time dateTime={review.date}>{new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : language, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${review.date}T00:00:00Z`))}</time>}
        {review.headline && <h3>{review.headline}</h3>}
        {review.pros && <p><strong>{t("hotelContent.pros")}: </strong>{review.pros}</p>}
        {review.cons && <p><strong>{t("hotelContent.cons")}: </strong>{review.cons}</p>}
      </article>)}
      {reviewStatus === "success" && !reviews.length && <p>{t("hotelContent.noReviews")}</p>}
      {reviewStatus === "error" && <p role="status">{t("hotelContent.error")}</p>}
      {(reviewStatus !== "success" || nextOffset !== null) && <button type="button" disabled={reviewStatus === "loading"} onClick={loadReviews}>{t(reviewStatus === "loading" ? "hotelContent.loading" : reviews.length ? "hotelContent.moreReviews" : "hotelContent.loadReviews")}</button>}
    </section>
  </>;
}
