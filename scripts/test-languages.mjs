import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { supportedLanguages, addedLanguages, normalizeLanguage, languageNames } from '../shared/languages.js';
import { additionalTranslations } from '../src/i18n/extended/index.js';
import { copy, languages } from '../seo/copy.js';
import { travelGuide } from '../seo/guides.js';
import { airports, destinations } from '../seo/destinations.js';
assert.equal(supportedLanguages.length, 17);
assert.equal(new Set(supportedLanguages).size, 17);
assert.deepEqual(languages, supportedLanguages);
for (const [input, expected] of [['nl-NL','nl'],['no-NO','nb'],['nb-NO','nb'],['sv-SE','sv'],['da-DK','da'],['fi-FI','fi'],['ja-JP','ja'],['ko-KR','ko'],['xx','en']]) assert.equal(normalizeLanguage(input), expected);
function placeholders(text) { return [...text.matchAll(/\{\w+\}/g)].map(m => m[0]).sort(); }
let checked = 0;
function parity(base, translated, path) {
  assert.equal(typeof translated, typeof base, path);
  if (typeof base === 'string') {
    assert.ok(translated.trim(), path);
    assert.ok(!/98765\d{4}|<unk>|undefined/.test(translated), path);
    assert.deepEqual(placeholders(translated), placeholders(base), path);
    checked++;
  } else if (base && typeof base === 'object') {
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(base).sort(), path);
    for (const key of Object.keys(base)) parity(base[key], translated[key], `${path}.${key}`);
  }
}
for (const file of (await readdir('src/i18n')).filter(file => file.endsWith('.js') && !['translations.js', 'flowTranslations.js'].includes(file))) {
  const module = await import(`../src/i18n/${file}`);
  for (const [name, dictionary] of Object.entries(module)) {
    if (typeof dictionary === 'function') {
      for (const language of addedLanguages) parity(dictionary('en'), dictionary(language), `${file}.${language}`);
    } else if (dictionary?.en) {
      for (const language of addedLanguages) parity(dictionary.en, dictionary[language], `${file}.${name}.${language}`);
    }
  }
}
for (const language of addedLanguages) {
  parity(additionalTranslations('locale').nl, additionalTranslations('locale')[language], `locale.${language}`);
  parity(copy.en, copy[language], `seo.${language}`);
  for (const kind of ['hotels','flights']) parity(travelGuide(kind, 'en'), travelGuide(kind, language), `guide.${kind}.${language}`);
  for (const destination of destinations) assert.ok(destination.names[language]);
  for (const airport of Object.values(airports)) assert.ok(airport.names[language]);
  assert.ok(languageNames[language]);
  for (const module of ['information-supportCopy','information-mailSupportCopy','information-content','fare-modifiers','fare-fullyFlexible']) parity(additionalTranslations(module).nl, additionalTranslations(module)[language], `${module}.${language}`);
}
console.log(`Language coverage passed: ${supportedLanguages.length} languages, ${checked} translated values, placeholder parity and locale detection.`);
