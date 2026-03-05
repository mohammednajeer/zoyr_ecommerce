import React, { useEffect, useState } from 'react';
import './PreviousOrder.css';
import api from "../../api/api";

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#e8aa40', bg: 'rgba(232,170,64,0.08)',  border: 'rgba(232,170,64,0.25)'  },
  confirmed: { label: 'Confirmed', color: '#60a8dc', bg: 'rgba(96,168,220,0.08)',  border: 'rgba(96,168,220,0.25)'  },
  delivered: { label: 'Delivered', color: '#6fcf97', bg: 'rgba(111,207,151,0.08)', border: 'rgba(111,207,151,0.25)' },
  cancelled: { label: 'Cancelled', color: '#d97060', bg: 'rgba(217,112,96,0.08)',  border: 'rgba(217,112,96,0.25)'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  return (
    <span
      className="po-status-badge"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      <span className="po-status-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function PreviousOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  async function confirm() {
    try {
      await api.post("payments/confirm-payment/");
    } catch {}
  }

  confirm();

}, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("products/my-orders/");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="po-loading">
      <span className="po-dot" /><span className="po-dot" /><span className="po-dot" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="po-empty">
      <div className="po-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <p className="po-empty-title">No orders yet</p>
      <p className="po-empty-sub">Your vehicle reservations will appear here</p>
    </div>
  );

  return (
    <div className="po-list">
      {orders.map((order, i) => {
        const date = new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric"
        });

        return (
          <div
            className="po-card"
            key={order.id}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="po-card-accent" />

            {/* Top row: order meta */}
            <div className="po-card-top">
              <div className="po-order-meta">
                <span className="po-order-id">Order #{i+1}</span>
                <span className="po-order-date">{date}</span>
              </div>
              <StatusBadge status={order.status} />
            </div>

            {/* Main content: image + details */}
            <div className="po-card-body">
              <div className="po-img-wrap">
                <img
                  src={order.product.image}
                  alt={order.product.model}
                  className="po-img"
                />
                <div className="po-img-overlay" />
              </div>

              <div className="po-details">
                <div className="po-vehicle-brand">{order.product.brand}</div>
                <div className="po-vehicle-model">{order.product.model}</div>

                <div className="po-specs">
                  <div className="po-spec">
                    <span className="po-spec-label">Year</span>
                    <span className="po-spec-value">{order.product.year}</span>
                  </div>
                  <div className="po-spec-divider" />
                  <div className="po-spec">
                    <span className="po-spec-label">Fuel</span>
                    <span className="po-spec-value">{order.product.fuel}</span>
                  </div>
                  <div className="po-spec-divider" />
                  <div className="po-spec">
                    <span className="po-spec-label">KMs</span>
                    <span className="po-spec-value">{order.product.kmCover}</span>
                  </div>
                </div>

                <div className="po-price-row">
                  <span className="po-price-label">Total</span>
                  <span className="po-price">${Number(order.product.price).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PreviousOrder;