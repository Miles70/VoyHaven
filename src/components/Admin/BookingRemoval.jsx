import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminRequest } from '../../services/adminApi';

export default function BookingRemoval({ reference, onClose, onRemoved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const panel = useRef(null);
  useEffect(() => { panel.current?.focus(); panel.current?.scrollIntoView({ block: 'center' }); }, []);
  async function remove(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try {
      const result = await adminRequest(`/bookings/${encodeURIComponent(reference)}`, { method: 'DELETE', body: { confirmation: reference } });
      onRemoved(result);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <section className="adminEditor adminDeletePanel" ref={panel} tabIndex={-1} aria-labelledby="booking-removal-title">
    <h2 id="booking-removal-title">Rezervasyon kaydını sil</h2>
    <p className="adminMono">{reference}</p>
    <p className="adminHint">Bu rezervasyon kaydı arşivlenerek rezervasyon ve ödeme listelerinden, ayrıca yönetim özetlerinden kaldırılır. Otel veya uçuş iptali ve para iadesi yapılmaz. Silinen kaydı geri alabilirsin.</p>
    <form onSubmit={remove}>
      <div className="adminBookingActions">
        <button type="submit" className="adminDanger" disabled={busy}><Trash2 size={16} />{busy ? 'Siliniyor…' : 'Evet, kaydı sil'}</button>
        <button type="button" onClick={onClose} disabled={busy}>Vazgeç</button>
      </div>
    </form>
    {error && <p className="adminError" role="alert">{error}</p>}
  </section>;
}
