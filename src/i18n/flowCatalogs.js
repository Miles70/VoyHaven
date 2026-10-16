import polish from './extended/pl.js';
import additional from './extended/flows.js';
import baseline from './baselineFlows.js';
import actions from './flowActionTranslations.js';
export default Object.fromEntries(Object.entries({ ...baseline, ...additional, pl: polish.flowCopy.default }).map(([language, catalog]) => [language, { ...catalog, ...actions[language] }]));
