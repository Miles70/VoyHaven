import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageContext.jsx';
import InformationPage from '../src/pages/InformationPage.jsx';
export function renderInformation(page, language) {
  return renderToString(<MemoryRouter><LanguageProvider initialLanguage={language}><InformationPage page={page} /></LanguageProvider></MemoryRouter>);
}
