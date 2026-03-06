import React, { useEffect, useState } from 'react';
import './OrderPlaced.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/api';

function OrderPlaced() {
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const nav                   = useNavigate();
  const [searchParams]        = useSearchParams();

  useEffect(() => {
    async function init() {
      const sessionId = searchParams.get('session_id');

      try {
        if (sessionId) {
          await api.post('products/confirm-payment/', { session_id: sessionId });
        }

        const res = await api.get('products/my-orders/');
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setOrder(sorted[0] ?? null);

      } catch (err) {
        console.error(err);
        setError('Unable to load order details. Please visit your profile.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);   // eslint-disable-line

  const fmt = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const shortPayId = (id) => id ? `${id.slice(0, 10)}···${id.slice(-6)}` : '—';

  return (
    <div className="oplcont">

      {/* Ambient particles */}
      <div className="particles" aria-hidden>
        {[...Array(20)].map((_, i) => <span key={i} className={`par par-${i % 5}`} />)}
      </div>

      <div className={`opl-card ${loading ? 'is-loading' : ''}`}>

        {/* ── Crest ─────────────────────── */}
        <div className="crest">
          <div className="crest-ring r1" />
          <div className="crest-ring r2" />
          <div className="crest-ring r3" />
          <svg className="crest-svg" viewBox="0 0 60 60" fill="none">
            <path d="M30 6 L34 20 H48 L37 29 L41 43 L30 34 L19 43 L23 29 L12 20 H26 Z"
              stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
            <circle cx="30" cy="30" r="5" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>

        {/* ── Heading ───────────────────── */}
        <p className="eyebrow">Transaction Complete</p>
        <h1 className="opl-title">Order Confirmed</h1>
        <p className="opl-sub">Your acquisition is secured with distinction</p>

        <div className="ornament"><span>◆</span></div>

        {/* ── States ────────────────────── */}
        {loading && (
          <div className="state-block">
            <span className="spinner" />
            <span className="state-txt">Retrieving your order…</span>
          </div>
        )}

        {error && (
          <div className="state-block error">{error}</div>
        )}

        {!loading && !error && order && (
          <>
            {/* Vehicle block */}
            <div className="vehicle-block">
              <p className="vb-label">Vehicle Acquired</p>
              <h2 className="vb-name">
                {order.product?.brand ?? '—'}
                {order.product?.model ? <em> {order.product.model}</em> : ''}
              </h2>
              {order.product?.year && (
                <span className="vb-year">{order.product.year}</span>
              )}
            </div>

            {/* Detail grid */}
            <div className="detail-grid">
              <Cell label="Order Ref" value={`#${order.id}`} accent />
              <Cell label="Client" value={order.name || '—'} />
              <Cell label="Payment ID" value={shortPayId(order.payment_id)} mono />
              <Cell label="Status">
                <span className={`status-pill ${order.status}`}>
                  {order.status?.toUpperCase()}
                </span>
              </Cell>
              <Cell label="Delivery Address"
                value={[order.address, order.city, order.pincode].filter(Boolean).join(', ') || '—'}
                wide small />
              <Cell label="Scheduled Delivery" wide>
                <span className="delivery-val">
                  <svg viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="12" rx="2"
                      stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M1 7h14M5 1v4M11 1v4"
                      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  {fmt(order.delivery_date)}
                </span>
              </Cell>
            </div>

            {/* Notice */}
            <p className="notice">
              Confirmation sent to <strong>{order.email || 'your email'}</strong>.
              Our concierge will contact you at&nbsp;
              <strong>{order.phone || 'your registered number'}</strong> to
              coordinate white-glove delivery.
            </p>
          </>
        )}

        {!loading && !error && !order && (
          <p className="notice">Your order has been placed. Check your profile for details.</p>
        )}

        <div className="ornament thin"><span>◆</span></div>

        {/* ── Timeline ──────────────────── */}
        <div className="timeline">
          <p className="tl-title">Acquisition Journey</p>

          {[
            { label: 'Order Placed',        sub: 'Vehicle held exclusively for you',     state: 'done' },
            { label: 'Payment Confirmed',   sub: 'Secure transaction processed',          state: 'done' },
            { label: 'Dealer Verification', sub: 'Our team reviewing your request',       state: 'active' },
            { label: 'White-Glove Delivery',sub: 'Present valid government ID at handover',state: '' },
          ].map(({ label, sub, state }, i) => (
            <div key={i} className={`tl-item ${state}`}>
              <div className="tl-track">
                <div className={`tl-dot ${state}`} />
                {i < 3 && <div className={`tl-line ${state === 'done' ? 'done' : ''}`} />}
              </div>
              <div className="tl-body">
                <span className="tl-label">{label}</span>
                <span className="tl-sub">{sub}</span>
                {state === 'done'   && <span className="tl-badge done">Completed</span>}
                {state === 'active' && <span className="tl-badge active">In Progress</span>}
                {!state             && <span className="tl-badge">Upcoming</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Actions ───────────────────── */}
        <div className="opl-actions">
          <button className="opl-btn secondary" onClick={() => nav('/')}>
            Browse Vehicles
          </button>
          <button className="opl-btn primary" onClick={() => nav('/profile')}>
            View My Orders
          </button>
        </div>

        <p className="brand-sig">◆&nbsp;&nbsp;LUXURY AUTO &nbsp;·&nbsp; EST. MMIV&nbsp;&nbsp;◆</p>
      </div>
    </div>
  );
}

/* Helper Cell component */
function Cell({ label, value, children, accent, mono, wide, small }) {
  return (
    <div className={`dc ${wide ? 'wide' : ''} ${accent ? 'accent' : ''}`}>
      <span className="dc-label">{label}</span>
      {children ?? (
        <span className={`dc-val ${mono ? 'mono' : ''} ${small ? 'small' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default OrderPlaced;