import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import catalogs from './extended/flows.js';
// Translate display strings only. React elements, numbers, arrays and handlers
// retain their identity, so reservation and payment state are unaffected.
export function flowText(value, language) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  const translation = catalogs[language]?.[trimmed];
  if (!translation) return value;
  return value.replace(trimmed, () => translation);
}
export function useFlowText() {
  const { language } = useLanguage();
  return useCallback(value => flowText(value, language), [language]);
}
