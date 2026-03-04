import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import SideBar from '../../Sidebar/SideBar';
import icn from '../../../assets/3736502.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile, deleteUser, toggleUserStatus } from '../../../AdminAPI/adminApi';
import del from '../../../assets/close.png'
import { toast } from 'react-toastify';

function UserProfile() {

  const location = useLocation();
  const userId = location.state;

  const [user,setUser] = useState(null)
  const [orders,setOrders] = useState([])

  const nav = useNavigate()

  useEffect(()=>{

    async function load(){

      try{

        const res = await getUserProfile(userId)

        setUser(res.data.user)
        setOrders(res.data.orders)

      }
      catch(err){
        console.error(err)
      }

    }

    load()

  },[userId])


  async function handledel(){

    if(!window.confirm("Delete this user?")) return

    try{

      await deleteUser(userId)

      toast.dark("User deleted")

      nav('/userdirectory')

    }
    catch(err){
      console.error(err)
    }

  }

  async function handlestate(){

    try{

      const res = await toggleUserStatus(userId)

      setUser(prev => ({
        ...prev,
        status: res.data.status
      }))

    }
    catch(err){
      console.error(err)
    }

  }


  return (

    <div className="up-cnt">

      <SideBar/>

      <div className="up-bdy">

        <div className="up-d">

          <div className="up-top">

            <div className="pulse-wrapper">
              <img src={icn} alt="Profile Icon" />
            </div>

            <div className="up-dt-btns">

              <div className="up-dtls">

                <h3>{user?.username}</h3>
                <p>ID: #{user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Status: {user?.status}</p>

              </div>

              <div className="up-btns">

                <button
                  onClick={handlestate}
                  className="up-btn"
                >
                  {user?.status === "active" ? "Active" : "Blocked"}
                </button>

                <div onClick={handledel} className="up-btn-fd">
                  <img src={del} alt="" />
                </div>

              </div>

            </div>

          </div>


          {/* Orders */}

          <div className="up-ordli">

            {orders.map(order => (

              <div className="up-order" key={order.id}>

                <h3>Order ID: {order.id}</h3>

                <p>Date: {new Date(order.created_at).toLocaleString()}</p>

                <p>Status: {order.status}</p>

                <div className="up-crds">

                  <div className="up-ords-img">
                    <img src={order.product.image} alt="" />
                  </div>

                  <div className="up-cart-detls">

                    <h3>{order.product.brand} - {order.product.model}</h3>

                    <p>Price: ${order.product.price}</p>

                    <p>Year: {order.product.year}</p>

                    <p>Fuel: {order.product.fuel}</p>

                    <p>KMs: {order.product.kmCover}</p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}

export default UserProfile