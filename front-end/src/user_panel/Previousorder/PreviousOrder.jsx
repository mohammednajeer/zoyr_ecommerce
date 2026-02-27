import React, { useEffect, useState } from 'react';
import './PreviousOrder.css';
import { useNavigate } from 'react-router-dom';
import api from "../../api/api";


function PreviousOrder() {

  const [orders, setOrders] = useState([]);

  

    useEffect(() => {
      async function fetchOrders() {
        try {
          const res = await api.get("products/my-orders/");
          setOrders(res.data);
        } catch (err) {
          console.error("Failed to load orders", err);
        }
      }
      fetchOrders();
    }, []);

  return (

      <div className='prvios-ordr-body'>
        <h1>Your Previous Orders</h1>

        {orders.length === 0 ? (
            <p>No previous orders found.</p>
          ) : (
            orders.map(order => (
              <div className="prev-order" key={order.id}>

                <h2>Order ID: #{order.id}</h2>
                <p>Status: {order.status}</p>

                <div className="card-prds11">
                  <div className="pr-ords-img">
                    <img src={order.product.image} alt={order.product.model} />
                  </div>

                  <div className="cart-detls">
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                    <h3>{order.product.brand} - {order.product.model}</h3>
                    <p>Price: ${order.product.price}</p>
                    <p>Year: {order.product.year}</p>
                    <p>Fuel: {order.product.fuel}</p>
                    <p>KMs: {order.product.kmCover}</p>
                    <p>
                    Ordered on:
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day:"numeric",
                      month:"long",
                      year:"numeric"
                    })}
                    </p>
                  </div>
                </div>

                <div className="line"></div>

              </div>
            ))
          )}
      </div>

  );
}

export default PreviousOrder;
