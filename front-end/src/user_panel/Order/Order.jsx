import React, { useEffect, useState } from 'react'
import './Order.css'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";

function Order() {
  const [address, setAddress]     = useState("");
  const [Phone, setPhone]         = useState("");
  const [name, setName]           = useState("");
  const [city, setCity]           = useState("");
  const [pincode, setPincode]     = useState("");
  const [email, setEmail]         = useState("");
  const [cartProducts, setCartProducts] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);


  const nav = useNavigate();

  useEffect(() => {
    async function fetchReservedCars() {
      try {
        const res  = await api.get("products/my-reservations/");
        const cars = res.data.map(r => r.product);
        setCartProducts(cars);
      } catch (err) {
        if (err.response?.status === 401) nav("/login");
      }
    }
    fetchReservedCars();
  }, []);

  const totalPrice = cartProducts.reduce((acc, item) => acc + item.price, 0);

  async function handlePlaceOrder() {

  if (!name || !Phone || !email || !address || !city || !pincode) {
    toast.error("Please fill all details");
    return;
  }

  try {
    setLoading(true)
    const orderRes = await api.post("products/create-order/", {
      name,
      phone: Phone,
      email,
      address,
      city,
      pincode,
      delivery_date : deliveryDate
    });

    const paymentRes = await api.post("payments/checkout/");

    window.location.href = paymentRes.data.checkout_url;

  } catch (err) {
    toast.error("Checkout failed");
    setLoading(false)
  }

}

  return (
    <div className="order-container">
      <div className="ordr-body">

        {/* ── Header ── */}
        <h1>Complete Your Reservation</h1>
        <p className="order-sub">Your vehicle has been reserved — confirm details to proceed</p>
        <div className="gold-divider" />

        {/* ── Reserved Vehicles ── */}
        {cartProducts.map((prd, i) => (
          <div className="reservation-card" key={prd.id} style={{ animationDelay: `${i * 0.08}s` }}>
            <img src={prd.image} alt={`${prd.brand} ${prd.model}`} />
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

        {/* ── Total ── */}
        {cartProducts.length > 1 && (
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-price">${totalPrice.toLocaleString()}</span>
          </div>
        )}

        <div className="gold-divider" />

        {/* ── Delivery Details ── */}
        <div className="delivery-section">
          <h3>Client Details</h3>

          <div className="input-grid">

            <div className="field-wrap">
              <label>Full Name</label>
              <input
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="field-wrap">
              <label>Phone</label>
              <input
                placeholder="+1 (555) 000-0000"
                value={Phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="field-wrap input-full">
              <label>Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="field-wrap input-full">
              <label>Street Address</label>
              <input
                placeholder="123 Main Street"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="field-wrap">
              <label>City</label>
              <input
                placeholder="New York"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>

            <div className="field-wrap">
              <label>Pincode</label>
              <input
                placeholder="10001"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
              />
            </div>

            <div className="field-wrap input-full">
              <label>Preferred Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>

          </div>

          <button className="order-btn" onClick={handlePlaceOrder} disabled={loading}>
            Confirm Purchase
          </button>
        </div>

      </div>
    </div>
  );
}

export default Order;
