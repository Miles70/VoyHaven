import { additionalTranslations } from "../i18n/extended/index.js";
import flights from '../i18n/flightTranslations.js';
const modifiers = {
 en: ['Partially refundable', 'Non-refundable', 'Refundable', 'Comfort', 'Flexible', 'Basic', 'Standard', 'Light', 'Plus', 'Saver'],
 tr: ['Kısmen iade edilebilir', 'İade edilemez', 'İade edilebilir', 'Konfor', 'Esnek', 'Temel', 'Standart', 'Hafif', 'Plus', 'Tasarruf'],
 de: ['Teilweise erstattbar', 'Nicht erstattbar', 'Erstattbar', 'Komfort', 'Flexibel', 'Basis', 'Standard', 'Light', 'Plus', 'Spartarif'],
 fr: ['Partiellement remboursable', 'Non remboursable', 'Remboursable', 'Confort', 'Flexible', 'Essentiel', 'Standard', 'Léger', 'Plus', 'Économique'],
 es: ['Parcialmente reembolsable', 'No reembolsable', 'Reembolsable', 'Confort', 'Flexible', 'Básica', 'Estándar', 'Ligera', 'Plus', 'Ahorro'],
 it: ['Parzialmente rimborsabile', 'Non rimborsabile', 'Rimborsabile', 'Comfort', 'Flessibile', 'Base', 'Standard', 'Leggera', 'Plus', 'Risparmio'],
 pt: ['Parcialmente reembolsável', 'Não reembolsável', 'Reembolsável', 'Conforto', 'Flexível', 'Básica', 'Padrão', 'Leve', 'Plus', 'Econômica'],
 ru: ['Частичный возврат', 'Без возврата', 'Возвратный', 'Комфорт', 'Гибкий', 'Базовый', 'Стандарт', 'Лайт', 'Плюс', 'Выгодный'],
 ar: ['قابل للاسترداد جزئياً', 'غير قابل للاسترداد', 'قابل للاسترداد', 'راحة', 'مرن', 'أساسي', 'قياسي', 'خفيف', 'بلس', 'توفير'],
 zh: ['可部分退款', '不可退款', '可退款', '舒适', '灵活', '基础', '标准', '轻量', '升级', '优惠'],
};
const fullyFlexible = {
 en: 'Fully flexible', tr: 'Tam esnek', de: 'Voll flexibel', fr: 'Entièrement flexible', es: 'Totalmente flexible', it: 'Completamente flessibile', pt: 'Totalmente flexível', ru: 'Полностью гибкий', ar: 'مرن بالكامل', zh: '完全灵活',
};
const patterns = [ /partially[\s_-]+refundable/i, /(?:non[\s_-]?refundable|not[\s_-]+refundable)/i, /refundable/i, /comfort/i, /flex(?:ible)?/i, /basic/i, /standard/i, /light/i, /plus/i, /saver/i ];
// Translate only recognizable fare descriptors. Never infer refund rules from a name.
// Unknown supplier-specific brand names are kept verbatim.
export function flightFareLabel(value, language = 'en') {
 if (typeof value !== 'string' || !value.trim()) return '';
 const text = value.trim();
 const cabin = text.match(/^(premium[\s_-]+economy|economy|business(?:[\s_-]+class)?|first(?:[\s_-]+class)?)(?:\b|_)/i);
 if (!cabin) return /^fully[\s_-]+flex(?:ible)?$/i.test(text) ? (fullyFlexible[language] || fullyFlexible.en) : text;
 const copy = flights[language] || flights.en;
 const key = /^premium/i.test(cabin[1]) ? 'premium' : /^business/i.test(cabin[1]) ? 'business' : /^first/i.test(cabin[1]) ? 'first' : 'economy';
 const rest = text.slice(cabin[0].length).replace(/^[\s·:_-]+/, '').trim();
 if (!rest) return copy[key];
 if (/^fully[\s_-]+flex(?:ible)?$/i.test(rest)) return `${copy[key]} · ${fullyFlexible[language] || fullyFlexible.en}`;
 const index = patterns.findIndex(pattern => new RegExp(`^(?:${pattern.source})$`, 'i').test(rest));
 const description = index >= 0 ? (modifiers[language] || modifiers.en)[index] : rest;
 return `${copy[key]} · ${description}`;
}

Object.assign(modifiers, additionalTranslations("fare-modifiers"));

Object.assign(fullyFlexible, additionalTranslations("fare-fullyFlexible"));
