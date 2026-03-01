import React, { useEffect, useState } from "react";
import NavBar from "../../component/NavBar";
import api from "../../api/api";
import { toast } from "react-toastify";
import "./Profile.css";
import PreviousOrder from "../Previousorder/PreviousOrder";

function Profile() {
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving]   = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("profile/");
      setUser(res.data);
    } catch {
      toast.error("Session expired");
      window.location.href = "/login";
    }
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      const res = await api.put("profile/", { email: user.email });
      setUser(res.data);
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post("logout/");
      toast.dark("Logged out");
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed");
    }
  }

  if (!user) return (
    <div className="pf-loading">
      <div className="pf-loading-inner">
        <span className="pf-dot" />
        <span className="pf-dot" />
        <span className="pf-dot" />
      </div>
    </div>
  );

  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : "??";

  return (
    <>
      <NavBar />

      <div className="pf-root">
        {/* Atmospheric bg */}
        <div className="pf-bg">
          <div className="pf-orb pf-orb-1" />
          <div className="pf-orb pf-orb-2" />
          <div className="pf-grid" />
        </div>

        <div className="pf-page">

          {/* ── Sidebar ── */}
          <aside className="pf-sidebar">
            <div className="pf-sidebar-card">
              <div className="pf-sidebar-accent" />

              <div className="pf-avatar-wrap">
                <div className="pf-avatar">{initials}</div>
                <div className="pf-avatar-ring" />
              </div>

              <div className="pf-sidebar-name">{user.username}</div>
              <div className="pf-sidebar-sub">Member Account</div>

              <div className="pf-status-badge">
                <span className="pf-status-dot" />
                {user.status || "Active"}
              </div>

              <nav className="pf-nav">
                <button
                  className={`pf-nav-item ${activeTab === "profile" ? "pf-nav-active" : ""}`}
                  onClick={() => setActiveTab("profile")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>

                <button
                  className={`pf-nav-item ${activeTab === "orders" ? "pf-nav-active" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6M9 16h4" />
                  </svg>
                  My Orders
                </button>
              </nav>

              <button className="pf-logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="pf-main">

            {activeTab === "profile" && (
              <div className="pf-section" key="profile">
                <div className="pf-section-header">
                  <span className="pf-eyebrow">Account</span>
                  <h1 className="pf-heading">My Profile</h1>
                </div>

                <div className="pf-card">
                  <div className="pf-card-accent" />

                  {/* Fields */}
                  <div className="pf-fields">

                    <div className="pf-field">
                      <label className="pf-label">Username</label>
                      <div className="pf-input-wrap">
                        <svg className="pf-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                          value={user.username}
                          disabled
                          className="pf-input"
                        />
                      </div>
                    </div>

                    <div className="pf-field">
                      <label className="pf-label">
                        Email
                        {editing && <span className="pf-editable-tag">Editable</span>}
                      </label>
                      <div className={`pf-input-wrap ${editing ? "pf-input-active" : ""}`}>
                        <svg className="pf-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <input
                          value={user.email}
                          disabled={!editing}
                          onChange={e => setUser({ ...user, email: e.target.value })}
                          className="pf-input"
                        />
                        <div className="pf-focus-bar" />
                      </div>
                    </div>

                    <div className="pf-field">
                      <label className="pf-label">Role</label>
                      <div className="pf-role-badge">
                        <span className="pf-role-star">✦</span>
                        {user.role}
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pf-actions">
                    {!editing ? (
                      <button className="pf-btn-primary" onClick={() => setEditing(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          className={`pf-btn-primary ${saving ? "pf-btn-loading" : ""}`}
                          onClick={handleUpdate}
                          disabled={saving}
                        >
                          {saving ? <span className="pf-spinner" /> : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button className="pf-btn-ghost" onClick={() => setEditing(false)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="pf-section" key="orders">
                <div className="pf-section-header">
                  <span className="pf-eyebrow">History</span>
                  <h1 className="pf-heading">My Orders</h1>
                </div>
                <PreviousOrder />
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

export default Profile;