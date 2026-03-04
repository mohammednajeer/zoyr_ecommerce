import React, { useEffect, useRef, useState } from 'react';
import './DashBoard.css';
import SideBar from '../../Sidebar/SideBar';
import Chart from 'chart.js/auto';
import { getAdminDashboard } from '../../../AdminAPI/adminApi';

function DashBoard() {

  const donutRef = useRef(null);

  const [users, setUsers] = useState(0);
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState([]);
  const [revenue,setRevenue] = useState(0);

  useEffect(()=>{

    async function load(){
      try{
        const res = await getAdminDashboard()

        setUsers(res.data.users)
        setProducts(res.data.products)
        setOrders(res.data.recent_orders)
        setRevenue(res.data.revenue)

      }catch(err){
        console.error(err)
      }
    }

    load()

  },[])

  useEffect(() => {

    if(!users && !products && !orders.length) return;

    if (window.donutChart) window.donutChart.destroy();

    const donutCtx = donutRef.current.getContext('2d');

    window.donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Users','Vehicles','Orders'],
        datasets: [{
          data: [users, products, orders.length],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
          ],
          borderWidth: 2
        }]
      },
      options:{
        cutout:"65%",
        plugins:{
          legend:{
            position:"bottom"
          }
        }
      }

    });

  },[users,products,orders])

  return (
    <div className="d-cont">

      <SideBar />

      <div className="dashboar-body">

        <p>Dashboard Overview</p>

        {/* KPI CARDS */}

        <div className="kpi-cards">

          <div className="kpi-card">
            <h4>Total Users</h4>
            <p>{users}</p>
          </div>

          <div className="kpi-card">
            <h4>Total Orders</h4>
            <p>{orders.length}</p>
          </div>

          <div className="kpi-card">
            <h4>Total Vehicles</h4>
            <p>{products}</p>
          </div>

          <div className="kpi-card">
            <h4>Total Revenue</h4>
            <p>${revenue}</p>
          </div>

        </div>

        {/* CHART */}

        <div className="charts-wrapper">

          <div className="chart-card glass">
            <h3>Overview</h3>
            <canvas ref={donutRef}></canvas>
          </div>

        </div>

        {/* RECENT ORDERS */}

        <h3 style={{ marginTop: '40px', color:'#00d4ff' }}>Recent Orders</h3>

        <table className="recent-orders">

          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Product</th>
              <th>Price</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>

            {orders.map(order => (

              <tr key={order.id}>

                <td>{order.id}</td>
                <td>{order.user}</td>
                <td>{order.product}</td>
                <td>${order.price}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default DashBoard