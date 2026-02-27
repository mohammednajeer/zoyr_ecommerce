import React, { useEffect, useState } from "react";
import NavBar from "../../component/NavBar";
import api from "../../api/api";
import { toast } from "react-toastify";
import "./Profile.css";
import PreviousOrder from "../Previousorder/PreviousOrder";


function Profile() {
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab,setActiveTab] = useState("profile")

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
    try {
      const res = await api.put("profile/", { email: user.email });
      setUser(res.data);
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    }
  }

  /* ── Loading ── */
  if (!user) return (
    <div className="profile-loading">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </div>
  );

  /* Avatar initials */
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

    async function handleLogout(){

  try{
    await api.post("logout/");
    toast.dark("Logged out");
    window.location.href = "/login";

  }catch{
    toast.error("Logout failed");
  }

}

  return (
    <>
    <NavBar />

    <div className="profile-container">

        {/* ✅ Tabs FIRST */}
        <div className="profile-tabs">

        <button
            className={activeTab === "profile" ? "tab active-tab" : "tab"}
            onClick={() => setActiveTab("profile")}
        >
            Profile
        </button>

        <button
            className={activeTab === "orders" ? "tab active-tab" : "tab"}
            onClick={() => setActiveTab("orders")}
        >
            Orders
        </button>

        </div>

        {/* ✅ PROFILE TAB */}
        {activeTab === "profile" && (

        <>
            <div className="profile-title-wrap">
            <span className="profile-eyebrow">Account</span>
            <h1>My Profile</h1>
            </div>

            <div className="profile-card">

            <div className="profile-card-header">
                <div className="profile-avatar">{initials}</div>

                <div className="profile-header-info">
                <span className="profile-header-name">{user.username}</span>
                <span className="profile-header-sub">Member Account</span>
                </div>

                <span className="profile-status-badge">
                <span className="status-dot" />
                {user.status || "Active"}
                </span>
            </div>

            <div className="profile-fields">

                <div className="field-row">
                <label>Username</label>
                <input value={user.username} disabled />
                </div>

                <div className="field-row">
                <label>Email</label>
                <input
                    value={user.email}
                    disabled={!editing}
                    onChange={e => setUser({...user, email:e.target.value})}
                />
                {editing && <span className="field-editable-mark">Editable</span>}
                </div>

                <div className="field-row">
                <label>Role</label>
                <span className="role-badge">✦ {user.role}</span>
                </div>

            </div>

            <div className="profile-actions">

                {!editing ? (
                <button className="btn-edit" onClick={()=>setEditing(true)}>
                    Edit Profile
                </button>
                ) : (
                <>
                    <button className="btn-edit" onClick={handleUpdate}>
                    Save Changes
                    </button>
                    <button className="btn-cancel" onClick={()=>setEditing(false)}>
                    Cancel
                    </button>
                </>
                )}

                <button onClick={handleLogout}>
                Logout
                </button>

            </div>

            </div>
        </>
        )}

        {/* ✅ ORDERS TAB */}
        {activeTab === "orders" && (
        <PreviousOrder />
        )}

    </div>
    </>
  );
}

export default Profile;