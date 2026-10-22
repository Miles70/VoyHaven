import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Plane, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import translations from '../../i18n/flightInfoTranslations';

export default function FlightInfoCards() {
  const { language } = useLanguage();
  const copy = translations[language] || translations.en;
  const cards = copy.slice(3).map(text => text.split('|'));
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    if (selected === null) return undefined;
    const element = dialog.current;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previous;
    };
  }, [selected]);
  return <section className="flightInfoSection" aria-label={copy[0]}>
    <h2>{copy[0]}</h2>
    <div className="flightInspirationGallery">
      {cards.map(([title], index) => <button type="button" className="flightInspirationCard" key={index} aria-haspopup="dialog" onClick={() => setSelected(index)}>
        <span className="flightInfoImage"><img src={`/images/voyhaven-flight-inspiration-${index + 1}.webp`} alt="" width="450" height="675" loading="lazy" decoding="async" /></span>
        <span className="flightInfoCardText"><strong>{title}</strong><span>{copy[2]} <ArrowUpRight size={15} aria-hidden="true" /></span></span>
      </button>)}
    </div>
    <dialog ref={dialog} className="flightInfoDialog" aria-labelledby={titleId} aria-describedby={descriptionId} onClose={() => setSelected(null)} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
    }}>
      <div className="flightInfoDialogTop"><span><Plane size={18} aria-hidden="true" /> VOYHAVEN</span><button type="button" aria-label={copy[1]} onClick={() => dialog.current.close()}><X size={22} aria-hidden="true" /></button></div>
      <p className="flightInfoEyebrow">{copy[0]}</p>
      <h2 id={titleId}>{selected !== null ? cards[selected][0] : ''}</h2>
      <p id={descriptionId} className="flightInfoBody">{selected !== null ? cards[selected][1] : ''}</p>
      <div className="flightInfoDialogBottom"><span aria-hidden="true">✦</span><button type="button" onClick={() => dialog.current.close()}>{copy[1]}</button></div>
    </dialog>
  </section>;
}
