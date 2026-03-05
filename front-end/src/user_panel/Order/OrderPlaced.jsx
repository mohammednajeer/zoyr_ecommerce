import React, { useEffect, useState } from 'react';
import './OrderPlaced.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';


function OrderPlaced() {
  const [orderId, setOrderId] = useState(null);
  const nav = useNavigate();

  useEffect(() => {

  async function confirmPayment() {
    try {
      await api.post("products/confirm-payment/");
    } catch (err) {
      console.error(err);
    }
  }

  confirmPayment();

}, []);

  return (
    <div className="oplcont">
      <div className="opl-card">

        {/* ── Success Icon ── */}
        <div className="success-ring">
          <span className="success-checkmark">✦</span>
        </div>

        {/* ── Title ── */}
        <h1>Reservation Confirmed</h1>

        {/* ── Order ID Badge ── */}
        <div className="order-id-badge">
          <span className="label">Order Reference</span>
          <span className="value">#{orderId ?? '—'}</span>
        </div>

        <div className="gold-divider" />

        {/* ── Confirm Message ── */}
        <p className="confirm-text">
          Your vehicle has been successfully reserved and your purchase request
          has been submitted. Our team will contact you shortly to confirm
          delivery logistics and payment details.
        </p>

        {/* ── Timeline ── */}
        <div className="next-steps">
          <p className="next-steps-title">What Happens Next</p>

          <div className="step-item">
            <div className="step-num active">✓</div>
            <div className="step-content">
              <span className="step-label">Reservation Placed</span>
              <span className="step-sublabel">Your vehicle is now held exclusively for you</span>
              <span className="step-status done">Completed</span>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">02</div>
            <div className="step-content">
              <span className="step-label">Dealer Verification</span>
              <span className="step-sublabel">Our team is reviewing your request</span>
              <span className="step-status pending">In Progress</span>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">03</div>
            <div className="step-content">
              <span className="step-label">Payment Confirmation</span>
              <span className="step-sublabel">Secure payment processing & receipt</span>
              <span className="step-status pending">Pending</span>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">04</div>
            <div className="step-content">
              <span className="step-label">Delivery Scheduling</span>
              <span className="step-sublabel">Coordinate delivery date — bring valid ID</span>
              <span className="step-status pending">Pending</span>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="opl-actions">
          <button className="opl-btn secondary" onClick={() => nav("/")}>
            Browse More Vehicles
          </button>
          <button className="opl-btn primary" onClick={() => nav("/profile")}>
            View My Reservations
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderPlaced;