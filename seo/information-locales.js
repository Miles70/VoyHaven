import { supportedLanguages } from '../shared/languages.js';
export const informationPaths = ['/about', '/contact', '/support', '/privacy', '/terms', '/refund', '/cookies', '/booking-conditions', '/payment-information'];
export const informationPath = (path, language) => `${path}${language === 'en' ? '' : `?lang=${language}`}`;
export const informationAlternates = path => [
  ...supportedLanguages.map(language => ({ language, path: informationPath(path, language) })),
  { language: 'x-default', path },
];
