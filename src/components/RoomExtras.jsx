import { useLanguage } from "../i18n/LanguageContext";
import { mappedHotelRoom } from "../../shared/hotelContent.js";

export default function RoomExtras({ rate, rooms, translateFacilities }) {
  const { t } = useLanguage();
  const room = mappedHotelRoom(rate, rooms);
  if (!room) return null;
  const size = Number(room.roomSizeSquare);
  const unit = ["m2", "m²"].includes(room.roomSizeUnit) ? "m²" : ["ft2", "ft²"].includes(room.roomSizeUnit) ? "ft²" : null;
  const capacity = Number(room.maxOccupancy);
  const beds = (Array.isArray(room.bedTypes) ? room.bedTypes : []).map((bed) => {
    const kind = String(bed.bedType || "").toLowerCase();
    const key = /sofa/.test(kind) ? "sofa" : /king/.test(kind) ? "king" : /queen/.test(kind) ? "queen" : /double/.test(kind) ? "double" : /twin/.test(kind) ? "twin" : /single/.test(kind) ? "single" : null;
    const quantity = Number(bed.quantity);
    return key && Number.isInteger(quantity) && quantity > 0 ? `${quantity} × ${t(`hotelContent.${key}`)}` : null;
  }).filter(Boolean);
  const facilities = translateFacilities(Array.isArray(room.roomAmenities) ? room.roomAmenities : []);
  const photos = (Array.isArray(room.photos) ? room.photos : []).filter((photo) => /^https:\/\//.test(photo?.url || "")).slice(0, 3);
  if (!photos.length && !(size > 0 && unit) && !(capacity > 0) && !beds.length && !facilities.length) return null;
  return <details className="hotelRoomExtras">
    <summary>{t("hotelContent.roomDetails")}</summary>
    {photos.length > 0 && <div className="hotelRoomPhotos">{photos.map((photo, index) => <img key={photo.url} src={photo.url} alt={`${rate.name || ""} · ${t("hotelDetail.photo")} ${index + 1}`} loading="lazy" />)}</div>}
    <dl>
      {size > 0 && unit && <><dt>{t("hotelContent.size")}</dt><dd>{size} {unit}</dd></>}
      {capacity > 0 && <><dt>{t("hotelContent.capacity")}</dt><dd>{capacity}</dd></>}
      {beds.length > 0 && <><dt>{t("hotelContent.beds")}</dt><dd>{beds.join(", ")}</dd></>}
    </dl>
    {facilities.length > 0 && <div className="hotelRoomFacilities">{facilities.map((facility) => <span key={facility}>{facility}</span>)}</div>}
  </details>;
}
