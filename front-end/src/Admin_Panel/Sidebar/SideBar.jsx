import React from 'react'
import './SideBar.css'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import DBlogo from '../../assets/dashboard.png'
import vehicles from '../../assets/fleet-management.png'
import users from '../../assets/group.png'
import orderimg from '../../assets/acquisition.png'
import logout from '../../assets/turn-off.png'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function SideBar() {
    let nav = useNavigate()
    let res = localStorage.getItem("loggedInUser")
    let adm = JSON.parse( res)
   function handlelogout(){

    localStorage.removeItem("loggedInUser")
    toast.dark("logged out")
    nav("/")
   }
  return (
    <div className='DSB-body'>
        <div className='dsb-lg'>
            <div className='lgog-div'><img src={logo} alt="logo" /></div>
        </div>

        <div onClick={()=>nav("/dashboard")}  className='dsb-admin-name'>
            <h2>{`Hello ${adm.username}`}</h2>
            <div className='db-lgandname'>
                <img src={DBlogo} alt="dashboard" />
                <h3>DashBoard</h3>
            </div>
        </div>

        <div  onClick={()=>nav("/VehicleListing")}  className='dsc-dtls'>
            <img src={vehicles} alt="vehicles" />
            <p>Vehicle Listings</p>
        </div>
        <div  onClick={()=>nav("/userdirectory")}  className='dsc-dtls'>
            <img src={users} alt="users" />
            <p>User Directory</p>
        </div>
        <div  onClick={()=>nav("/ordersList")}  className='dsc-dtls'>
            <img src={orderimg} alt="orders" />
            <p>Orders</p>
        </div>

        <div className='logout-div'>
            <div onClick={handlelogout} className="logout-btn">
                <img src={logout} alt="logout" />
                <p>LOGOUT</p>
            </div>
        </div>
    </div>
  )
}

export default SideBar
