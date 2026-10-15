import { additionalTranslations } from "./extended/index.js";
const labels = {
  tr: ["Konaklama bilgileri", "Giriş başlangıcı", "Çıkış saati", "Tesisteki yerel saat", "Haritada konumu gör"],
  en: ["Stay information", "Check-in from", "Check-out time", "Local time at the property", "View location on map"],
  ru: ["Информация о проживании", "Заезд с", "Время выезда", "Местное время отеля", "Посмотреть на карте"],
  ar: ["معلومات الإقامة", "تسجيل الوصول من", "وقت المغادرة", "التوقيت المحلي للفندق", "عرض الموقع على الخريطة"],
  zh: ["入住信息", "最早入住时间", "退房时间", "酒店当地时间", "在地图上查看位置"],
  es: ["Información de la estancia", "Entrada desde", "Hora de salida", "Hora local del alojamiento", "Ver ubicación en el mapa"],
  pt: ["Informações da estadia", "Check-in a partir de", "Horário de check-out", "Horário local da acomodação", "Ver localização no mapa"],
  fr: ["Informations sur le séjour", "Arrivée à partir de", "Heure de départ", "Heure locale de l’établissement", "Voir sur la carte"],
  de: ["Informationen zum Aufenthalt", "Check-in ab", "Check-out-Zeit", "Ortszeit der Unterkunft", "Standort auf der Karte"],
  it: ["Informazioni sul soggiorno", "Check-in dalle", "Orario di check-out", "Ora locale della struttura", "Visualizza sulla mappa"],
};
const keys = ["title", "checkin", "checkout", "localTime", "map"];
const localizedTranslations = Object.fromEntries(Object.entries(labels).map(([language, values]) => [language, Object.fromEntries(keys.map((key, index) => [key, values[index]]))]));
export default localizedTranslations;

Object.assign(localizedTranslations, additionalTranslations("hotelFactsTranslations.js", "default"));
