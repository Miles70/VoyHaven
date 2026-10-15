import { useLanguage } from "../i18n/LanguageContext";
import { useFlowText, flowText } from '../i18n/flowTranslations';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BedDouble, Heart, UsersRound, MessageCircle, ArrowRight, Plus, Trash2, Download, LogIn, Compass } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { accountRequest } from '../services/customerApi';
import './TravelAccount.css';
const tabs = [{ id: 'bookings', label: 'Rezervasyonlarım', icon: BedDouble }, { id: 'favorites', label: 'Favorilerim', icon: Heart }, { id: 'travelers', label: 'Yolcu bilgilerim', icon: UsersRound }, { id: 'tickets', label: 'Destek taleplerim', icon: MessageCircle }];
const statuses = { awaiting_payment: 'Ödeme bekleniyor', processing: 'İşleniyor', confirmed: 'Onaylandı', failed: 'Tamamlanamadı', expired: 'Süresi doldu', open: 'Açık', in_progress: 'İnceleniyor', waiting_provider: 'Sağlayıcı yanıtı bekleniyor', resolved: 'Çözüldü', unpaid: 'Ödenmedi', pending: 'Bekliyor', paid: 'Ödendi' };
const empty = { bookings: [], favorites: [], travelers: [], tickets: [] };
const formatDate = (value, language) => value ? new Date(value).toLocaleDateString(language) : '—';
function bookingTitle(b, language) { return b.kind === 'flight' ? `${flowText('Uçuş', language)} · ${b.flight?.segments?.[0]?.originCode || ''} → ${b.flight?.segments?.filter(s => s.direction !== 'INBOUND').at(-1)?.destinationCode || ''}` : b.stay?.hotelName || flowText('Otel rezervasyonu', language); }
function downloadBooking(b, language) {
  const ui = value => flowText(value, language);
  const content = [ui('VoyHaven · Rezervasyon özeti'), `${ui('Referans:')} ${b.clientReference}`, `${ui('Seyahat:')} ${bookingTitle(b, language)}`, `${ui('Giriş:')} ${b.stay?.checkin || '—'}`, `${ui('Çıkış:')} ${b.stay?.checkout || '—'}`, `${ui('Durum:')} ${ui(statuses[b.status]) || b.status}`, `${ui('Ödeme:')} ${ui(statuses[b.paymentStatus]) || b.paymentStatus}`, `${ui('Tutar:')} ${b.total} ${b.currency}`, `${ui('Misafir:')} ${b.holder?.firstName || ''} ${b.holder?.lastName || ''}`, '', ui('Bu belge VoyHaven hesap kayıtlarının özetidir.')].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = `VoyHaven-${b.clientReference.replace(/[^\w-]/g, '')}.txt`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function TravelAccount() {

  const auth = useCustomerAuth();
  return <AccountPage key={auth.customerSession?.token || 'anonymous'} auth={auth} />;
}
function AccountPage({ auth }) {
  const { language } = useLanguage();
  const date = value => formatDate(value, language);
  const ui = useFlowText();

  const { isAuthenticated, customerSession, displayName, isGuest, openAuthModal } = auth;
  const [supportReference, setSupportReference] = useState('');
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => searchParams.get('tab') === 'support' ? 'tickets' : 'bookings');
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) { setData(empty); setLoading(false); return undefined; }
    const controller = new AbortController(); setData(empty); setLoading(true); setError('');
    accountRequest('', { signal: controller.signal }).then(setData).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isAuthenticated, customerSession?.token, version]);
  async function mutate(path, method, body) {
    if (busy) return false;
    setBusy(true); setError(''); setNotice('');
    try { await accountRequest(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) }); setVersion(v => v + 1); setNotice('Kaydedildi.'); return true; }
    catch (e) { setError(e.message); return false; }
    finally { setBusy(false); }
  }
  async function submitTraveler(e) {
    e.preventDefault(); const form = e.currentTarget;
    if (await mutate('/travelers', 'POST', Object.fromEntries(new FormData(form)))) form.reset();
  }
  async function submitTicket(e) {
    e.preventDefault(); const form = e.currentTarget;
    if (await mutate('/tickets', 'POST', Object.fromEntries(new FormData(form)))) form.reset();
  }
  if (!isAuthenticated) return <main className="travelAccount"><section className="accountWelcome"><Compass size={42} /><p className="accountEyebrow">{ui("VOYHAVEN · HESABIM")}</p><h1>{ui("Seyahatlerin tek bir yerde.")}</h1><p>{ui("Favori otellerini kaydet, rezervasyonlarını takip et ve yolcu bilgilerini hazır tut.")}</p><button className="accountPrimary" onClick={() => openAuthModal()}><LogIn size={18} />{ui("Giriş yap")}</button></section></main>;
  return <main className="travelAccount">
    <section className="accountHero"><div><p className="accountEyebrow">{ui("VOYHAVEN · SEYAHAT HESABIN")}</p><h1>{ui("Merhaba, ")}{displayName || ui('gezgin')}.</h1><p>{ui("Bir sonraki yolculuğuna buradan hazırlan.")}</p>{isGuest && <small>{ui("Misafir hesabındasın. Başka cihazdan erişmek için kalıcı hesabını kullan.")}</small>}</div><Link className="accountExplore" to="/hotels">{ui("Yeni bir rota bul ")}<ArrowRight size={18} /></Link></section>
    <div className="accountStats">{tabs.map(({ id, label, icon: Icon }) => <div key={id}><Icon size={20} /><strong>{data[id]?.length || 0}</strong><span>{ui(label)}</span></div>)}</div>
    <nav className="accountTabs" aria-label={ui("Hesap bölümleri")}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); setNotice(''); }}><Icon size={18} />{ui(label)}</button>)}</nav>
    {error && <div className="accountError" role="alert">{ui(error)} <button onClick={() => setVersion(v => v + 1)}>{ui("Tekrar dene")}</button></div>}{notice && <p role="status" className="accountNotice">{ui(notice)}</p>}
    {loading ? <p className="accountEmpty" role="status">{ui("Hesabın yükleniyor…")}</p> : <section className="accountBody" aria-label={ui(tabs.find(t => t.id === tab).label)}>
      {tab === 'bookings' && <><div className="accountSectionHead"><h2>{ui("Rezervasyonlarım")}</h2><span>{ui("En son 100 kayıt")}</span></div>{!data.bookings.length ? <Empty title={ui("İlk yolculuğun seni bekliyor.")} text="Giriş yaparak oluşturduğun rezervasyonlar burada görünür." /> : data.bookings.map(b => <article className="accountCard" key={b.clientReference}><div className="accountCardTop"><div><small>{b.clientReference}</small><h3>{bookingTitle(b, language)}</h3><p>{b.kind === 'flight' ? b.flight?.segments?.[0]?.departureTime?.replace('T', ' ').slice(0, 16) : b.stay?.checkin || ui('—')} → {b.kind === 'flight' ? b.flight?.segments?.at(-1)?.arrivalTime?.replace('T', ' ').slice(0, 16) : b.stay?.checkout || ui('—')} · {b.stay?.adults || b.guests?.length || 1}{ui(" kişi")}</p></div><span className={`accountBadge ${b.status === 'confirmed' ? 'success' : ''}`}>{ui(statuses[b.status]) || b.status}</span></div><div className="accountCardBottom"><strong>{new Intl.NumberFormat(language, { style: 'currency', currency: b.currency }).format(b.total)}</strong><button aria-expanded={expanded === b.clientReference} onClick={() => setExpanded(expanded === b.clientReference ? '' : b.clientReference)}>{ui("Detayları ")}{expanded === b.clientReference ? ui('kapat') : ui('gör')}</button><button onClick={() => downloadBooking(b, language)}><Download size={16} />{ui("Özeti indir")}</button></div>{expanded === b.clientReference && <div className="accountBookingDetail"><p>{ui("Ödeme: ")}<strong>{ui(statuses[b.paymentStatus]) || b.paymentStatus}</strong>{ui(" · Oluşturulma: ")}{date(b.createdAt)}</p><p>{ui("İletişim: ")}{b.holder?.firstName} {b.holder?.lastName} · {b.holder?.email}</p><p>{ui("Sağlayıcı rezervasyon numarası: ")}{b.reservation?.bookingId || ui("Bekleniyor")}{ui(" · Onay kodu: ")}{b.reservation?.hotelConfirmationCode || b.reservation?.bookingRef || ui("—")}</p><Link to={b.kind === "flight" ? `/flights/checkout?flightRef=${encodeURIComponent(b.clientReference)}` : `/travel/checkout?${b.paymentStatus === "paid" ? "bookingRef" : "cardRef"}=${encodeURIComponent(b.clientReference)}`}>{ui("Rezervasyon durumunu kontrol et")}</Link><p>{ui("Yolcular: ")}{b.guests?.map(g => `${g.firstName} ${g.lastName}`).join(', ')}</p><button onClick={() => { setSupportReference(b.clientReference); setTab('tickets'); }}>{ui("Bu rezervasyon için destek al")}</button></div>}</article>)}</>}
      {tab === 'favorites' && <><div className="accountSectionHead"><h2>{ui("Bir gün gideceğim dediğin yerler.")}</h2><span>{data.favorites.length}{ui("/100 otel")}</span></div>{!data.favorites.length ? <Empty title={ui("Henüz favori otelin yok.")} text="Otel detayındaki kalbe bas; beğendiğin yer burada seni beklesin." /> : <div className="accountFavorites">{data.favorites.map(f => <article className="accountFavorite" key={f.hotelId}>{f.image ? <img src={f.image} alt={ui("")} loading="lazy" /> : <div className="accountImagePlaceholder"><BedDouble size={36} /></div>}<div><h3>{f.name}</h3><Link to={`/travel/hotels/${encodeURIComponent(f.hotelId)}`}>{ui("Oteli incele ")}<ArrowRight size={16} /></Link><button disabled={busy} aria-label={`${f.name} · ${ui("Favoriden çıkar")}`} onClick={() => mutate(`/favorites/${encodeURIComponent(f.hotelId)}`, 'DELETE')}><Heart size={18} fill="currentColor" />{ui("Favoriden çıkar")}</button></div></article>)}</div>}</>}
      {tab === 'travelers' && <><div className="accountSectionHead"><h2>{ui("Yolcu bilgilerin hazır olsun.")}</h2><span>{ui("Ödeme ekranında tek seçimle kullan.")}</span></div><div className="accountTwoColumns"><div>{!data.travelers.length && <p className="accountEmpty">{ui("Henüz kayıtlı yolcu yok.")}</p>}{data.travelers.map(p => <article className="accountCard" key={p._id}><div className="accountCardTop"><div><h3>{p.firstName} {p.lastName}</h3><p>{p.email || ui('E-posta eklenmedi')}<br />{p.phone}</p></div><button disabled={busy} aria-label={`${p.firstName} · ${ui("Yolcu kaydını sil")}`} onClick={() => mutate(`/travelers/${p._id}`, 'DELETE')}><Trash2 size={18} /></button></div></article>)}</div><form className="accountForm" onSubmit={submitTraveler}><h3><Plus size={20} />{ui("Yolcu ekle")}</h3><label>{ui("Ad")}<input name="firstName" required maxLength={100} autoComplete="given-name" /></label><label>{ui("Soyad")}<input name="lastName" required maxLength={100} autoComplete="family-name" /></label><label>{ui("E-posta")}<input name="email" type="email" maxLength={254} autoComplete="email" /></label><label>{ui("Telefon")}<input name="phone" type="tel" maxLength={100} autoComplete="tel" /></label><button className="accountPrimary" disabled={busy || data.travelers.length >= 20}>{ui("Yolcuyu kaydet")}</button></form></div></>}
      {tab === 'tickets' && <><div className="accountSectionHead"><h2>{ui("Birlikte çözelim.")}</h2><span>{ui("Taleplerini ve yanıtlarımızı takip et.")}</span></div><div className="accountTwoColumns"><div>{!data.tickets.length && <p className="accountEmpty">{ui("Henüz destek talebin yok.")}</p>}{data.tickets.map(t => <article className="accountCard" key={t._id}><div className="accountCardTop"><h3>{t.subject}</h3><span className="accountBadge">{ui(statuses[t.status]) || t.status}</span></div><small>{date(t.createdAt)} {t.clientReference && `· ${t.clientReference}`}</small><p className="accountMessage">{t.message}</p>{t.reply && <div className="accountReply"><strong>{ui("VoyHaven yanıtı")}</strong><p className="accountMessage">{t.reply}</p></div>}</article>)}</div><form className="accountForm" onSubmit={submitTicket}><h3><MessageCircle size={20} />{ui("Yeni talep")}</h3><label>{ui("Rezervasyon")}<select name="clientReference" value={supportReference} onChange={e => setSupportReference(e.target.value)}><option value="">{ui("Genel soru")}</option>{data.bookings.map(b => <option key={b.clientReference} value={b.clientReference}>{bookingTitle(b, language)} · {b.clientReference}</option>)}</select></label><label>{ui("Konu")}<input name="subject" required maxLength={200} /></label><label>{ui("Mesajın")}<textarea name="message" required maxLength={3000} rows={5} /></label><button className="accountPrimary" disabled={busy}>{ui("Talebi gönder")}</button></form></div></>}
    </section>}
  </main>;
}
function Empty({ title, text }) {
  const ui = useFlowText();
 return <div className="accountEmpty"><Compass size={34} /><h3>{ui(title)}</h3><p>{ui(text)}</p><Link to="/hotels">{ui("Otelleri keşfet ")}<ArrowRight size={16} /></Link></div>; }
