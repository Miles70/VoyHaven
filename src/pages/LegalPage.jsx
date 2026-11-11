import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, RotateCcw, ArrowUpRight, Cookie, CalendarCheck, CreditCard } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import legalTranslations from '../i18n/legalTranslations.js';
import { legalPolicyKeys } from '../i18n/supplementalPolicies.js';
import './LegalPage.css';

const icons = { privacy: ShieldCheck, terms: FileText, refund: RotateCcw, cookies: Cookie, 'booking-conditions': CalendarCheck, 'payment-information': CreditCard };
const configuredEmail = String(import.meta.env.VITE_SUPPORT_EMAIL || '').trim();
const supportEmail = /@(?:www\.)?rotavoy\.com$/i.test(configuredEmail) ? 'support@voyhaven.com' : configuredEmail || 'support@voyhaven.com';

export default function LegalPage({ page }) {
  const { language } = useLanguage();
  const copy = legalTranslations[language] || legalTranslations.en;
  const policy = copy[page];
  const Icon = icons[page];
  const updatedDate = policy.updated || '2026-10-13';
  const updated = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${updatedDate}T00:00:00Z`));

  return (
    <main className="legalPage" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="legalHero">
        <div className="container">
          <p className="legalEyebrow">VoyHaven · {copy.legal}</p>
          <div className="legalHeroIcon"><Icon size={26} aria-hidden="true" /></div>
          <h1>{policy.title}</h1>
          <p className="legalIntro">{policy.intro}</p>
          <p className="legalUpdated">{copy.updated} <time dateTime={updatedDate}>{updated}</time></p>
          <nav className="legalTabs" aria-label={copy.legal}>
            {[...legalPolicyKeys, 'payment-information'].map(key => <Link key={key} to={`/${key}?lang=${language}`} aria-current={key === page ? 'page' : undefined}>{copy[key].title}</Link>)}
          </nav>
        </div>
      </header>
      <div className="container legalLayout">
        <aside className="legalSidebar">
          <nav aria-label={copy.contents}>
            <h2>{copy.contents}</h2>
            <ol>{policy.sections.map(([title], index) => <li key={title}><a href={`#${page}-${index + 1}`}>{title}</a></li>)}</ol>
          </nav>
        </aside>
        <article className="legalArticle" aria-label={policy.title}>
          {policy.sections.map(([title, body], index) => <section className="legalSection" key={title} id={`${page}-${index + 1}`} tabIndex={-1}>
            <p className="legalSectionNumber" aria-hidden="true">{String(index + 1).padStart(2, '0')}</p>
            <h2>{title}</h2><p>{body}</p>
          </section>)}
          <section className="legalContact" aria-labelledby="legal-contact-title">
            <h2 id="legal-contact-title">{copy.helpTitle}</h2>
            <p>{copy.helpBody}</p>
            {supportEmail && <a className="legalEmail" href={`mailto:${supportEmail}`}>{supportEmail}</a>}
            <Link className="legalSupport" to={`/account?tab=support&lang=${language}`}>{copy.support} <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </section>
        </article>
      </div>
    </main>
  );
}
