// Single language registry for UI, SEO and server-side language validation.
export const languageOptions = [
  { code: 'en', flag: '🇬🇧', label: 'English', name: 'English' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch', name: 'German' },
  { code: 'fr', flag: '🇫🇷', label: 'Français', name: 'French' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский', name: 'Russian' },
  { code: 'es', flag: '🇪🇸', label: 'Español', name: 'Spanish' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية', name: 'Arabic' },
  { code: 'tr', flag: '🇹🇷', label: 'Türkçe', name: 'Turkish' },
  { code: 'pt', flag: '🇧🇷', label: 'Português (Brasil)', name: 'Brazilian Portuguese' },
  { code: 'it', flag: '🇮🇹', label: 'Italiano', name: 'Italian' },
  { code: 'zh', flag: '🇨🇳', label: '中文', name: 'Simplified Chinese' },
  { code: 'nl', flag: '🇳🇱', label: 'Nederlands', name: 'Dutch' },
  { code: 'nb', flag: '🇳🇴', label: 'Norsk bokmål', name: 'Norwegian Bokmål' },
  { code: 'sv', flag: '🇸🇪', label: 'Svenska', name: 'Swedish' },
  { code: 'da', flag: '🇩🇰', label: 'Dansk', name: 'Danish' },
  { code: 'fi', flag: '🇫🇮', label: 'Suomi', name: 'Finnish' },
  { code: 'ja', flag: '🇯🇵', label: '日本語', name: 'Japanese' },
  { code: 'ko', flag: '🇰🇷', label: '한국어', name: 'Korean' },
  { code: 'pl', flag: '🇵🇱', label: 'Polski', name: 'Polish' },
];
export const supportedLanguages = languageOptions.map(({ code }) => code);
export const languageNames = Object.fromEntries(languageOptions.map(({ code, label }) => [code, label]));
export const translationLanguageNames = Object.fromEntries(languageOptions.map(({ code, name }) => [code, name]));
export const addedLanguages = ['nl', 'nb', 'sv', 'da', 'fi', 'ja', 'ko', 'pl'];
export function requestedLanguage(value) {
  const code = String(value || '').toLowerCase().split(/[-_]/)[0];
  // Browsers commonly report no-NO; the site's Norwegian locale is Bokmål.
  if (code === 'no') return 'nb';
  return supportedLanguages.includes(code) ? code : null;
}

export function normalizeLanguage(value) { return requestedLanguage(value) || 'en'; }
