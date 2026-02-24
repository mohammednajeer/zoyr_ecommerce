import React, { useEffect, useRef, useState } from 'react';
import './DashBoard.css';
import SideBar from '../../Sidebar/SideBar';
import Chart from 'chart.js/auto';
import axios from 'axios';

function DashBoard() {
  const donutRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get('http://localhost:4000/Users');
        const productsRes = await axios.get('http://localhost:4000/Products');
        setUsers(usersRes.data);
        setProducts(productsRes.data);

       
        const allOrders = usersRes.data.flatMap(user => user.orders?.map(order => ({
          ...order,
          user: user.username || 'Unknown'
        })) || []);
        setOrders(allOrders.sort((a,b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!users.length || !products.length) return;

  
    if (window.donutChart) window.donutChart.destroy();
    if (window.lineChart) window.lineChart.destroy();
    if (window.barChart) window.barChart.destroy();

    // ---- DONUT CHART ----
    const totalOrders = users.reduce((sum, user) => sum + (user.orders?.length || 0), 0);
    const totalUsers = users.length;
    const totalVehicles = products.length;

    const donutCtx = donutRef.current.getContext('2d');
    window.donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Orders', 'Users', 'Vehicles'],
        datasets: [{
          data: [totalOrders, totalUsers, totalVehicles],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 0.9)',
            'rgba(54, 162, 235, 0.9)',
            'rgba(255, 206, 86, 0.9)',
          ],
          borderWidth: 2,
          hoverOffset: 10,
        }],
      },
      options: {
         layout: {
            padding: 4,  // adds space around the chart to prevent clipping
         },
        cutout: '60%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#ccc', font: { size: 13 } } }
        },
      },
    });

    // ---- LINE CHART: Monthly Revenue ----
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyRevenue = Array(12).fill(0);
    users.forEach(user => {
      user.orders?.forEach(order => {
        const month = new Date(order.date).getMonth();
        monthlyRevenue[month] += order.total;
      });
    });

    const lineCtx = lineRef.current.getContext('2d');
    window.lineChart = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Monthly Revenue',
          data: monthlyRevenue,
          borderColor: 'rgba(0, 212, 255, 0.8)',
          backgroundColor: 'rgba(0, 212, 255, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(0,212,255,0.9)',
        }],
      },
      options: {
        plugins: { legend: { labels: { color: '#ccc', font: { size: 13 } } } },
        scales: {
          x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        },
      },
    });

    // ---- BAR CHART: Vehicle Brand Distribution ----
    const brandCounts = {};
    products.forEach(prod => {
      brandCounts[prod.brand] = (brandCounts[prod.brand] || 0) + 1;
    });

    const barCtx = barRef.current.getContext('2d');
    window.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(brandCounts),
        datasets: [{
          label: 'Vehicle Count by Brand',
          data: Object.values(brandCounts),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 0.9)',
          borderWidth: 2,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#ccc', font: { size: 13 } } } },
        scales: {
          x: { 
            ticks: { color: '#aaa', maxRotation: 0, minRotation: 0 }, // fix rotation
            grid: { color: 'rgba(255,255,255,0.05)' } 
          },
          y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

  }, [users, products]);

  return (
    <div className="d-cont">
      <SideBar />
      <div className="dashboar-body">
        <p>Dashboard Overview</p>

       
        <div className="kpi-cards">
          <div className="kpi-card">
            <h4>Total Users</h4>
            <p>{users.length}</p>
          </div>
          <div className="kpi-card">
            <h4>Total Orders</h4>
            <p>{orders.length}</p>
          </div>
          <div className="kpi-card">
            <h4>Total Vehicles</h4>
            <p>{products.length}</p>
          </div>
          <div className="kpi-card">
            <h4>Total Revenue</h4>
            <p>${orders.reduce((sum,o)=>sum+o.total,0)}</p>
          </div>
        </div>

        
        <div className="charts-wrapper">
          <div className="chart-card glass">
            <h3>Overview</h3>
            <canvas ref={donutRef}></canvas>
          </div>

          <div className="chart-card glass">
            <h3>Revenue Growth</h3>
            <canvas ref={lineRef}></canvas>
          </div>

          <div className="chart-card glass full-bar">
            <h3>Vehicle Distribution</h3>
            <canvas ref={barRef}></canvas>
          </div>
        </div>

        
        <h3 style={{ marginTop: '40px', color:'#00d4ff' }}>Recent Orders</h3>
        <table className="recent-orders">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user}</td>
                <td>${order.total}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashBoard;
