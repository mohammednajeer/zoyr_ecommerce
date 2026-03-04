import React, { useEffect, useState } from 'react'
import './SideBar.css'
import logo       from '../../assets/Screenshot 2025-09-21 153022.png'
import DBlogo     from '../../assets/dashboard.png'
import vehicles   from '../../assets/fleet-management.png'
import users      from '../../assets/group.png'
import orderimg   from '../../assets/acquisition.png'
import logoutIcon from '../../assets/turn-off.png'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/api'

function SideBar() {
  const nav = useNavigate()
  const loc = useLocation()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    async function loadAdmin() {
      try {
        const res = await api.get('profile/')
        setAdmin(res.data)
      } catch {
        nav('/login')
      }
    }
    loadAdmin()
  }, [])

  async function handleLogout() {
    await api.post('logout/')
    toast.dark('Logged out')
    nav('/login')
  }

  const cls = (path) =>
    loc.pathname === path ? 'dsc-dtls sb-active' : 'dsc-dtls'

  return (
    <div className="DSB-body">

      {/* Logo */}
      <div className="dsb-lg">
        <div className="lgog-div">
          <img src={logo} alt="ZOYR" />
        </div>
      </div>

      <div className="sb-rule" />

      {/* Admin card */}
      <div className="dsb-admin-name" onClick={() => nav('/dashboard')}>
        <h2>{admin ? admin.username : 'Admin'}</h2>
        <div className="db-lgandname">
          <img src={DBlogo} alt="" />
          <h3>Administrator</h3>
        </div>
      </div>

      <div className="sb-nav-label">Navigation</div>

      <div className={cls('/dashboard')} onClick={() => nav('/dashboard')}>
        <img src={DBlogo} alt="" />
        <p>Dashboard</p>
      </div>

      <div className={cls('/VehicleListing')} onClick={() => nav('/VehicleListing')}>
        <img src={vehicles} alt="" />
        <p>Vehicle Listings</p>
      </div>

      <div className={cls('/userdirectory')} onClick={() => nav('/userdirectory')}>
        <img src={users} alt="" />
        <p>User Directory</p>
      </div>

      <div className={cls('/ordersList')} onClick={() => nav('/ordersList')}>
        <img src={orderimg} alt="" />
        <p>Orders</p>
      </div>

      <div className="logout-div">
        <div className="logout-btn" onClick={handleLogout}>
          <img src={logoutIcon} alt="" />
          <p>Logout</p>
        </div>
      </div>

    </div>
  )
}

export default SideBar