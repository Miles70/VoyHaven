import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import catalogs from './extended/flows.js';
// Translate display strings only. React elements, numbers, arrays and handlers
// retain their identity, so reservation and payment state are unaffected.
export function flowText(value, language, values = {}) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const translation = catalogs[language]?.[trimmed];
  const localized = translation || trimmed;
  const interpolated = localized.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
  return value.replace(trimmed, () => interpolated);
}
export function useFlowText() {
  const { language } = useLanguage();
  return useCallback((value, values) => flowText(value, language, values), [language]);
}
