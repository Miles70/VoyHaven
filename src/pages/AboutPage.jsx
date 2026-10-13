import { Link } from 'react-router-dom';
import { ArrowUpRight, BedDouble, Check, Compass, Globe2, Headphones, Plane, ShieldCheck, WalletCards } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import aboutTranslations from '../i18n/aboutTranslations';
import './AboutPage.css';

const valueIcons = [BedDouble, ShieldCheck, Headphones];
const factIcons = [Globe2, WalletCards, Headphones];

export default function AboutPage() {
  const { language } = useLanguage();
  const copy = aboutTranslations[language] || aboutTranslations.en;
  const hotelsUrl = `/hotels?lang=${language}`;
  return <main className="aboutPage" dir={language === 'ar' ? 'rtl' : 'ltr'}>
    <section className="aboutHero" aria-labelledby="about-title">
      <div className="container aboutHeroGrid">
        <div className="aboutHeroCopy">
          <p className="aboutEyebrow"><span aria-hidden="true" />{copy.eyebrow}</p>
          <h1 id="about-title">{copy.title}{' '}<span>{copy.accent}</span></h1>
          <p className="aboutIntro">{copy.intro}</p>
          <div className="aboutActions">
            <Link className="aboutButton aboutButtonPrimary" to={hotelsUrl}>{copy.hotelCta}<ArrowUpRight size={19} aria-hidden="true" /></Link>
            <Link className="aboutButton aboutButtonSecondary" to={`/flights?lang=${language}`}><Plane size={18} aria-hidden="true" />{copy.flightCta}</Link>
          </div>
          <ul className="aboutFacts">{copy.facts.map((fact, index) => {
            const Icon = factIcons[index];
            return <li key={fact}><Icon size={17} aria-hidden="true" /><span>{fact}</span></li>;
          })}</ul>
        </div>
        <figure className="aboutHeroVisual">
          <img src="/images/voyhaven-travel-beach-poster.webp" alt="" width="1600" height="900" fetchPriority="high" />
          <div className="aboutVisualBrand" aria-hidden="true"><Compass size={19} />VoyHaven</div>
          <figcaption><span>{copy.imageLabel}</span><strong>{copy.imageText}</strong></figcaption>
          <div className="aboutVisualLine" aria-hidden="true" />
        </figure>
      </div>
    </section>
    <section className="aboutStory container" aria-labelledby="about-story-title">
      <div><p className="aboutEyebrow">{copy.storyLabel}</p><h2 id="about-story-title">{copy.storyTitle}</h2></div>
      <p>{copy.storyBody}</p>
    </section>
    <section className="aboutValuesSection" aria-labelledby="about-values-title">
      <div className="container">
        <h2 id="about-values-title">{copy.valuesTitle}</h2>
        <div className="aboutValues">{copy.values.map(([title, body], index) => {
          const Icon = valueIcons[index];
          return <article className="aboutValue" key={title}><span className={`aboutValueIcon aboutValueIcon${index}`}><Icon size={24} aria-hidden="true" /></span><h3>{title}</h3><p>{body}</p></article>;
        })}</div>
      </div>
    </section>
    <section className="aboutProcess container" aria-labelledby="about-process-title">
      <div className="aboutProcessHeader"><p className="aboutEyebrow">{copy.processLabel}</p><h2 id="about-process-title">{copy.processTitle}</h2></div>
      <ol className="aboutSteps">{copy.steps.map(([title, body], index) => <li key={title}><span className="aboutStepNumber" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
    </section>
    <section className="aboutClosing container" aria-labelledby="about-closing-title">
      <div><span className="aboutClosingMark" aria-hidden="true"><Check size={19} />VoyHaven</span><h2 id="about-closing-title">{copy.ctaTitle}</h2><p>{copy.ctaBody}</p></div>
      <div className="aboutClosingActions"><Link className="aboutButton aboutButtonLight" to={hotelsUrl}>{copy.hotelCta}<ArrowUpRight size={19} aria-hidden="true" /></Link><Link className="aboutSupportLink" to={`/support?lang=${language}`}>{copy.supportCta}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
    </section>
  </main>;
}
