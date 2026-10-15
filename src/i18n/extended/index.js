import pl from './pl.js';
import nl from './nl.js';
import nb from './nb.js';
import sv from './sv.js';
import da from './da.js';
import fi from './fi.js';
import ja from './ja.js';
import ko from './ko.js';
const catalogs = { nl, nb, sv, da, fi, ja, ko, pl };
export function additionalTranslations(module, name = 'default') {
  return Object.fromEntries(Object.entries(catalogs).map(([language, catalog]) => [language, catalog[module][name]]));
}
