import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import NavBar from "../component/NavBar";
import { reserveProduct, toggleWishlist } from "../api/api";
import api from "../api/api";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id }  = useParams();
  const nav     = useNavigate();

  const [car, setCar]               = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [reserved, setReserved]     = useState(false);
  const [tab, setTab]               = useState("overview");
  const [showModal, setShowModal]   = useState(false);
  const intervalRef                 = useRef(null);

  // ── Fetch product ─────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.get(`products/${id}/`)
      .then(res => { setCar(res.data); setLoading(false); })
      .catch(() => { toast.error("Failed to load vehicle"); setLoading(false); });
  }, [id]);

  // ── Wishlist status ───────────────────────────────
  useEffect(() => {
    api.get("products/my-wishlist/")
      .then(res => {
        if (res.data.map(p => p.id).includes(Number(id))) setWishlisted(true);
      }).catch(() => {});
  }, [id]);

  // ── Reservation status ────────────────────────────
  useEffect(() => {
    api.get("products/my-reservations/")
      .then(res => {
        if (res.data.map(r => r.product.id).includes(Number(id))) setReserved(true);
      }).catch(() => {});
  }, [id]);

  // ── Auto-cycle images ─────────────────────────────
  useEffect(() => {
    if (!car) return;
    const imgs = getImages(car);
    if (imgs.length <= 1) return;
    intervalRef.current = setInterval(
      () => setActiveImg(p => (p + 1) % imgs.length), 5000
    );
    return () => clearInterval(intervalRef.current);
  }, [car]);

  // ── Helpers ───────────────────────────────────────
  function getImages(c) {
    if (!c) return [];
    if (Array.isArray(c.images) && c.images.length) return c.images.map(i => i?.url || i);
    if (c.image) return [c.image?.url || c.image];
    return [];
  }

  function pickImg(i) {
    clearInterval(intervalRef.current);
    setActiveImg(i);
  }

  // ── Actions ───────────────────────────────────────
  async function handleWishlist() {
    try {
      await toggleWishlist(id);
      setWishlisted(w => !w);
      toast.dark(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
    } catch { toast.error("Wishlist failed"); }
  }

  async function handleReserve() {
    try {
      await reserveProduct(id);
      setReserved(true);
      setCar(prev => ({ ...prev, availability: "reserved" }));
      toast.success("Vehicle reserved successfully");
      setShowModal(false);
    } catch (err) {
      if (err.response?.data?.error === "You already have an active reservation") {
        toast.warning("Finish your current reservation first");
        nav("/cart");
        return;
      }
      toast.dark(err.response?.data?.error || "Reservation failed");
      setShowModal(false);
    }
  }

  // ── Loading / error ───────────────────────────────
  if (loading) return (
    <>
      <NavBar color={false} />
      <div className="cdp-loading">
        <div className="cdp-spinner" />
        <span>Loading vehicle</span>
      </div>
    </>
  );

  if (!car) return (
    <>
      <NavBar color={false} />
      <div className="cdp-loading">
        <span style={{ color: "var(--danger)" }}>Vehicle not found</span>
        <button className="btn-back" onClick={() => nav("/product")}>Back to inventory</button>
      </div>
    </>
  );

  const images     = getImages(car);
  const isSold     = car.availability === "sold";
  const isReserved = car.availability === "reserved" || reserved;

  const specs = [
    { label: "Brand",        value: car.brand },
    { label: "Model",        value: car.model },
    { label: "Year",         value: car.year },
    { label: "Fuel Type",    value: car.fuel },
    { label: "Mileage",      value: car.kmCover ? `${car.kmCover} km` : "—" },
    { label: "Transmission", value: car.transmission || "—" },
    { label: "Engine",       value: car.engine       || "—" },
    { label: "Horsepower",   value: car.horsepower   ? `${car.horsepower} HP` : "—" },
    { label: "Torque",       value: car.torque       || "—" },
    { label: "0–100 km/h",   value: car.acceleration || "—" },
    { label: "Top Speed",    value: car.topSpeed     || "—" },
    { label: "Colour",       value: car.color        || "—" },
    { label: "Seats",        value: car.seats        || "—" },
    { label: "VIN",          value: car.vin          || "—" },
    { label: "Availability", value: car.availability },
    { label: "Status",       value: car.status       || "—" },
  ];

  return (
    <>
      <NavBar color={false} />
      <div className="cdp">

        {/* ══ HERO ═══════════════════════════════════ */}
        <div className="hero">
          {images.length > 0
            ? <img key={activeImg} className="hero-img" src={images[activeImg]} alt={car.model} />
            : <div className="no-img" style={{ position:"absolute", inset:0 }}>No Image</div>
          }

          {/* Top nav */}
          <div className="hero-nav">
            <button className="back-btn" onClick={() => nav("/product")}>
              <span className="back-arrow" />
              <span>Inventory</span>
            </button>
            <button className={`wish-pill ${wishlisted ? "active" : ""}`} onClick={handleWishlist}>
              {wishlisted ? <FaHeart /> : <FaRegHeart />}
              {wishlisted ? "Saved" : "Save"}
            </button>
          </div>

          {/* Title — bottom left */}
          <div className="hero-title-block">
            <div className="hero-brand">{car.brand}</div>
            <h1 className="hero-model">{car.model}</h1>
            <div className="hero-year-row">
              <span>{car.year}</span>
              <span className="sep" />
              <span>{car.fuel}</span>
              <span className="sep" />
              <span>{car.kmCover} km</span>
            </div>
          </div>

          {/* Price — bottom right */}
          <div className="hero-price-block">
            <div className="hero-price-label">Listed Price</div>
            <div className="hero-price">${Number(car.price).toLocaleString()}</div>
          </div>

          {/* Thumbnails — bottom center */}
          {images.length > 1 && (
            <div className="thumb-row">
              {images.map((src, i) => (
                <div key={i} className={`hero-thumb ${i === activeImg ? "active" : ""}`} onClick={() => pickImg(i)}>
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          )}

          {/* Scroll cue */}
          <div className="scroll-cue">
            <div className="scroll-line" />
            <span>scroll</span>
          </div>
        </div>

        {/* ══ CONTENT ════════════════════════════════ */}
        <div className="content">

          {/* Availability + CTAs */}
          <div className="top-strip">
            <div className="avail-group">
              <div className={`avail-dot ${isSold ? "sold" : isReserved ? "rsv" : ""}`} />
              <span className={`avail-label ${isSold ? "sold" : isReserved ? "rsv" : ""}`}>
                {isSold ? "Sold" : isReserved ? "Reserved" : "Available"}
              </span>
            </div>
            <div className="cta-group">
              <button className="btn-enquire" onClick={() => setTab("contact")}>Enquire</button>
              {reserved ? (
                <button className="btn-reserve done">Reserved by you</button>
              ) : isSold ? (
                <button className="btn-reserve sold-btn">Sold</button>
              ) : isReserved ? (
                <button className="btn-reserve rsv-btn">Currently Reserved</button>
              ) : (
                <button className="btn-reserve" onClick={() => setShowModal(true)}>Reserve</button>
              )}
            </div>
          </div>

          {/* Stat chips */}
          <div className="stat-chips">
            {[
              { label: "Year",    val: car.year },
              { label: "Fuel",    val: car.fuel },
              { label: "Mileage", val: car.kmCover ? `${car.kmCover} km` : "—" },
              { label: "Engine",  val: car.engine || (car.horsepower ? `${car.horsepower} HP` : "—") },
              { label: "Price",   val: `$${Number(car.price).toLocaleString()}` },
            ].map(s => (
              <div key={s.label} className="stat-chip">
                <span className="sc-label">{s.label}</span>
                <span className="sc-val">{s.val}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="tabs">
            {["overview", "specifications", "contact"].map(t => (
              <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === "overview" && (
            <>
              <div className="overview-grid">
                <div>
                  <p className="desc">
                    {car.description ||
                      `The ${car.year} ${car.brand} ${car.model} is a distinguished vehicle in ${car.color || "a refined finish"}, powered by ${car.fuel}. With ${car.kmCover} km covered, this is a rare opportunity in our curated collection.`
                    }
                  </p>
                  {car.features && car.features.length > 0 && (
                    <>
                      <div className="section-micro">Standard Features</div>
                      <ul className="feat-list">
                        {car.features.map((f, i) => (
                          <li key={i}>
                            <span className="feat-num">{String(i + 1).padStart(2, "0")}</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                <div>
                  <div className="section-micro">Key Details</div>
                  <div className="kv-list">
                    {[
                      { key: "Brand",        val: car.brand },
                      { key: "Model",        val: car.model },
                      { key: "Year",         val: car.year },
                      { key: "Fuel",         val: car.fuel },
                      { key: "Mileage",      val: `${car.kmCover} km` },
                      { key: "Colour",       val: car.color        || "—" },
                      { key: "Transmission", val: car.transmission || "—" },
                      { key: "Availability", val: car.availability },
                    ].map(r => (
                      <div key={r.key} className="kv-row">
                        <span className="kv-key">{r.key}</span>
                        <span className="kv-val">{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {(car.horsepower || car.torque || car.acceleration || car.topSpeed) && (
                <div className="perf-row">
                  {[
                    { num: car.horsepower   ? `${car.horsepower}`   : "—", unit: car.horsepower   ? "hp"   : "", label: "Peak Power" },
                    { num: car.torque       || "—",                         unit: car.torque       ? "nm"   : "", label: "Torque"     },
                    { num: car.acceleration || "—",                         unit: car.acceleration ? "sec"  : "", label: "0 – 100"    },
                    { num: car.topSpeed     || "—",                         unit: car.topSpeed     ? "km/h" : "", label: "Top Speed"  },
                  ].map(s => (
                    <div key={s.label} className="perf-item">
                      <div className="perf-num">{s.num}</div>
                      <span className="perf-unit">{s.unit || s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Specifications ── */}
          {tab === "specifications" && (
            <div className="spec-table">
              {specs.map(s => (
                <div key={s.label} className="spec-row">
                  <span className="spec-key">{s.label}</span>
                  <span className="spec-val">{s.value ?? "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Contact ── */}
          {tab === "contact" && (
            <div className="contact-wrap">
              <div>
                <p className="contact-intro">Let's talk about this vehicle.</p>
                <p className="contact-sub">
                  Our specialist team typically responds within 2 business hours.
                  Fill in your details and we'll be in touch shortly.
                </p>
              </div>
              <div className="contact-form">
                <div className="cf-field"><input className="cf-input" placeholder="Full name" /></div>
                <div className="cf-field"><input className="cf-input" placeholder="Email address" /></div>
                <div className="cf-field"><input className="cf-input" placeholder="Phone (optional)" /></div>
                <div className="cf-field">
                  <textarea className="cf-textarea" rows={4}
                    placeholder={`I'm interested in the ${car.year} ${car.brand} ${car.model}…`}
                  />
                </div>
                <button className="cf-submit"
                  onClick={() => toast.success("Message sent — we'll be in touch soon")}>
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ Modal ══════════════════════════════════════ */}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="modal-title">Reserve Vehicle</div>
            <p className="modal-sub">
              You're reserving the{" "}
              <strong>{car.year} {car.brand} {car.model}</strong>.
              A hold will be placed while our team prepares your documents.
            </p>
            <div className="modal-actions">
              <button className="modal-confirm" onClick={handleReserve}>Confirm</button>
              <button className="modal-cancel"  onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}