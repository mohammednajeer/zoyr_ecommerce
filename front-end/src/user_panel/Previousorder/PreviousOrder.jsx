import React, { useEffect, useState } from 'react';
import './PreviousOrder.css';
import axios from "axios";
import exit from '../../assets/logout.png'
import { useNavigate } from 'react-router-dom';

function PreviousOrder() {
  let nav = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      let storeduser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!storeduser) return;

      try {
        let userRes = await axios.get(`http://localhost:4000/Users/${storeduser.id}`);
        let user = userRes.data;

        // ✅ Sort orders by date (latest first)
        const sortedOrders = (user.orders || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className='p-o-container'>
      <div onClick={() => nav("/")} className='es23de'>
        <div><img src={exit} alt="" /></div>
      </div>
      <div className='prvios-ordr-body'>
        <h1>Your Previous Orders</h1>

        {orders.length === 0 ? (
          <p>No previous orders found.</p>
        ) : (
          orders.map(order => (
            <div className="prev-order" key={order.id}>
              <div style={{ width: "94%" }}>
                <h2>Order ID: #{order.id}</h2>
                <p>Date: {new Date(order.date).toLocaleString()}</p>
                <p>Status: {order.status}</p>
                <p>Total: ${order.total}</p>

                <h4>Items:</h4>
              </div>

              {order.items.map(item => (
                <div className="card-prds11" key={item.id}>
                  <div className="pr-ords-img">
                    <img src={item.imgSource} alt={item.model} />
                  </div>
                  <div className="cart-detls">
                    <h3>{item.brand} - {item.model}</h3>
                    <p>Price: {item.price}</p>
                    <p>Year: {item.year}</p>
                    <p>Fuel: {item.fuel}</p>
                    <p>KMs: {item.kmCover}</p>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className='line'></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PreviousOrder;
