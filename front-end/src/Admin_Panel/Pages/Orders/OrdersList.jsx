import React, { useEffect, useState } from 'react';
import './Orderslist.css';
import SideBar from '../../Sidebar/SideBar';
import axios from 'axios';

function OrdersList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get(`http://localhost:4000/Users`)
      .then(res => {
        const users = res.data
        const allOrders = users.flatMap(user =>(user.orders || []).map(order => ({ ...order, userId: user.id }))
        )
        const sortedOrders = allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(sortedOrders)
      })
      .catch(err => console.error("Error fetching", err))
  };

  const statusCycle = ["Placed", "Delivered", "Canceled"]

  const handleStatusChange = (orderId, userId) => {
    const order = data.find(o => o.id === orderId);

  
    const currentIndex = statusCycle.indexOf(order.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];


    axios.get(`http://localhost:4000/Users/${userId}`)
      .then(res => {
        const user = res.data;
        const updatedOrders = user.orders.map(o =>
          o.id === orderId ? { ...o, status: nextStatus } : o
        );
        return axios.patch(`http://localhost:4000/Users/${userId}`, { orders: updatedOrders });
      })
      .then(() => {

        setData(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
        );
      })
      .catch(err => console.error("Error updating status:", err));
  };

  return (
    <div className='ord-cont'>
      <SideBar />
      <div className='ord-body'>
        <h2>Orders</h2>
        <div className='ords-list'>
          {data.map(order => (
            <div className="ordl" key={order.id}>
              <div className='sdfg'>
                <div className=''>
                <h2>Order ID: #{order.id}</h2>
                <p>Cutomer name: {order.customer.name}</p>
                <p>Date: {new Date(order.date).toLocaleString()}</p>
                <p>Status: {order.status}</p>
                <p>Total: ${order.total}</p>
                
                <h4>Items:</h4>
                </div>
                
                <div>
                  <button
                className="status-btn"
                onClick={() => handleStatusChange(order.id, order.userId)}
              >
                Change Status
              </button>
                </div>
              
              </div>

              {order.items && (
                <div className="order-items">
                  {order.items.map(item => (
                    <div className="crds" key={item.id}>
                      <div className="Ords-img">
                        <img src={item.imgSource} alt={item.model} />
                      </div>
                      <div className="cart-detls">
                        <h3>{item.brand} - {item.model}</h3>
                        <p>Price: ${item.price}</p>
                        <p>Year: {item.year}</p>
                        <p>Fuel: {item.fuel}</p>
                        <p>KMs: {item.kmCover}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className='line'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrdersList;
