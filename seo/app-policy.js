import { requestedLanguage } from "../shared/languages.js";
import baseline from "../src/i18n/baselineSupplement.js";
import { informationPaths, informationPath, informationAlternates } from "./information-locales.js";
import { additionalTranslations } from "../src/i18n/extended/index.js";
import { SITE_URL } from './model.js';
import { copy } from './copy.js';
import legalTranslations from '../src/i18n/legalTranslations.js';
import aboutTranslations from '../src/i18n/aboutTranslations.js';
export const searchKeys = ['cityName','checkin','checkout','adults','children','infants','departure','returnDate','origin','destination','originName','destinationName','offerId','auto','latitude','longitude','placeId','cabinClass','currency','country','reference','bookingReference','prebookId','bookingRef','cardRef','flightRef','payment_intent','payment_intent_client_secret','redirect_status'];
const generalSeo = {
 en: {
  '/about': ['About VoyHaven', 'Learn about VoyHaven, a travel platform for hotel discovery and reservations.'],
  '/contact': ['Contact', 'Contact VoyHaven for travel, hotel partnerships and reservation questions.'],
  '/support': ['Travel Support', 'Get help with VoyHaven searches, reservations and payments.'],
 },
 tr: {
  '/about': ['VoyHaven Hakkında', 'VoyHaven otel keşfi ve rezervasyon platformunu tanı.'],
  '/contact': ['İletişim', 'Seyahat, otel iş birliği ve rezervasyon soruların için VoyHaven ile iletişime geç.'],
  '/support': ['Seyahat Desteği', 'VoyHaven arama, rezervasyon ve ödeme işlemleri için destek al.'],
 },
};
export function appPolicy(pathname, search = '', catalog = []) {
 const params = new URLSearchParams(search);
 const lang = requestedLanguage(params.get('lang')) || requestedLanguage(pathname.split('/')[1]) || 'en';
 const empty = [...params.keys()].every(key => key.startsWith('utm_') || key === 'gclid');
 if (pathname === '/travel') return { redirect: `/${search ? `?${params}` : ''}` };
 const hotelMatch = pathname.match(/^\/travel\/hotels\/(lp[a-z0-9]+)$/);
 if (empty && hotelMatch && catalog.includes(hotelMatch[1])) return { redirect: `/${lang}/travel/hotels/${hotelMatch[1]}${search ? `?${params}` : ''}` };
 const general = ['/', '/about', '/contact', '/support', '/privacy', '/terms', '/refund', '/cars', '/activities'];
 const privatePage = /^\/(admin(?:\/.*)?|account|travel\/checkout|flights\/checkout)$/.test(pathname);
 const liveHotel = /^\/travel\/hotels\/[^/]+$/.test(pathname);
 const known = general.includes(pathname) || privatePage || liveHotel || ['/hotels', '/flights'].includes(pathname);
 const userSearch = searchKeys.some(key => params.has(key));
 const noIndex = privatePage || liveHotel || ['/hotels', '/flights', '/cars', '/activities'].includes(pathname) || userSearch || !known;
 const c = copy[lang];
 const about = aboutTranslations[lang] || aboutTranslations.en;
 const legal = ['/privacy', '/terms', '/refund'].includes(pathname) ? legalTranslations[lang]?.[pathname.slice(1)] : null;
 const information = legal ? [legal.title, legal.intro] : pathname === '/about' ? [about.seoTitle, about.seoDescription] : (generalSeo[lang] || generalSeo.en)[pathname];
 const title = information?.[0] || (!known ? '404' : pathname.startsWith('/flights') ? c.flights : pathname.startsWith('/hotels') || liveHotel ? c.hotels : c.homeTitle);
 const canonicalPath = liveHotel && hotelMatch && catalog.includes(hotelMatch[1]) ? `/${lang}/travel/hotels/${hotelMatch[1]}` : ['/hotels','/flights'].includes(pathname) ? `/${lang}${pathname}` : pathname === "/" ? `/${lang}` : pathname;
 return { lang, status: known ? 200 : 404, noIndex, title: `${title} | VoyHaven`, description: information?.[1] || (pathname.startsWith('/flights') ? c.flightHelp : c.hotelHelp), canonical: SITE_URL + (informationPaths.includes(pathname) ? informationPath(pathname, lang) : canonicalPath), alternates: !noIndex && informationPaths.includes(pathname) ? informationAlternates(pathname) : [] };
}

Object.assign(generalSeo, additionalTranslations("generalSeo"));

Object.assign(generalSeo, Object.fromEntries(Object.entries(baseline).map(([language, catalog]) => [language, catalog.generalSeo])));
