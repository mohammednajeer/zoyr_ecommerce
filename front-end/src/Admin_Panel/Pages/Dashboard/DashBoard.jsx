import React, { useEffect, useRef, useState } from 'react';
import './DashBoard.css';
import SideBar from '../../Sidebar/SideBar';
import Chart from 'chart.js/auto';
import { getAdminDashboard } from '../../../AdminAPI/adminApi';

/* ── Colour palette ── */
const GOLD  = '#c8a96e';
const TEAL  = '#4aaa92';
const BLUE  = '#5b9bc8';
const DARK  = '#0a0a0d';

Chart.defaults.color       = '#8a8070';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Outfit', sans-serif";
Chart.defaults.font.size   = 11;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const mockRevenue = [14000,19500,15800,23000,21200,30000,25800,34000,28600,37000,31500,42000];
const mockOrders  = [5,8,6,11,9,13,11,15,12,16,13,18];

const S_MAP = { pending:'s-pending', confirmed:'s-confirmed', delivered:'s-delivered', cancelled:'s-cancelled' };

export default function DashBoard() {
  const donutRef = useRef(null);
  const lineRef  = useRef(null);
  const barRef   = useRef(null);
  const polarRef = useRef(null);

  const [users,    setUsers]    = useState(0);
  const [products, setProducts] = useState(0);
  const [orders,   setOrders]   = useState([]);
  const [revenue,  setRevenue]  = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAdminDashboard();
        setUsers(res.data.users);
        setProducts(res.data.products);
        setOrders(res.data.recent_orders);
        setRevenue(res.data.revenue);
      } catch (err) { console.error(err); }
    }
    load();
  }, []);

  /* Gradient fill helper */
  function mkGrad(ctx, r, g, b, top = 0.2, bot = 0) {
    const gr = ctx.createLinearGradient(0, 0, 0, 270);
    gr.addColorStop(0, `rgba(${r},${g},${b},${top})`);
    gr.addColorStop(1, `rgba(${r},${g},${b},${bot})`);
    return gr;
  }

  /* 1. Donut */
  useEffect(() => {
    if (!users && !products && !orders.length) return;
    const c = donutRef.current;
    if (!c) return;
    if (c._ch) c._ch.destroy();
    c._ch = new Chart(c.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Users', 'Vehicles', 'Orders'],
        datasets: [{
          data: [users || 1, products || 1, orders.length || 1],
          backgroundColor: [BLUE, GOLD, TEAL],
          borderColor: [DARK, DARK, DARK],
          borderWidth: 3, hoverOffset: 8,
        }],
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, boxWidth: 9, usePointStyle: true, pointStyle: 'circle' } },
        },
        animation: { animateRotate: true, duration: 1000 },
      },
    });
  }, [users, products, orders]);

  /* 2. Line — revenue */
  useEffect(() => {
    const c = lineRef.current;
    if (!c) return;
    if (c._ch) c._ch.destroy();
    const ctx = c.getContext('2d');
    c._ch = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MONTHS,
        datasets: [{
          label: 'Revenue',
          data: mockRevenue,
          borderColor: BLUE,
          backgroundColor: mkGrad(ctx, 91, 155, 200, 0.16, 0),
          fill: true, tension: 0.44,
          pointBackgroundColor: BLUE,
          pointBorderColor: DARK,
          pointBorderWidth: 2, pointRadius: 3, pointHoverRadius: 6,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(91,155,200,0.06)' }, ticks: { font: { size: 10 }, color: '#6a6060' } },
          y: {
            grid: { color: 'rgba(91,155,200,0.06)' },
            ticks: { font: { size: 10 }, color: BLUE, callback: v => '$' + (v/1000).toFixed(0) + 'k' },
          },
        },
        animation: { duration: 1100 },
      },
    });
  }, []);

  /* 3. Bar — orders */
  useEffect(() => {
    const c = barRef.current;
    if (!c) return;
    if (c._ch) c._ch.destroy();
    c._ch = new Chart(c.getContext('2d'), {
      type: 'bar',
      data: {
        labels: MONTHS,
        datasets: [{
          label: 'Orders',
          data: mockOrders,
          backgroundColor: mockOrders.map((_, i) =>
            i === mockOrders.length - 1 ? TEAL : 'rgba(74,170,146,0.24)'),
          borderColor: 'transparent',
          borderRadius: 6, borderSkipped: false,
          hoverBackgroundColor: '#6dc9b4',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#6a6060' } },
          y: {
            grid: { color: 'rgba(74,170,146,0.07)' },
            ticks: { font: { size: 10 }, color: TEAL, stepSize: 3 },
          },
        },
        animation: { duration: 1000 },
      },
    });
  }, []);

  /* 4. Polar — order status */
  useEffect(() => {
    const c = polarRef.current;
    if (!c || !orders.length) return;
    if (c._ch) c._ch.destroy();
    const counts = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});
    const labels = Object.keys(counts);
    const vals   = Object.values(counts);
    const cols = [
      'rgba(200,169,110,0.5)',
      'rgba(91,155,200,0.5)',
      'rgba(74,170,146,0.5)',
      'rgba(200,80,80,0.5)',
    ];
    c._ch = new Chart(c.getContext('2d'), {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          data: vals,
          backgroundColor: cols.slice(0, labels.length),
          borderColor: DARK, borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, boxWidth: 9, usePointStyle: true, pointStyle: 'circle' } },
        },
        scales: {
          r: { grid: { color: 'rgba(91,155,200,0.08)' }, ticks: { display: false } },
        },
        animation: { duration: 900 },
      },
    });
  }, [orders]);

  const totalItems = users + products + orders.length;

  return (
    <div className="d-cont">
      <SideBar />
      <div className="dashboar-body">

        {/* Header */}
        <div className="db-page-header">
          <div className="db-title-group">
            <span className="db-eyebrow">Admin Panel</span>
            <h1 className="db-main-title">Dashboard</h1>
          </div>
          <span className="db-date">
            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </span>
        </div>

        {/* KPI cards */}
        <div className="kpi-cards">
          {[
            { icon:'👤', label:'Total Users',    value: users,                                  sub:'Registered accounts' },
            { icon:'📋', label:'Total Orders',   value: orders.length,                          sub:'All time' },
            { icon:'🚗', label:'Total Vehicles', value: products,                               sub:'In inventory' },
            { icon:'💰', label:'Total Revenue',  value: `$${Number(revenue).toLocaleString()}`, sub:'Gross earnings' },
          ].map(({ icon, label, value, sub }) => (
            <div className="kpi-card" key={label}>
              <div className="kpi-icon">{icon}</div>
              <div className="kpi-label">{label}</div>
              <div className="kpi-value">{value}</div>
              <div className="kpi-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* Top charts */}
        <div className="charts-top">
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Financial</span>
                <span className="chart-title">Revenue Trend</span>
              </div>
              <span className="chart-tag">2025</span>
            </div>
            <div className="chart-wrap" style={{ height: 228 }}>
              <canvas ref={lineRef} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Activity</span>
                <span className="chart-title">Monthly Orders</span>
              </div>
              <span className="chart-tag">2025</span>
            </div>
            <div className="chart-wrap" style={{ height: 228 }}>
              <canvas ref={barRef} />
            </div>
          </div>
        </div>

        {/* Bottom charts */}
        <div className="charts-bottom">
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Breakdown</span>
                <span className="chart-title">Order Status</span>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 268 }}>
              <canvas ref={polarRef} />
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Platform</span>
                <span className="chart-title">Overview</span>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 268, position: 'relative' }}>
              <canvas ref={donutRef} />
              <div className="donut-center">
                <div className="donut-val">{totalItems}</div>
                <div className="donut-lbl">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="section-head">
          <span className="section-eyebrow">Recent Orders</span>
          <div className="section-rule" />
        </div>

        <div className="table-wrap">
          <table className="recent-orders">
            <thead>
              <tr>
                <th>Order ID</th><th>User</th><th>Product</th>
                <th>Price</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="td-id">#{order.id}</td>
                  <td className="td-user">{order.user}</td>
                  <td>{order.product}</td>
                  <td className="td-price">${order.price}</td>
                  <td>
                    <span className={`status-pill ${S_MAP[order.status] || 's-pending'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}