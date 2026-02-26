import React, { useEffect, useState } from 'react';
import './Wishlist.css';
import NavBar from '../../component/NavBar.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from "../../api/api";
import { toggleWishlist, reserveProduct } from "../../api/api";

function Wishlist() {
  const [WData, setWData] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await api.get("products/my-wishlist/");
        setWData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          nav("/login");
        }
      }
    }
    fetchWishlist();
  }, []);

  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await api.get("products/my-reservations/");
        const ids = res.data.map(r => r.product.id);
        setMyReservations(ids);
      } catch {}
    }
    fetchReservations();
  }, []);

  async function handleReserve(id) {
    try {
      await reserveProduct(id);
      toast.success("Car reserved successfully");
      setWData(prev =>
        prev.map(p => p.id === id ? { ...p, availability: "reserved" } : p)
      );
    } catch (err) {
      if (err.response?.data?.error === "You already have an active reservation") {
        toast.warning("Finish your current reservation first 🚗");
        return;
      }
      toast.error("Reserve failed");
    }
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await toggleWishlist(productId);
      setWData(prev => prev.filter(p => p.id !== productId));
      toast.info("Removed from wishlist");
    } catch {
      toast.error("Remove failed");
    }
  };

  return (
    <>
      <NavBar />
      <div className="wl-container">
        <div className="wl-body">

          {WData.length === 0 ? (
            <p className="wl-empty">Your wishlist is empty</p>
          ) : (
            WData.map((dt, i) => (
              <div
                className="wl-card"
                key={dt.id}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Image */}
                <div className="wl-img-wrap">
                  <img className="wl-img" src={dt.image?.url || dt.image} alt={dt.model} />
                </div>

                {/* Details */}
                <div className="wl-details">
                  <div className="wl-top-row">
                    <h5 className="wl-brand">{dt.brand}</h5>
                    <span className="wl-price">{Number(dt.price).toLocaleString()}</span>
                  </div>

                  <div className="wl-model">
                    <span>{dt.model}</span>
                  </div>

                  <div className="wl-specs">
                    <div className="wl-spec-row">
                      <div className="wl-spec-cell">
                        <p>REG.</p>
                        <p>YEAR</p>
                        <h6>{dt.year}</h6>
                      </div>
                      <div className="wl-spec-cell">
                        <p>FUEL</p>
                        <p>TYPE</p>
                        <h6>{dt.fuel}</h6>
                      </div>
                      <div className="wl-spec-cell">
                        <p>KMS</p>
                        <p>COVERED</p>
                        <h6>{Number(dt.kmCover).toLocaleString()}</h6>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="wl-actions">
                      {myReservations.includes(dt.id) ? (
                        <button className="wl-reserve-btn" disabled>Reserved By You</button>
                      ) : dt.availability === "sold" ? (
                        <button className="wl-reserve-btn" disabled>Sold</button>
                      ) : dt.availability === "reserved" ? (
                        <button className="wl-reserve-btn" disabled>Reserved</button>
                      ) : (
                        <button className="wl-reserve-btn" onClick={() => handleReserve(dt.id)}>
                          Reserve
                        </button>
                      )}

                      <button
                        className="wl-remove-btn"
                        onClick={() => handleRemoveFromWishlist(dt.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </>
  );
}

export default Wishlist;