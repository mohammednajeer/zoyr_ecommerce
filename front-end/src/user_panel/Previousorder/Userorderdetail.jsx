import React, { useEffect, useState } from "react";
import "./Userorderdetail.css";
import NavBar from "../../component/NavBar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";

/* ── Payment status ── */
const STATUS_CLS = {
  paid:      "uod-s-paid",
  pending:   "uod-s-pending",
  confirmed: "uod-s-confirmed",
  delivered: "uod-s-delivered",
  cancelled: "uod-s-cancelled",
};

/* ── Fulfillment order_status ── */
const ORDER_STATUS_CLS = {
  progress:    "uod-s-confirmed",
  delayed:     "uod-s-pending",
  cancelled:   "uod-s-cancelled",
  handed_over: "uod-s-delivered",
};

const ORDER_STATUS_LABEL = {
  progress:    "In Progress",
  delayed:     "Delayed",
  cancelled:   "Cancelled",
  handed_over: "Handed Over",
};

export default function UserOrderDetail() {
  const { id }  = useParams();
  const nav     = useNavigate();

  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("products/my-orders/");
        const found = (res.data || []).find(o => String(o.id) === String(id));
        if (found) setOrder(found);
      } catch {
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <>
      <NavBar />
      <div className="uod-root">
        <div className="uod-bg"><div className="uod-orb uod-orb-1" /><div className="uod-orb uod-orb-2" /><div className="uod-grid" /></div>
        <div className="uod-loading">
          <span className="uod-dot" /><span className="uod-dot" /><span className="uod-dot" />
        </div>
      </div>
    </>
  );

  /* ── Not found ── */
  if (!order) return (
    <>
      <NavBar />
      <div className="uod-root">
        <div className="uod-bg"><div className="uod-orb uod-orb-1" /><div className="uod-grid" /></div>
        <div className="uod-loading">
          <p className="uod-not-found">Order not found</p>
        </div>
      </div>
    </>
  );

  /* ── Derived values ── */
  const imgUrl  = order.product?.image?.url || order.product?.image;
  const sCls    = STATUS_CLS[order.status]             || "uod-s-pending";
  const osCls   = ORDER_STATUS_CLS[order.order_status] || "uod-s-pending";
  const osLabel = ORDER_STATUS_LABEL[order.order_status] || "In Progress";

  /* ── Tab content ── */
  const detailFields = [
    { key: "Order ID",      val: `#${order.id}` },
    { key: "Payment ID",    val: order.payment_id, mono: true },
    { key: "Delivery Date", val: order.delivery_date },
    { key: "Order Date",    val: new Date(order.created_at).toLocaleString() },
    { key: "City",          val: order.city },
    { key: "Address",       val: order.address },
  ];

  const vehicleFields = [
    { key: "Brand",      val: order.product?.brand },
    { key: "Model",      val: order.product?.model },
    { key: "Year",       val: order.product?.year },
    { key: "Fuel Type",  val: order.product?.fuel },
    { key: "Mileage",    val: order.product?.kmCover ? `${Number(order.product.kmCover).toLocaleString()} km` : "—" },
    { key: "Price Paid", val: `$${Number(order.product?.price).toLocaleString()}` },
  ];

  const tabs = [
    { id: "details", label: "Order Details" },
    { id: "vehicle", label: "Vehicle" },
    { id: "support", label: "Support" },
  ];

  return (
    <>
      <NavBar />

      <div className="uod-root">

        {/* Atmosphere */}
        <div className="uod-bg">
          <div className="uod-orb uod-orb-1" />
          <div className="uod-orb uod-orb-2" />
          <div className="uod-grid" />
        </div>

        <div className="uod-page">

          {/* ── Back ── */}
          <button className="uod-back" onClick={() => nav(-1)}>
            <span>←</span> Back to Orders
          </button>

          {/* ══ HERO ══ */}
          <div className="uod-hero">

            {/* Image pane */}
            <div className={`uod-img-wrap ${imgLoaded ? "loaded" : ""}`}>
              {imgUrl
                ? <img src={imgUrl} alt={order.product?.model} onLoad={() => setImgLoaded(true)} />
                : <div className="uod-img-ph">No Image</div>
              }
              <div className="uod-img-overlay" />

              {/* Payment badge — top left */}
              <span className={`uod-status-hero ${sCls}`}>{order.status}</span>

              {/* Fulfillment badge — top right */}
              <span className={`uod-status-hero uod-order-status-hero ${osCls}`}>{osLabel}</span>
            </div>

            {/* Info pane */}
            <div className="uod-hero-info">

              <div className="uod-identity">
                <span className="uod-eyebrow">Your Order</span>
                <h1 className="uod-order-title">Order #{order.id}</h1>
                <div className="uod-hero-meta">
                  <span className="uod-meta-chip">{order.product?.brand} {order.product?.model}</span>
                  <span className="uod-meta-sep" />
                  <span className="uod-meta-chip">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {/* ── Status timeline ── */}
              <div className="uod-timeline">
                <span className="uod-timeline-lbl">Order Progress</span>
                <div className="uod-steps">
                  {[
                    { key: "progress",    icon: "◐", label: "In Progress" },
                    { key: "delayed",     icon: "◑", label: "Delayed"     },
                    { key: "handed_over", icon: "◉", label: "Handed Over" },
                    { key: "cancelled",   icon: "✕", label: "Cancelled"   },
                  ].map((step, idx) => {
                    const isActive  = order.order_status === step.key;
                    const isCancelled = step.key === "cancelled";
                    return (
                      <div key={step.key} className={`uod-step ${isActive ? "uod-step-active" : ""} ${isCancelled ? "uod-step-cancel" : ""}`}>
                        <div className="uod-step-dot">
                          <span>{step.icon}</span>
                        </div>
                        <span className="uod-step-label">{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount block */}
              <div className="uod-amount-block">
                <span className="uod-amount-lbl">Amount Paid</span>
                <span className="uod-amount">${Number(order.product?.price).toLocaleString()}</span>
              </div>

            </div>
          </div>

          {/* ══ TABS ══ */}
          <div className="uod-tabs-wrap">
            <div className="uod-tabs">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`uod-tab ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ══ ORDER DETAILS TAB ══ */}
          {activeTab === "details" && (
            <div className="uod-tab-panel">
              <div className="uod-fields-grid">
                {detailFields.map((f, i) => (
                  <div className="uod-field-card" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="uod-field-key">{f.key}</span>
                    <span className={`uod-field-val ${f.mono ? "mono" : ""}`}>{f.val || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ VEHICLE TAB ══ */}
          {activeTab === "vehicle" && (
            <div className="uod-tab-panel">
              <div className="uod-vehicle-wrap">
                <div className="uod-vehicle-img-wrap">
                  {imgUrl
                    ? <img src={imgUrl} alt={order.product?.model} />
                    : <div className="uod-img-ph">No Image</div>
                  }
                </div>
                <div className="uod-vehicle-fields">
                  {vehicleFields.map((f, i) => (
                    <div className="uod-spec-row" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                      <span className="uod-spec-key">{f.key}</span>
                      <div className="uod-spec-dots" />
                      <span className="uod-spec-val">{f.val || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ SUPPORT TAB ══ */}
          {activeTab === "support" && (
            <div className="uod-tab-panel">
              <div className="uod-support-wrap">

                {/* Header */}
                <div className="uod-support-header">
                  <div className="uod-support-icon">✦</div>
                  <div>
                    <span className="uod-support-eyebrow">We're here for you</span>
                    <h2 className="uod-support-title">Customer Service</h2>
                    <p className="uod-support-sub">
                      Have a question about your order? Our team typically responds within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Contact channels */}
                <div className="uod-contact-grid">

                  <a className="uod-contact-card" href="mailto:support@zoyr.com">
                    <div className="uod-contact-card-accent" />
                    <div className="uod-contact-icon-wrap uod-email">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div className="uod-contact-info">
                      <span className="uod-contact-type">Email Support</span>
                      <span className="uod-contact-value">support@zoyr.com</span>
                      <span className="uod-contact-note">Response within 24 hrs</span>
                    </div>
                    <span className="uod-contact-arrow">→</span>
                  </a>

                  <a className="uod-contact-card" href="tel:+1800000000">
                    <div className="uod-contact-card-accent" />
                    <div className="uod-contact-icon-wrap uod-phone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </div>
                    <div className="uod-contact-info">
                      <span className="uod-contact-type">Phone Support</span>
                      <span className="uod-contact-value">+1 800 000 0000</span>
                      <span className="uod-contact-note">Mon–Sat, 9 AM – 6 PM</span>
                    </div>
                    <span className="uod-contact-arrow">→</span>
                  </a>

                  <a className="uod-contact-card" href="https://wa.me/1800000000" target="_blank" rel="noreferrer">
                    <div className="uod-contact-card-accent" />
                    <div className="uod-contact-icon-wrap uod-whatsapp">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="uod-contact-info">
                      <span className="uod-contact-type">WhatsApp</span>
                      <span className="uod-contact-value">+1 800 000 0000</span>
                      <span className="uod-contact-note">Quick replies guaranteed</span>
                    </div>
                    <span className="uod-contact-arrow">→</span>
                  </a>

                </div>

                {/* Order reference box */}
                <div className="uod-reference-box">
                  <span className="uod-ref-lbl">Your Order Reference</span>
                  <span className="uod-ref-val">#{order.id}</span>
                  <span className="uod-ref-note">Please quote this when contacting support</span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}