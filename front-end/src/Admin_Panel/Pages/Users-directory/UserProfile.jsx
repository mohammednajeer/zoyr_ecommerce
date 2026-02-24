import React, { useEffect, useState } from 'react';
import './UserProfile.css';
import SideBar from '../../Sidebar/SideBar';
import icn from '../../../assets/3736502.png';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import del from '../../../assets/close.png'
import { toast } from 'react-toastify';
function UserProfile() {
  const location = useLocation();
  const data = location.state;
  const [userdata, setUserdata] = useState(null);
  let nav = useNavigate()

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axios.get(`http://localhost:4000/Users/${data}`);
        setUserdata(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    getUser();
  }, [data]);

async function handledel() {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    await axios.delete(`http://localhost:4000/Users/${data}`);
    nav('/userdirectory');
    toast.dark("user ID deleted successfully")
  } catch (err) {
    console.error(err);
  }
}




  async function handlestate() {
  if (!userdata) return;
  const newstate = userdata.status === "active" ? "block" : "active";
  try {
    await axios.patch(`http://localhost:4000/Users/${data}`, { status: newstate });
    setUserdata(prev => ({ ...prev, status: newstate }));
  } catch (err) {
    console.error(err);
  }
}


  return (
    <div className="up-cnt">
      <SideBar />
      <div className="up-bdy">
        <div className="up-d">
          <div className="up-top">
            <div className="pulse-wrapper">
              <div className="pulse-circle"></div>
              <div className="pulse-circle"></div>
              <div className="pulse-circle"></div>
              <img src={icn} alt="Profile Icon" />
            </div>
            <div className="up-dt-btns">
              <div className="up-dtls">
                <h3>{userdata?.username}</h3>
                <p>ID : #{userdata?.id}</p>
                <p>Email: {userdata?.email}</p>
                <p>Status: {userdata?.status}</p>
              </div>
              <div className="up-btns">
                <button onClick={handlestate} className="up-btn">{userdata?.status === "active" ? "Active" : "Block"}</button>
                <div onClick={()=>handledel()} className="up-btn-fd">
                  <img src={del} alt="" />
                </div>
              </div>
            </div>
          </div>

         
          <div className="up-ordli">
            {userdata?.orders?.map(order => (
              <div className="up-order" key={order.id}>
                <h3>Order ID: {order.id}</h3>
                <p>Date: {new Date(order.date).toLocaleString()}</p>
                <p>Status: {order.status}</p>

                <div className="up-order-items">
                  {order.items.map(item => (
                    <div className="up-crds" key={item.id}>
                      <div className="up-ords-img">
                        <img src={item.imgSource} alt={item.model} />
                      </div>
                      <div className="up-cart-detls">
                        <h3>{item.brand} - {item.model}</h3>
                        <p>Price: {item.price}</p>
                        <p>Year: {item.year}</p>
                        <p>Fuel: {item.fuel}</p>
                        <p>KMs: {item.kmCover}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;
