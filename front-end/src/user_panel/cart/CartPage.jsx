import { useEffect, useState } from "react";
import "./CartPage.css";
import NavBar from "../../component/NavBar.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api";

function CartPage() {
  const [reservedCars, setReservedCars] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchReservedCars() {
      try {
        const res  = await api.get("products/my-reservations/");
        const cars = res.data.map(r => r.product);
        setReservedCars(cars);
      } catch (err) {
        if (err.response?.status === 401) nav("/login");
      }
    }
    fetchReservedCars();
  }, [nav]);

  async function handleUnreserve(id) {
    try {
      await api.delete(`products/unreserve/${id}/`);
      toast.success("Reservation removed");
      setReservedCars(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error("Failed to unreserve");
    }
  }

  const totalPrice = reservedCars.reduce((acc, item) => acc + item.price, 0);

  return (
    <>
      <NavBar color={false} />

      <div className="Cartbody">
        <div className="cart-cont">

          {/* ── Header ── */}
          <h2>Reserved Vehicles</h2>
          <div className="gold-divider" />

          {/* ── Empty State ── */}
          {reservedCars.length === 0 ? (
            <h3>No reserved vehicles</h3>
          ) : (
            reservedCars.map((prd, i) => (
              <div
                className="card-prd"
                key={prd.id}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Image */}
                <div className="prd-img">
                  <img src={prd.image} alt={`${prd.brand} ${prd.model}`} />
                </div>

                {/* Details */}
                <div className="cart-detls">
                  <h3>{prd.brand} — {prd.model}</h3>

                  <div className="spec-row">
                    <span>Year: {prd.year}</span>
                    <span>Fuel: {prd.fuel}</span>
                    <span>{prd.kmCover?.toLocaleString()} km</span>
                  </div>

                  <div className="cart-price">
                    ${Number(prd.price).toLocaleString()}
                  </div>

                  <span className="reservation-status">
                    ✦ Reservation Confirmed
                  </span>

                  <div className="delivery-section">
                    <label>Preferred Delivery Date</label>
                    <input
                      type="date"
                      onChange={e => (prd.deliveryDate = e.target.value)}
                    />
                  </div>

                  <div className="reservation-info">
                    <p>📌 Reservation valid for a limited time</p>
                    <p>📌 Complete payment to confirm booking</p>
                    <p>📌 Bring valid ID during delivery</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="fnct-cart">
                  <button
                    className="payment-btn"
                    onClick={() => nav("/order", { state: { product: prd } })}
                  >
                    Make Payment
                  </button>
                  <button
                    className="remove-btn1"
                    onClick={() => handleUnreserve(prd.id)}
                  >
                    Cancel Reservation
                  </button>
                </div>
              </div>
            ))
          )}

          {/* ── Total ── */}
          {reservedCars.length > 0 && (
            <div className="ord-section">
              <h2>Total Reserved Value — ${totalPrice.toLocaleString()}</h2>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default CartPage;