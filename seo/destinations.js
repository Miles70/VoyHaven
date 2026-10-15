// Publish only destinations with enough reviewed provider hotel profiles.
export const destinations = [{ slug: 'antalya', country: 'TR', names: { tr: 'Antalya', en: 'Antalya', de: 'Antalya', fr: 'Antalya', ru: 'Анталья', ar: 'أنطاليا', es: 'Antalya', pt: 'Antalya', it: 'Antalya', zh: '安塔利亚' } }];
export const airports = {
 AYT: { names: { tr: 'Antalya', en: 'Antalya', de: 'Antalya', fr: 'Antalya', ru: 'Анталья', ar: 'أنطاليا', es: 'Antalya', pt: 'Antalya', it: 'Antalya', zh: '安塔利亚' }, airport: 'Antalya Airport' },
 FRA: { names: { tr: 'Frankfurt', en: 'Frankfurt', de: 'Frankfurt', fr: 'Francfort', ru: 'Франкфурт', ar: 'فرانكفورت', es: 'Fráncfort', pt: 'Frankfurt', it: 'Francoforte', zh: '法兰克福' }, airport: 'Frankfurt Airport' },
 IST: { names: { tr: 'İstanbul', en: 'Istanbul', de: 'Istanbul', fr: 'Istanbul', ru: 'Стамбул', ar: 'إسطنبول', es: 'Estambul', pt: 'Istambul', it: 'Istanbul', zh: '伊斯坦布尔' }, airport: 'Istanbul Airport' },
 DXB: { names: { tr: 'Dubai', en: 'Dubai', de: 'Dubai', fr: 'Dubaï', ru: 'Дубай', ar: 'دبي', es: 'Dubái', pt: 'Dubai', it: 'Dubai', zh: '迪拜' }, airport: 'Dubai International Airport' },
 LHR: { names: { tr: 'Londra', en: 'London', de: 'London', fr: 'Londres', ru: 'Лондон', ar: 'لندن', es: 'Londres', pt: 'Londres', it: 'Londra', zh: '伦敦' }, airport: 'London Heathrow Airport' },
};
// Specific airports, not all-airport city codes. No schedule, airline, direct-flight or price claims.
export const routes = [{ from: 'AYT', to: 'FRA' }, { from: 'IST', to: 'DXB' }, { from: 'LHR', to: 'AYT' }];

const localizedCities = {
 nl: ['Antalya', 'Frankfurt', 'Istanbul', 'Dubai', 'Londen'],
 nb: ['Antalya', 'Frankfurt', 'Istanbul', 'Dubai', 'London'],
 sv: ['Antalya', 'Frankfurt', 'Istanbul', 'Dubai', 'London'],
 da: ['Antalya', 'Frankfurt', 'Istanbul', 'Dubai', 'London'],
 fi: ['Antalya', 'Frankfurt', 'Istanbul', 'Dubai', 'Lontoo'],
 ja: ['アンタルヤ', 'フランクフルト', 'イスタンブール', 'ドバイ', 'ロンドン'],
 ko: ['안탈리아', '프랑크푸르트', '이스탄불', '두바이', '런던'],
};
for (const [language, names] of Object.entries(localizedCities)) {
 destinations[0].names[language] = names[0];
 ['AYT', 'FRA', 'IST', 'DXB', 'LHR'].forEach((code, index) => { airports[code].names[language] = names[index]; });
}
