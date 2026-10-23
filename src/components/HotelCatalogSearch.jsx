import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import translations from '../i18n/hotelCatalogTranslations';
import { searchHotelCatalog } from '../services/hotelsApi';
import './HotelCatalogSearch.css';

export default function HotelCatalogSearch() {
  const { language } = useLanguage();
  const copy = translations[language] || translations.en;
  const id = useId();
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = useState('');
  const [data, setData] = useState([]);
  const [state, setState] = useState('idle');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search(name, pageOffset = 0) {
    if (name.trim().length < 3) return;
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    setState('loading'); setData([]); setHasMore(false);
    try {
      const payload = await searchHotelCatalog(name.trim(), pageOffset, active.signal);
      if (active.signal.aborted) return;
      setData(payload.data || []); setHasMore(payload.hasMore === true);
      setCompleted(name.trim()); setOffset(pageOffset); setState('done');
    } catch { if (!active.signal.aborted) setState('error'); }
  }
  return <section className="hotelCatalogSearch" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{copy[0]}</h2>
    <p id={`${id}-help`}>{copy[3]}</p>
    <form onSubmit={event => { event.preventDefault(); search(query); }}>
      <label htmlFor={`${id}-query`}>{copy[1]}</label>
      <div className="hotelCatalogInput"><input id={`${id}-query`} type="search" value={query} minLength={3} maxLength={100} required aria-describedby={`${id}-help`} placeholder={copy[1]} onChange={event => {
        controller.current?.abort(); setQuery(event.target.value); setState('idle'); setData([]); setHasMore(false);
      }} /><button type="submit" disabled={state === 'loading' || query.trim().length < 3}><Search size={18} aria-hidden="true" />{copy[2]}</button></div>
    </form>
    <div aria-live="polite" aria-busy={state === 'loading'}>
      {state === 'loading' && <p role="status">{copy[4]}</p>}
      {state === 'error' && <p role="alert">{copy[6]}</p>}
      {state === 'done' && <>
        {!data.length && <p>{copy[5]}</p>}
        <ul className="hotelCatalogResults">{data.map(hotel => <li key={hotel.id}><Link to={`/travel/hotels/${encodeURIComponent(hotel.id)}?lang=${language}`}>
          <strong>{hotel.name}</strong><span>{[hotel.city, hotel.country].filter(Boolean).join(' · ') || hotel.address}</span>
        </Link></li>)}</ul>
        {(offset > 0 || hasMore) && <nav aria-label={copy[0]}><button type="button" disabled={offset === 0} onClick={() => search(completed, Math.max(0, offset - 20))}>{copy[8]}</button><span>{offset / 20 + 1}</span><button type="button" disabled={!hasMore} onClick={() => search(completed, offset + 20)}>{copy[7]}</button></nav>}
      </>}
    </div>
  </section>;
}
