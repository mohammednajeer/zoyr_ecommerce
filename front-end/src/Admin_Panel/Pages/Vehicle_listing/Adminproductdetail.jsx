import React, { useEffect, useState } from "react";
import "./AdminProductDetail.css";
import SideBar from "../../Sidebar/SideBar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";

const AVAIL_CLS = {
  available: "apd-badge-available",
  reserved:  "apd-badge-reserved",
  sold:      "apd-badge-sold",
};

const ORDER_STATUS_CLS = {
  paid:      "apd-os-paid",
  pending:   "apd-os-pending",
  confirmed: "apd-os-confirmed",
  delivered: "apd-os-delivered",
  cancelled: "apd-os-cancelled",
};

export default function AdminProductDetail() {
  const { id }  = useParams();
  const nav     = useNavigate();

  const [product,   setProduct]   = useState(null);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => {
    async function load() {
      try {
        const [pRes, oRes] = await Promise.all([
          api.get(`products/${id}/`),
          api.get(`products/admin/orders/`).catch(() => ({ data: [] })),
        ]);
        setProduct(pRes.data);
        const filtered = (oRes.data || []).filter(
          o => String(o.product?.id ?? o.product) === String(id)
        );
        setOrders(filtered);
      } catch {
        toast.error("Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function toggleStatus() {
    const next = product.status === "active" ? "inactive" : "active";
    try {
      await api.patch(`products/${id}/`, { status: next });
      setProduct(p => ({ ...p, status: next }));
      toast.dark(`Vehicle ${next}`);
    } catch {
      toast.error("Update failed");
    }
  }

  if (loading) return (
    <div className="apd-cont">
      <SideBar />
      <div className="apd-body">
        <div className="apd-loading-wrap">
          <span className="apd-dot" /><span className="apd-dot" /><span className="apd-dot" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="apd-cont">
      <SideBar />
      <div className="apd-body">
        <div className="apd-loading-wrap">
          <p className="apd-not-found">Vehicle not found</p>
        </div>
      </div>
    </div>
  );

  const imgUrl   = product.image?.url || product.image;
  const availCls = AVAIL_CLS[product.availability] || AVAIL_CLS.available;

  const specs = [
    { key: "Brand",        val: product.brand },
    { key: "Model",        val: product.model },
    { key: "Year",         val: product.year },
    { key: "Fuel Type",    val: product.fuel },
    { key: "Mileage",      val: product.kmCover ? `${Number(product.kmCover).toLocaleString()} km` : "—" },
    { key: "Availability", val: product.availability },
    { key: "Status",       val: product.status },
    { key: "Listed Price", val: `$${Number(product.price).toLocaleString()}` },
  ];

  return (
    <div className="apd-cont">
      <SideBar />

      <div className="apd-body">

        {/* Back */}
        <button className="apd-back-btn" onClick={() => nav("/VehicleListing")}>
          <span>←</span> Back to Listings
        </button>

        {/* ══ HERO ══ */}
        <div className="apd-hero">

          {/* Image */}
          <div className={`apd-img-wrap ${imgLoaded ? "apd-img-loaded" : ""}`}>
            {imgUrl
              ? <img src={imgUrl} alt={product.model} onLoad={() => setImgLoaded(true)} />
              : <div className="apd-img-placeholder">No Image</div>
            }
            <div className="apd-img-overlay" />
            <span className={`apd-avail-badge ${availCls}`}>{product.availability}</span>
            <span className={`apd-status-pill ${product.status}`}>{product.status}</span>
          </div>

          {/* Info */}
          <div className="apd-hero-info">

            <div className="apd-identity">
              <span className="apd-eyebrow">Vehicle Detail</span>
              <p className="apd-brand-lbl">{product.brand}</p>
              <h1 className="apd-model-title">{product.model}</h1>
              <div className="apd-meta-row">
                <span className="apd-meta-chip">ID #{product.id}</span>
                <span className="apd-meta-sep" />
                <span className="apd-meta-chip">{product.year}</span>
                <span className="apd-meta-sep" />
                <span className="apd-meta-chip">{product.fuel}</span>
              </div>
            </div>

            <div className="apd-price-block">
              <span className="apd-price-lbl">Listed Price</span>
              <span className="apd-price">${Number(product.price).toLocaleString()}</span>
            </div>

            <div className="apd-quick-strip">
              {[
                { l: "Year",    v: product.year },
                { l: "Fuel",    v: product.fuel },
                { l: "Mileage", v: `${Number(product.kmCover).toLocaleString()} km` },
              ].map(s => (
                <div className="apd-qs-item" key={s.l}>
                  <span className="apd-qs-lbl">{s.l}</span>
                  <span className="apd-qs-val">{s.v}</span>
                </div>
              ))}
            </div>

            <div className="apd-actions">
              <button className="apd-btn-edit" onClick={() => nav(`/vehicleUpdate/${id}`)}>
                Edit Vehicle
              </button>
              <button
                className={`apd-btn-toggle ${product.status === "active" ? "deactivate" : "activate"}`}
                onClick={toggleStatus}
              >
                {product.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>

          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="apd-tabs-wrap">
          <div className="apd-tabs">
            {[
              { id: "specs",  label: "Specifications" },
              {
                id: "orders",
                label: "Sale Record",
                badge: product.availability === "sold"
                  ? "Sold"
                  : product.availability === "reserved"
                  ? "Reserved"
                  : "Unsold",
                badgeCls: product.availability === "sold"
                  ? "apd-tab-badge sold"
                  : product.availability === "reserved"
                  ? "apd-tab-badge reserved"
                  : "apd-tab-badge unsold",
              },
            ].map(t => (
              <button
                key={t.id}
                className={`apd-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
                {t.badge && <span className={t.badgeCls}>{t.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ══ SPECS ══ */}
        {activeTab === "specs" && (
          <div className="apd-tab-panel">
            <div className="apd-spec-grid">
              {specs.map((s, i) => (
                <div
                  className="apd-spec-row"
                  key={s.key}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="apd-spec-key">{s.key}</span>
                  <div className="apd-spec-dots" />
                  <span className="apd-spec-val">{s.val ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ORDERS ══ */}
        {activeTab === "orders" && (
          <div className="apd-tab-panel">
            {orders.length === 0 ? (
              <div className="apd-empty">
                <div className="apd-empty-icon">🚗</div>
                <p>
                  {product.availability === "reserved"
                    ? "Vehicle is reserved — awaiting payment confirmation"
                    : "Vehicle has not been sold yet"}
                </p>
              </div>
            ) : (
              <div className="apd-orders-list">
                {orders.map((order, i) => {
                  const osCls = ORDER_STATUS_CLS[order.status] || "apd-os-pending";
                  return (
                    <div
                      className="apd-order-card"
                      key={order.id}
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <div className="apd-oc-header">
                        <div className="apd-oc-id-group">
                          <span className="apd-oc-id">Order #{order.id}</span>
                          <span className="apd-oc-date">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric"
                            })}
                          </span>
                        </div>
                        <span className={`apd-order-status ${osCls}`}>{order.status}</span>
                      </div>

                      <div className="apd-oc-body">
                        <div className="apd-oc-customer">
                          <div className="apd-oc-avatar">
                            {(order.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="apd-oc-cdetails">
                            <span className="apd-oc-name">{order.name || "—"}</span>
                            <span className="apd-oc-email">{order.email || "—"}</span>
                            <span className="apd-oc-phone">{order.phone || "—"}</span>
                          </div>
                        </div>

                        <div className="apd-oc-vdivider" />

                        <div className="apd-oc-info-grid">
                          {[
                            { k: "Payment ID",    v: order.payment_id,   mono: true },
                            { k: "Delivery Date", v: order.delivery_date },
                            { k: "City",          v: order.city },
                            { k: "Address",       v: order.address },
                            { k: "Pincode",       v: order.pincode },
                          ].map(r => (
                            <div className="apd-oci-row" key={r.k}>
                              <span className="apd-oci-key">{r.k}</span>
                              <span className={`apd-oci-val${r.mono ? " mono" : ""}`}>{r.v || "—"}</span>
                            </div>
                          ))}
                        </div>

                        <div className="apd-oc-amount">
                          <span className="apd-oca-lbl">Amount</span>
                          <span className="apd-oca-val">${Number(product.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}