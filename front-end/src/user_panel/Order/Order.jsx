import React, { useEffect, useState } from 'react'
import './Order.css'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";

/* ── Validation rules ── */
function validate(fields) {
  const errs = {};
  if (!fields.name.trim())                                    errs.name         = "Full name is required";
  else if (fields.name.trim().length < 3)                     errs.name         = "Name must be at least 3 characters";

  if (!fields.phone.trim())                                   errs.phone        = "Phone number is required";
  else if (!/^\+?[\d\s\-()]{7,15}$/.test(fields.phone))      errs.phone        = "Enter a valid phone number";

  if (!fields.email.trim())                                   errs.email        = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.email        = "Enter a valid email address";

  if (!fields.address.trim())                                 errs.address      = "Address is required";
  else if (fields.address.trim().length < 8)                  errs.address      = "Please enter a complete address";

  if (!fields.city.trim())                                    errs.city         = "City is required";

  if (!fields.pincode.trim())                                 errs.pincode      = "Pincode is required";
  else if (!/^\d{4,10}$/.test(fields.pincode.trim()))         errs.pincode      = "Enter a valid pincode (4–10 digits)";

  if (!fields.deliveryDate)                                   errs.deliveryDate = "Delivery date is required";
  else {
    const chosen = new Date(fields.deliveryDate);
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen <= today)                                      errs.deliveryDate = "Delivery date must be in the future";
  }
  return errs;
}

/* ══════════════════════════════════════════════════
   Field — OUTSIDE Order to prevent remount on
   every keystroke (React identity stability).
══════════════════════════════════════════════════ */
function Field({ label, name, type = "text", placeholder, full,
                 value, onChange, onBlur, touched, errors }) {
  const hasError = touched[name] && errors[name];
  const isValid  = touched[name] && !errors[name] && value;

  return (
    <div className={["field-wrap", full ? "input-full" : ""].filter(Boolean).join(" ")}>

      {/* Label — clean, no error crammed inside it */}
      <label className={hasError ? "label-error" : isValid ? "label-valid" : ""}>
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={hasError ? "input-error" : isValid ? "input-valid" : ""}
      />

      {/* ✓ icon inside input on valid */}
      {isValid && <span className="field-check">✓</span>}

      {/* Error message sits below the input — like every real-world form */}
      {hasError && <span className="field-err-msg">{errors[name]}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ORDER PAGE
══════════════════════════════════════════════════ */
function Order() {
  const [fields, setFields] = useState({
    name: "", phone: "", email: "",
    address: "", city: "", pincode: "", deliveryDate: "",
  });
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [cartProducts, setCartProducts] = useState([]);
  const [loading,      setLoading]      = useState(false);

  const [prevOrder,   setPrevOrder]   = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [resRes, ordersRes] = await Promise.all([
          api.get("products/my-reservations/"),
          api.get("products/my-orders/"),
        ]);
        setCartProducts(resRes.data.map(r => r.product));
        if (ordersRes.data?.length > 0) {
          const last = ordersRes.data[ordersRes.data.length - 1];
          if (last.address || last.city) { setPrevOrder(last); setShowSuggest(true); }
        }
      } catch (err) {
        if (err.response?.status === 401) nav("/login");
      }
    }
    fetchData();
  }, []);

  function applyPrevAddress() {
    setFields(f => ({
      ...f,
      name:    prevOrder.name    || f.name,
      phone:   prevOrder.phone   || f.phone,
      email:   prevOrder.email   || f.email,
      address: prevOrder.address || f.address,
      city:    prevOrder.city    || f.city,
      pincode: prevOrder.pincode || f.pincode,
    }));
    setShowSuggest(false);
    toast.dark("Previous details applied");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...fields, [name]: value };
    setFields(updated);
    if (touched[name]) {
      const errs = validate(updated);
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const errs = validate(fields);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  }

  async function handlePlaceOrder() {
    const allTouched = Object.keys(fields).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error("Please fix the errors below"); return; }
    if (loading) return;
    setLoading(true);
    try {
      const paymentRes = await api.post("payments/checkout/", {
        name:          fields.name,
        phone:         fields.phone,
        email:         fields.email,
        address:       fields.address,
        city:          fields.city,
        pincode:       fields.pincode,
        delivery_date: fields.deliveryDate,
      });
      window.location.replace(paymentRes.data.checkout_url)
    } catch {
      toast.error("Checkout failed");
      setLoading(false);
    }
  }

  const totalPrice = cartProducts.reduce((acc, p) => acc + p.price, 0);
  const fp = { onChange: handleChange, onBlur: handleBlur, touched, errors };

  return (
    <div className="order-container">
      <div className="ordr-body">

        <h1>Complete Your Reservation</h1>
        <p className="order-sub">Your vehicle has been reserved — confirm details to proceed</p>
        <div className="gold-divider" />

        {cartProducts.map((prd, i) => (
          <div className="reservation-card" key={prd.id} style={{ animationDelay: `${i * 0.08}s` }}>
            <img src={prd.image?.url || prd.image} alt={`${prd.brand} ${prd.model}`} />
            <div className="reservation-info">
              <h2>{prd.brand} {prd.model}</h2>
              <div className="res-details">
                <span>Year: {prd.year}</span>
                <span>Fuel: {prd.fuel}</span>
                <span>{prd.kmCover?.toLocaleString()} km</span>
              </div>
              <h3 className="price">${Number(prd.price).toLocaleString()}</h3>
            </div>
          </div>
        ))}

        {cartProducts.length > 1 && (
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-price">${totalPrice.toLocaleString()}</span>
          </div>
        )}

        <div className="gold-divider" />

        {showSuggest && prevOrder && (
          <div className="prev-suggest">
            <div className="prev-suggest-icon">◈</div>
            <div className="prev-suggest-info">
              <span className="prev-suggest-title">Use previous delivery details?</span>
              <span className="prev-suggest-sub">{prevOrder.address}, {prevOrder.city} — {prevOrder.name}</span>
            </div>
            <div className="prev-suggest-actions">
              <button className="prev-apply-btn"   onClick={applyPrevAddress}>Apply</button>
              <button className="prev-dismiss-btn" onClick={() => setShowSuggest(false)}>✕</button>
            </div>
          </div>
        )}

        <div className="delivery-section">
          <h3>Client Details</h3>
          <div className="input-grid">
            <Field label="Full Name"               name="name"         placeholder="John Doe"           value={fields.name}         {...fp} />
            <Field label="Phone"                   name="phone"        placeholder="+1 (555) 000-0000"  value={fields.phone}        {...fp} />
            <Field label="Email"                   name="email"        type="email" placeholder="your@email.com" value={fields.email} full {...fp} />
            <Field label="Street Address"          name="address"      placeholder="123 Main Street"    value={fields.address}      full {...fp} />
            <Field label="City"                    name="city"         placeholder="New York"           value={fields.city}         {...fp} />
            <Field label="Pincode"                 name="pincode"      placeholder="10001"              value={fields.pincode}      {...fp} />
            <Field label="Preferred Delivery Date" name="deliveryDate" type="date"                      value={fields.deliveryDate} full {...fp} />
          </div>
          <button className="order-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? <span className="order-btn-spinner" /> : "Confirm Purchase"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Order;