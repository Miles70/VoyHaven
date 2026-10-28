import conditions from '../i18n/flightConditionLabels.js';
import selections from '../i18n/flightSelectionTranslations.js';

// Translate known provider wording, preserving amounts/currencies verbatim.
// Unrecognized restrictions stay visible rather than being guessed or discarded.
export function flightSupplierText(value, language = 'en') {
 if (typeof value !== 'string') return '';
 const text = value.trim();
 const labels = conditions[language] || conditions.en;
 const copy = selections[language] || selections.en;
 if (/^refundable\s+with\s+(?:a\s+)?penalty[.!]?$/i.test(text)) return labels.refundPenalty;
 if (/^changes?\s+allowed\s+with\s+(?:a\s+)?penalty[.!]?$/i.test(text)) return labels.changePenalty;
 if (/^(?:non[- ]?refundable|not refundable|refunds? (?:not allowed|not permitted))[.!]?$/i.test(text)) return `${copy.refund}: ${copy.notAllowed}`;
 if (/^changes? (?:not allowed|not permitted)[.!]?$/i.test(text)) return `${copy.change}: ${copy.notAllowed}`;
 if (/^refundable\s+(?:without\s+(?:a\s+)?penalty|free of charge)[.!]?$/i.test(text)) return `${copy.refund}: ${labels.noPenalty}`;
 if (/^changes?\s+allowed\s+(?:without\s+(?:a\s+)?penalty|free of charge)[.!]?$/i.test(text)) return `${copy.change}: ${labels.noPenalty}`;
 const fee = text.match(/^(refund|change)\s+fee\s*:\s*(from\s+)?(.+)$/i);
 if (fee) return `${labels[fee[1].toLowerCase() === 'refund' ? 'refundFee' : 'changeFee']}: ${fee[2] ? `${labels.from} ` : ''}${fee[3]}`;
 return text;
}

const turkishAirports = { AYT: 'Antalya Havalimanı', SAW: 'İstanbul Sabiha Gökçen Havalimanı', IST: 'İstanbul Havalimanı', ESB: 'Ankara Esenboğa Havalimanı', ADB: 'İzmir Adnan Menderes Havalimanı', GZP: 'Gazipaşa–Alanya Havalimanı', COV: 'Çukurova Uluslararası Havalimanı', DLM: 'Dalaman Havalimanı', BJV: 'Milas–Bodrum Havalimanı', TZX: 'Trabzon Havalimanı' };
export function flightAirportName(code, name, language = 'en') {
 if (language === 'tr' && turkishAirports[code]) return turkishAirports[code];
 return typeof name === 'string' ? name : code || '';
}
