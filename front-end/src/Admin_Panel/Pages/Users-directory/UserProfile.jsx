import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import SideBar from '../../Sidebar/SideBar';
import icn from '../../../assets/3736502.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile, deleteUser, toggleUserStatus } from '../../../AdminAPI/adminApi';
import { toast } from 'react-toastify';


const OS_MAP = {
  pending:   'os-pending',
  confirmed: 'os-confirmed',
  delivered: 'os-delivered',
  cancelled: 'os-cancelled',
};

function UserProfile() {
  const location = useLocation();
  const userId   = location.state;
  const nav      = useNavigate();

  const [user,   setUser]   = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getUserProfile(userId);
        setUser(res.data.user);
        setOrders(res.data.orders);
      } catch (err) { console.error(err); }
    }
    load();
  }, [userId]);

  async function handleDel() {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(userId);
      toast.dark('User deleted');
      nav('/userdirectory');
    } catch (err) { console.error(err); }
  }

  async function handleToggle() {
    try {
      const res = await toggleUserStatus(userId);
      setUser(prev => ({ ...prev, status: res.data.status }));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="up-cnt">
      <SideBar />

      <div className="up-bdy">

        {/* Back */}
        <button className="up-back" onClick={() => nav('/userdirectory')}>
          <span className="up-back-arr">←</span>
          User Directory
        </button>

        {/* ── Profile hero card ── */}
        <div className="up-profile-card">

          {/* Avatar */}
          <div className="up-avatar-wrap">
            <div className="up-avatar-img">
              <img src={icn} alt="" />
            </div>
            <div className="up-ring" />
            <div className="up-ring-2" />
          </div>

          {/* Info */}
          <div className="up-info">
            <div className="up-username">{user?.username || '—'}</div>
            <div className="up-meta">
              <div className="up-meta-row">
                <span className="up-meta-key">ID</span>
                <span>#{user?.id}</span>
              </div>
              <div className="up-meta-row">
                <span className="up-meta-key">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="up-meta-row">
                <span className="up-meta-key">Status</span>
                <span className={`up-status-pill ${user?.status}`}>
                  <span className="up-dot" />
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="up-actions">
            <button
              className={`up-act-btn ${user?.status === 'active' ? 'up-toggle-active' : 'up-toggle-blocked'}`}
              onClick={handleToggle}
            >
              {user?.status === 'active' ? 'Active' : 'Blocked'}
            </button>
            <button className="up-act-btn up-del-act-btn" onClick={handleDel}>
              Delete User
            </button>
          </div>

        </div>

        {/* ── Orders ── */}
        <div className="up-orders-header">
          <span className="up-orders-eyebrow">Order History</span>
          <div className="up-orders-rule" />
          <span className="up-orders-count">{orders.length}</span>
        </div>

        {orders.length === 0 && (
          <div className="up-no-orders">
            <div className="up-no-orders-icon">📋</div>
            <p>No orders found for this user</p>
          </div>
        )}

        <div className="up-ordli">
          {orders.map(order => (
            <div className="up-order" key={order.id}>

              {/* Order header bar */}
              <div className="up-order-head">
                <span className="up-order-id">Order #{order.id}</span>
                <span className="up-order-date">
                  {new Date(order.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                </span>
                <span className={`up-order-status ${OS_MAP[order.status] || 'os-pending'}`}>
                  {order.status}
                </span>
              </div>

              {/* Order body */}
              <div className="up-crds">
                <div className="up-ords-img">
                  <img src={order.product.image} alt="" />
                </div>
                <div className="up-cart-detls">
                  <div className="up-vehicle-name">
                    {order.product.brand} — {order.product.model}
                  </div>
                  <div className="up-spec-row">
                    <span className="up-spec-chip">{order.product.year}</span>
                    <span className="up-spec-chip">{order.product.fuel}</span>
                    <span className="up-spec-chip">{order.product.kmCover} km</span>
                  </div>
                  <div className="up-price">${order.product.price}</div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default UserProfile;