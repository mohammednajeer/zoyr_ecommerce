import React, { useEffect, useState } from "react";
import "./Adminorderdetail.css";
import SideBar from "../../Sidebar/SideBar";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/api";

const STATUS_CLS = {
  paid:      "aod-s-paid",
  pending:   "aod-s-pending",
  confirmed: "aod-s-confirmed",
  delivered: "aod-s-delivered",
  cancelled: "aod-s-cancelled",
};

const ORDER_STATUS_OPTIONS = ["progress", "delayed", "cancelled", "handed_over"];

const ORDER_STATUS_CLS = {
  progress:    "aod-s-confirmed",
  delayed:     "aod-s-pending",
  cancelled:   "aod-s-cancelled",
  handed_over: "aod-s-delivered",
};

// ── Human-readable labels & confirmation messages per status ──
const STATUS_META = {
  progress: {
    label:   "In Progress",
    confirm: "Mark this order as In Progress?",
    detail:  "The order will be moved back to active processing.",
    color:   "#5b9bc8",
  },
  delayed: {
    label:   "Delayed",
    confirm: "Mark this order as Delayed?",
    detail:  "The customer will see their order is delayed. You can still update the status later.",
    color:   "#c8a96e",
  },
  cancelled: {
    label:   "Cancel Order",
    confirm: "Are you sure you want to CANCEL this order?",
    detail:  "This action is permanent and cannot be undone. The vehicle will be made available again.",
    color:   "#d97070",
    danger:  true,
  },
  handed_over: {
    label:   "Handed Over",
    confirm: "Mark this order as Handed Over?",
    detail:  "Confirm that the vehicle has been physically handed over to the customer.",
    color:   "#6fcf97",
  },
};

// ── Confirmation Modal ──
function ConfirmModal({ status, onConfirm, onCancel }) {
  const meta = STATUS_META[status];
  return (
    <div className="aod-modal-overlay" onClick={onCancel}>
      <div className="aod-modal" onClick={e => e.stopPropagation()}>
        <div className="aod-modal-icon" style={{ color: meta.color }}>
          {meta.danger ? "⚠" : "◆"}
        </div>
        <h2 className="aod-modal-title">{meta.confirm}</h2>
        <p className="aod-modal-detail">{meta.detail}</p>
        <div className="aod-modal-actions">
          <button className="aod-modal-cancel" onClick={onCancel}>
            Go Back
          </button>
          <button
            className={`aod-modal-confirm ${meta.danger ? "danger" : ""}`}
            style={{ "--confirm-color": meta.color }}
            onClick={onConfirm}
          >
            {meta.danger ? "Yes, Cancel Order" : `Confirm — ${meta.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const nav    = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("customer");
  const [updating,   setUpdating]   = useState(false);
  const [imgLoaded,  setImgLoaded]  = useState(false);

  // ── Modal state ──
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res   = await api.get(`products/admin/orders/`);
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

  // ── Step 1: user clicks a status button → open modal ──
  function requestStatusChange(newStatus) {
    if (order?.order_status === "cancelled") return;   // hard block
    if (order?.order_status === newStatus)  return;   // already active
    setPendingStatus(newStatus);
  }

  // ── Step 2: user confirms in modal → call API ──
  async function confirmStatusChange() {
    const newStatus = pendingStatus;
    setPendingStatus(null);
    setUpdating(true);
    try {
      await api.patch(`products/admin/orders/${id}/`, { order_status: newStatus });
      setOrder(o => ({ ...o, order_status: newStatus }));
      toast.dark(
        newStatus === "cancelled"
          ? "Order cancelled — vehicle is now available again"
          : `Status updated to ${STATUS_META[newStatus].label}`
      );
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  // ── Derived ──
  const isCancelled = order?.order_status === "cancelled";

  if (loading) return (
    <div className="aod-cont"><SideBar />
      <div className="aod-body">
        <div className="aod-loading">
          <span className="aod-dot" /><span className="aod-dot" /><span className="aod-dot" />
        </div>
      </div>
    </div>
  );

  if (!order) return (
    <div className="aod-cont"><SideBar />
      <div className="aod-body">
        <div className="aod-loading">
          <p className="aod-not-found">Order not found</p>
        </div>
      </div>
    </div>
  );

  const imgUrl = order.product?.image?.url || order.product?.image;
  const sCls   = STATUS_CLS[order.status]             || "aod-s-pending";
  const osCls  = ORDER_STATUS_CLS[order.order_status] || "aod-s-pending";

  const customerFields = [
    { key: "Full Name", val: order.name },
    { key: "Email",     val: order.email },
    { key: "Phone",     val: order.phone },
    { key: "City",      val: order.city },
    { key: "Address",   val: order.address },
    { key: "Pincode",   val: order.pincode },
  ];

  const transactionFields = [
    { key: "Order ID",       val: `#${order.id}` },
    { key: "Payment ID",     val: order.payment_id, mono: true },
    { key: "Payment Status", val: order.status,              isPayStatus:   true },
    { key: "Order Status",   val: order.order_status?.replace("_", " "), isOrderStatus: true },
    { key: "Delivery Date",  val: order.delivery_date },
    { key: "Order Date",     val: new Date(order.created_at).toLocaleString() },
    { key: "Amount Paid",    val: `$${Number(order.product?.price).toLocaleString()}`, isPrice: true },
  ];

  const vehicleFields = [
    { key: "Brand",      val: order.product?.brand },
    { key: "Model",      val: order.product?.model },
    { key: "Year",       val: order.product?.year },
    { key: "Fuel Type",  val: order.product?.fuel },
    { key: "Mileage",    val: order.product?.kmCover ? `${Number(order.product.kmCover).toLocaleString()} km` : "—" },
    { key: "List Price", val: `$${Number(order.product?.price).toLocaleString()}` },
  ];

  const tabs = [
    { id: "customer",    label: "Customer" },
    { id: "transaction", label: "Transaction" },
    { id: "vehicle",     label: "Vehicle" },
  ];

  return (
    <div className="aod-cont">
      <SideBar />

      {/* ── Confirmation modal (rendered when pendingStatus is set) ── */}
      {pendingStatus && (
        <ConfirmModal
          status={pendingStatus}
          onConfirm={confirmStatusChange}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      <div className="aod-body">
        <button className="aod-back" onClick={() => nav("/ordersList")}>
          <span>←</span> Back to Orders
        </button>

        {/* ══ HERO ══ */}
        <div className="aod-hero">
          <div className={`aod-img-wrap ${imgLoaded ? "loaded" : ""}`}>
            {imgUrl
              ? <img src={imgUrl} alt={order.product?.model} onLoad={() => setImgLoaded(true)} />
              : <div className="aod-img-ph">No Image</div>
            }
            <div className="aod-img-overlay" />
            <span className={`aod-status-hero ${sCls}`}>{order.status}</span>
            <span className={`aod-status-hero aod-order-status-hero ${osCls}`}>
              {order.order_status?.replace("_", " ") || "progress"}
            </span>
          </div>

          <div className="aod-hero-info">
            <div className="aod-identity">
              <span className="aod-eyebrow">Order Detail</span>
              <h1 className="aod-order-title">Order #{order.id}</h1>
              <div className="aod-hero-meta">
                <span className="aod-meta-chip">{order.product?.brand} {order.product?.model}</span>
                <span className="aod-meta-sep" />
                <span className="aod-meta-chip">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="aod-customer-snap">
              <div className="aod-avatar">{(order.name || "?")[0].toUpperCase()}</div>
              <div className="aod-snap-info">
                <span className="aod-snap-name">{order.name   || "—"}</span>
                <span className="aod-snap-email">{order.email || "—"}</span>
                <span className="aod-snap-phone">{order.phone || "—"}</span>
              </div>
            </div>

            <div className="aod-amount-block">
              <span className="aod-amount-lbl">Amount Paid</span>
              <span className="aod-amount">${Number(order.product?.price).toLocaleString()}</span>
            </div>

            {/* ── Status control ── */}
            <div className="aod-status-control">
              <span className="aod-sc-lbl">
                {isCancelled
                  ? "Order Cancelled — No Further Changes Allowed"
                  : "Update Order Status"}
              </span>

              {isCancelled ? (
                /* Locked banner when cancelled */
                <div className="aod-cancelled-lock">
                  <span className="aod-lock-icon">🔒</span>
                  <span>This order has been permanently cancelled.</span>
                </div>
              ) : (
                <div className="aod-sc-btns">
                  {ORDER_STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      className={`aod-sc-btn ${s} ${order.order_status === s ? "active" : ""}`}
                      onClick={() => requestStatusChange(s)}
                      disabled={updating || order.order_status === s}
                      title={STATUS_META[s].confirm}
                    >
                      {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="aod-tabs-wrap">
          <div className="aod-tabs">
            {tabs.map(t => (
              <button key={t.id}
                className={`aod-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >{t.label}</button>
            ))}
          </div>
        </div>

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

        {activeTab === "transaction" && (
          <div className="aod-tab-panel">
            <div className="aod-fields-grid">
              {transactionFields.map((f, i) => (
                <div className="aod-field-card" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className="aod-field-key">{f.key}</span>
                  {f.isPrice ? (
                    <span className="aod-field-val"><span className="aod-field-price">{f.val}</span></span>
                  ) : f.isPayStatus ? (
                    <span className={`aod-field-val aod-status-val ${sCls}`}>{f.val || "—"}</span>
                  ) : f.isOrderStatus ? (
                    <span className={`aod-field-val aod-status-val ${osCls}`}>{f.val || "—"}</span>
                  ) : (
                    <span className={`aod-field-val ${f.mono ? "mono" : ""}`}>{f.val || "—"}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "vehicle" && (
          <div className="aod-tab-panel">
            <div className="aod-vehicle-wrap">
              <div className="aod-vehicle-img-wrap">
                {imgUrl
                  ? <img src={imgUrl} alt={order.product?.model} />
                  : <div className="aod-img-ph">No Image</div>
                }
              </div>
              <div className="aod-vehicle-fields">
                {vehicleFields.map((f, i) => (
                  <div className="aod-spec-row" key={f.key} style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="aod-spec-key">{f.key}</span>
                    <div className="aod-spec-dots" />
                    <span className="aod-spec-val">{f.val || "—"}</span>
                  </div>
                ))}
                <button className="aod-view-vehicle-btn"
                  onClick={() => nav(`/vehicleDetail/${order.product?.id}`)}>
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