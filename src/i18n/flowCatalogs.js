import additional from './extended/flows.js';
import baseline from './baselineFlows.js';
import actions from './flowActionTranslations.js';
export default Object.fromEntries(Object.entries({ ...baseline, ...additional }).map(([language, catalog]) => [language, { ...catalog, ...actions[language] }]));
