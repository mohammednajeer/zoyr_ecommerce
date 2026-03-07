import React, { useEffect, useState } from "react";
import "./AdminOrderDetail.css";
import SideBar from "../../Sidebar/SideBar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";

const STATUS_OPTIONS = ["pending", "confirmed", "delivered", "cancelled"];

const STATUS_CLS = {
  paid:      "aod-s-paid",
  pending:   "aod-s-pending",
  confirmed: "aod-s-confirmed",
  delivered: "aod-s-delivered",
  cancelled: "aod-s-cancelled",
};

export default function AdminOrderDetail() {
  const { id }  = useParams();
  const nav     = useNavigate();

  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("customer");
  const [updating,  setUpdating]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`products/admin/orders/`);
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

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await api.patch(`products/admin/orders/${id}/`, { status: newStatus });
      setOrder(o => ({ ...o, status: newStatus }));
      toast.dark(`Status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="aod-cont">
      <SideBar />
      <div className="aod-body">
        <div className="aod-loading">
          <span className="aod-dot" /><span className="aod-dot" /><span className="aod-dot" />
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="aod-cont">
      <SideBar />
      <div className="aod-body">
        <div className="aod-loading">
          <p className="aod-not-found">Order not found</p>
        </div>
      </div>
    </div>
  );

  const imgUrl   = order.product?.image?.url || order.product?.image;
  const sCls     = STATUS_CLS[order.status] || "aod-s-pending";

  const customerFields = [
    { key: "Full Name",   val: order.name },
    { key: "Email",       val: order.email },
    { key: "Phone",       val: order.phone },
    { key: "City",        val: order.city },
    { key: "Address",     val: order.address },
    { key: "Pincode",     val: order.pincode },
  ];

  const transactionFields = [
    { key: "Order ID",       val: `#${order.id}` },
    { key: "Payment ID",     val: order.payment_id,   mono: true },
    { key: "Order Status",   val: order.status },
    { key: "Delivery Date",  val: order.delivery_date },
    { key: "Order Date",     val: new Date(order.created_at).toLocaleString() },
    { key: "Amount Paid",    val: `$${Number(order.product?.price).toLocaleString()}` },
  ];

  const vehicleFields = [
    { key: "Brand",       val: order.product?.brand },
    { key: "Model",       val: order.product?.model },
    { key: "Year",        val: order.product?.year },
    { key: "Fuel Type",   val: order.product?.fuel },
    { key: "Mileage",     val: order.product?.kmCover ? `${Number(order.product.kmCover).toLocaleString()} km` : "—" },
    { key: "List Price",  val: `$${Number(order.product?.price).toLocaleString()}` },
  ];

  const tabs = [
    { id: "customer",    label: "Customer" },
    { id: "transaction", label: "Transaction" },
    { id: "vehicle",     label: "Vehicle" },
  ];

  return (
    <div className="aod-cont">
      <SideBar />

      <div className="aod-body">

        {/* ── Back ── */}
        <button className="aod-back" onClick={() => nav("/ordersList")}>
          <span>←</span> Back to Orders
        </button>

        {/* ══ HERO ══ */}
        <div className="aod-hero">

          {/* Left — image */}
          <div className={`aod-img-wrap ${imgLoaded ? "loaded" : ""}`}>
            {imgUrl
              ? <img src={imgUrl} alt={order.product?.model} onLoad={() => setImgLoaded(true)} />
              : <div className="aod-img-ph">No Image</div>
            }
            <div className="aod-img-overlay" />
            <span className={`aod-status-hero ${sCls}`}>{order.status}</span>
          </div>

          {/* Right — identity */}
          <div className="aod-hero-info">

            <div className="aod-identity">
              <span className="aod-eyebrow">Order Detail</span>
              <h1 className="aod-order-title">Order #{order.id}</h1>
              <div className="aod-hero-meta">
                <span className="aod-meta-chip">{order.product?.brand} {order.product?.model}</span>
                <span className="aod-meta-sep" />
                <span className="aod-meta-chip">
                  {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Customer snapshot */}
            <div className="aod-customer-snap">
              <div className="aod-avatar">
                {(order.name || "?")[0].toUpperCase()}
              </div>
              <div className="aod-snap-info">
                <span className="aod-snap-name">{order.name || "—"}</span>
                <span className="aod-snap-email">{order.email || "—"}</span>
                <span className="aod-snap-phone">{order.phone || "—"}</span>
              </div>
            </div>

            {/* Amount */}
            <div className="aod-amount-block">
              <span className="aod-amount-lbl">Amount Paid</span>
              <span className="aod-amount">${Number(order.product?.price).toLocaleString()}</span>
            </div>

            {/* Status updater */}
            <div className="aod-status-control">
              <span className="aod-sc-lbl">Update Status</span>
              <div className="aod-sc-btns">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    className={`aod-sc-btn ${s} ${order.status === s ? "active" : ""}`}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating || order.status === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="aod-tabs-wrap">
          <div className="aod-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`aod-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CUSTOMER TAB ══ */}
        {activeTab === "customer" && (
          <div className="aod-tab-panel">
            <div className="aod-fields-grid">
              {customerFields.map((f, i) => (
                <div className="aod-field-card" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="aod-field-key">{f.key}</span>
                  <span className="aod-field-val">{f.val || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TRANSACTION TAB ══ */}
        {activeTab === "transaction" && (
          <div className="aod-tab-panel">
            <div className="aod-fields-grid">
              {transactionFields.map((f, i) => (
                <div className="aod-field-card" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="aod-field-key">{f.key}</span>
                  <span className={`aod-field-val ${f.mono ? "mono" : ""} ${f.key === "Order Status" ? `aod-status-val ${sCls}` : ""}`}>
                    {f.key === "Amount Paid"
                      ? <span className="aod-field-price">{f.val}</span>
                      : f.val || "—"
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ VEHICLE TAB ══ */}
        {activeTab === "vehicle" && (
          <div className="aod-tab-panel">
            <div className="aod-vehicle-wrap">
              {/* vehicle image */}
              <div className="aod-vehicle-img-wrap">
                {imgUrl
                  ? <img src={imgUrl} alt={order.product?.model} />
                  : <div className="aod-img-ph">No Image</div>
                }
              </div>
              {/* vehicle fields */}
              <div className="aod-vehicle-fields">
                {vehicleFields.map((f, i) => (
                  <div className="aod-spec-row" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="aod-spec-key">{f.key}</span>
                    <div className="aod-spec-dots" />
                    <span className="aod-spec-val">{f.val || "—"}</span>
                  </div>
                ))}
                <button
                  className="aod-view-vehicle-btn"
                  onClick={() => nav(`/vehicleDetail/${order.product?.id}`)}
                >
                  View Full Vehicle Page →
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}