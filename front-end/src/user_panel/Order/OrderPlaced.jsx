import React, { useEffect, useState } from 'react';
import './OrderPlaced.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/api';

const FULFILLMENT = {
  progress:    { label: 'In Progress',  color: 'gold',  step: 2 },
  delayed:     { label: 'Delayed',      color: 'amber', step: 2 },
  cancelled:   { label: 'Cancelled',    color: 'red',   step: 1 },
  handed_over: { label: 'Handed Over',  color: 'green', step: 4 },
};

const STEPS = [
  { label: 'Order Placed',        sub: 'Vehicle held exclusively for you' },
  { label: 'Payment Confirmed',   sub: 'Secure transaction processed' },
  { label: 'Dealer Verification', sub: 'Our team reviewing your request' },
  { label: 'En Route to You',     sub: 'White-glove logistics underway' },
  { label: 'Handed Over',         sub: 'Present valid government ID' },
];

export default function OrderPlaced() {
  const [order, setOrder] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setError]  = useState(null);
  const nav                = useNavigate();
  const [sp]               = useSearchParams();

  useEffect(() => {
    (async () => {
      const sid = sp.get('session_id');
      try {
        if (sid) await api.post('products/confirm-payment/', { session_id: sid });
        const res    = await api.get('products/my-orders/');
        const sorted = [...res.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const latest = sorted[0] ?? null;
        // Debug: inspect what the API actually returns for delivery_date
        if (latest) console.log('[OrderPlaced] delivery_date raw value:', latest.delivery_date, '| type:', typeof latest.delivery_date);
        setOrder(latest);
      } catch (e) {
        console.error(e);
        setError('Unable to load order details. Please visit your profile.');
      } finally { setLoad(false); }
    })();
  }, []); // eslint-disable-line

  /**
   * Django DateField returns "YYYY-MM-DD".
   * Passing that string directly to new Date() treats it as UTC midnight,
   * which shifts the day backwards in timezones ahead of UTC (e.g. IST).
   * We parse year/month/day manually so the local date is always correct.
   */
  const fmt = (d) => {
    if (!d) return '—';
    const s = String(d).trim();
    // "YYYY-MM-DD" — date-only (Django DateField)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // ISO datetime string (created_at, etc.)
    const dt = new Date(s);
    return isNaN(dt.getTime()) ? s : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtPrice = p  => p  ? `$ ${Number(p).toLocaleString('en-IN')}` : '—';
  const shortId  = id => id ? `${id.slice(0, 10)}···${id.slice(-6)}`   : '—';

  const fi         = FULFILLMENT[order?.order_status] ?? FULFILLMENT.progress;
  const activeStep = order ? fi.step : 0;
  const cancelled  = order?.order_status === 'cancelled';

  return (
    <div className="opl-root">
      <div className="opl-orb opl-orb-a" aria-hidden />
      <div className="opl-orb opl-orb-b" aria-hidden />

      <div className={`opl-card${loading ? ' loading' : ''}`}>

        {/* ══ LEFT ══════════════════════════════════════ */}
        <aside className="opl-left">

          <div className="opl-emblem">
            <div className={`opl-emblem-ring r1${cancelled ? ' cancelled' : ''}`} />
            <div className={`opl-emblem-ring r2${cancelled ? ' cancelled' : ''}`} />
            <div className={`opl-emblem-ring r3${cancelled ? ' cancelled' : ''}`} />
            <svg className="opl-hex" viewBox="0 0 80 92" fill="none">
              <polygon points="40,3 77,23 77,69 40,89 3,69 3,23"
                stroke="currentColor" strokeWidth="1.2" fill="none" />
              <polygon points="40,16 66,31 66,61 40,76 14,61 14,31"
                stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
            </svg>
            {cancelled
              ? <span className="opl-emblem-x">✕</span>
              : <svg className="opl-emblem-check" viewBox="0 0 32 32" fill="none">
                  <polyline points="6,17 13,25 26,10" stroke="currentColor"
                    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
          </div>

          <span className="opl-eyebrow">Transaction Complete</span>
          <h1 className="opl-title">{cancelled ? 'Order Cancelled' : 'Order Confirmed'}</h1>
          <p className="opl-tagline">
            {cancelled ? 'Your order has been cancelled.' : 'Your acquisition is secured.'}
          </p>

          <div className="opl-rule"><span>◆</span></div>

          {!loading && !error && order && (
            <div className="opl-spotlight">
              <p className="opl-spot-label">Vehicle Acquired</p>
              <p className="opl-spot-name">
                <strong>{order.product?.brand ?? '—'}</strong>
                {order.product?.model && <em> {order.product.model}</em>}
              </p>
              {order.product?.year && <span className="opl-spot-year">{order.product.year}</span>}
              <div className="opl-specs">
                {order.product?.fuel    && <SpecBadge icon="⛽" val={order.product.fuel} />}
                {order.product?.kmCover && <SpecBadge icon="🛣" val={`${Number(order.product.kmCover).toLocaleString()} km`} />}
                {order.product?.price   && <SpecBadge icon="₹"  val={fmtPrice(order.product.price)} gold />}
              </div>
            </div>
          )}

          <div className="opl-rule thin"><span>◇</span></div>

          {!cancelled && (
            <nav className="opl-tl" aria-label="order progress">
              <p className="opl-tl-head">Acquisition Journey</p>
              {STEPS.map(({ label, sub }, i) => {
                const done   = i < activeStep;
                const active = i === activeStep;
                return (
                  <div key={i} className={`opl-tl-item${done ? ' done' : active ? ' active' : ''}`}>
                    <div className="opl-tl-track">
                      <div className={`opl-tl-node${done ? ' done' : active ? ' active' : ''}`}>
                        {done   && <CheckMini />}
                        {active && <span className="opl-tl-pulse" />}
                      </div>
                      {i < STEPS.length - 1 &&
                        <div className={`opl-tl-rail${done ? ' done' : ''}`} />}
                    </div>
                    <div className="opl-tl-body">
                      <span className="opl-tl-label">{label}</span>
                      <span className="opl-tl-sub">{sub}</span>
                      {done          && <span className="opl-chip done">Completed</span>}
                      {active        && <span className={`opl-chip active c-${fi.color}`}>{fi.label}</span>}
                      {!done && !active && <span className="opl-chip">Upcoming</span>}
                    </div>
                  </div>
                );
              })}
            </nav>
          )}

          <p className="opl-brand-sig">◆&nbsp; LUXURY AUTO &nbsp;·&nbsp; EST. MMIV &nbsp;◆</p>
        </aside>

        {/* ══ RIGHT ═════════════════════════════════════ */}
        <main className="opl-right">

          {loading && (
            <div className="opl-state">
              <span className="opl-spinner" /><span>Retrieving your order…</span>
            </div>
          )}
          {error && <div className="opl-state err">{error}</div>}

          {!loading && !error && order && <>

            <div className="opl-rhead">
              <div>
                <p className="opl-rh-label">Order Reference</p>
                <p className="opl-rh-id">#{order.id}</p>
              </div>
              <div className="opl-rh-pills">
                <span className={`opl-pill pay-${order.status}`}>
                  {order.status?.toUpperCase()}
                </span>
                <span className={`opl-pill ful-${order.order_status}`}>
                  {FULFILLMENT[order.order_status]?.label ?? order.order_status}
                </span>
              </div>
            </div>

            <div className="opl-hr" />

            <div className="opl-grid">
              <IC label="Client Name"   val={order.name  || '—'} />
              <IC label="Contact"       val={order.phone || '—'} />
              <IC label="Email Address" val={order.email || '—'} wide />
              <IC label="Delivery Address"
                val={[order.address, order.city, order.pincode].filter(Boolean).join(', ') || '—'}
                wide />
              <IC label="Scheduled Delivery">
                <DateVal val={fmt(order.delivery_date)} green />
              </IC>
              <IC label="Order Placed">
                <DateVal val={fmt(order.created_at)} />
              </IC>
            </div>

            <div className="opl-hr" />

            <div className="opl-pay-strip">
              <div>
                <p className="opl-ps-label">Payment ID</p>
                <p className="opl-ps-id">{shortId(order.payment_id)}</p>
              </div>
              <div className="opl-ps-amount">
                <p className="opl-ps-label">Amount Settled</p>
                <p className="opl-ps-price">{fmtPrice(order.product?.price)}</p>
              </div>
            </div>

            <div className="opl-hr" />

            <div className="opl-notice">
              <InfoIcon />
              <p>
                Confirmation sent to <strong>{order.email || 'your email'}</strong>.
                Our concierge will reach you at <strong>{order.phone || 'your registered number'}</strong> to
                coordinate delivery. Keep a valid government-issued ID ready for handover.
              </p>
            </div>
          </>}

          {!loading && !error && !order && (
            <p className="opl-empty">Order placed. Check your profile for details.</p>
          )}

          {/* ── action buttons ── */}
          <div className="opl-actions">
            <button className="opl-btn opl-btn-outline" onClick={() => nav('/')}>
              <BrowseIcon />
              <span>Browse Vehicles</span>
            </button>
            <button className="opl-btn opl-btn-solid" onClick={() => nav('/profile')}>
              <span>My Orders</span>
              <ArrowRight />
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ── helpers ─────────────────────────────────────── */
function SpecBadge({ icon, val, gold }) {
  return <span className={`opl-spec${gold ? ' gold' : ''}`}><em>{icon}</em>{val}</span>;
}

function IC({ label, val, children, wide }) {
  return (
    <div className={`ic${wide ? ' wide' : ''}`}>
      <span className="ic-label">{label}</span>
      {children ?? <span className="ic-val">{val}</span>}
    </div>
  );
}

function DateVal({ val, green }) {
  return (
    <span className={`opl-dateval${green ? ' green' : ''}`}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1 7h14M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {val}
    </span>
  );
}

function CheckMini() {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden>
      <polyline points="2,8 6,12 12,4" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="opl-info-ico">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10 6.5v4.5M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BrowseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
