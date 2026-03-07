import React, { useEffect, useState } from "react";
import "./Orderslist.css";
import SideBar from "../../Sidebar/SideBar";
import { getAdminOrders } from "../../../AdminAPI/adminApi";
import { useNavigate } from "react-router-dom";

const STATUS_MAP = {
  paid:      "paid",
  pending:   "pending",
  confirmed: "confirmed",
  delivered: "delivered",
  cancelled: "cancelled",
};

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await getAdminOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  return (
    <div className="ord-cont">
      <SideBar />

      <div className="ord-body">
        <h2>Orders</h2>

        <div className="ords-list">

          {orders.length === 0 && (
            <div className="ords-empty">
              <div className="ords-empty-icon">📋</div>
              <p>No orders found</p>
            </div>
          )}

          {orders.map((order, i) => (
            <div
              className="ordl"
              key={order.id}
              style={{ animationDelay: `${i * 0.05}s`, cursor: "pointer" }}
              onClick={() => navigate(`/orderDetail/${order.id}`)}
            >
              <div className="sdfg">

                {/* Image wrapped in pane for clean fade */}
                <div className="order-img-pane">
                  <img
                    src={order.product.image?.url || order.product.image}
                    alt={order.product.model}
                  />
                </div>

                <div className="ord-info">
                  <h2>Order #{order.id}</h2>
                  <p><b>Customer</b>{order.name}</p>
                  <p><b>Email</b>{order.email}</p>
                  <p><b>Phone</b>{order.phone}</p>
                  <p>
                    <b>Status</b>
                    <span className={`status-badge ${STATUS_MAP[order.status] || "pending"}`}>
                      {order.status}
                    </span>
                  </p>
                  <p><b>Date</b>{new Date(order.created_at).toLocaleString()}</p>
                  <p className="ord-vehicle-name">{order.product.brand} {order.product.model}</p>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

export default OrdersList;