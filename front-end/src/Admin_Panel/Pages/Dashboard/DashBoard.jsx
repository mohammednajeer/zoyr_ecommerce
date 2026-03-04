import React, { useEffect, useRef, useState } from 'react';
import './DashBoard.css';
import SideBar from '../../Sidebar/SideBar';
import Chart from 'chart.js/auto';
import { getAdminDashboard } from '../../../AdminAPI/adminApi';

/* ── Chart colour tokens matching ZOYR user side ── */
const GOLD   = '#c8a96e';
const GOLD_B = '#e8cc8a';
const GOLD3  = 'rgba(200,169,110,0.3)';
const GOLD1  = 'rgba(200,169,110,0.08)';
const DARK   = '#0d0d0d';

Chart.defaults.color          = '#8a8070';
Chart.defaults.borderColor    = 'rgba(200,169,110,0.1)';
Chart.defaults.font.family    = "'Outfit', sans-serif";
Chart.defaults.font.size      = 11;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* Fake monthly data — replace with API when available */
const mockRevenue = [14000,19500,15800,23000,21200,30000,25800,34000,28600,37000,31500,42000];
const mockOrders  = [5,8,6,11,9,13,11,15,12,16,13,18];

/* Status → CSS class */
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

  /* ── Fetch data ── */
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

  /* ── Helper: create linear gradient fill ── */
  function goldGrad(ctx, top = 0.22, bot = 0) {
    const g = ctx.createLinearGradient(0, 0, 0, 280);
    g.addColorStop(0, `rgba(200,169,110,${top})`);
    g.addColorStop(1, `rgba(200,169,110,${bot})`);
    return g;
  }

  /* ── 1. Donut — platform overview ── */
  useEffect(() => {
    if (!users && !products && !orders.length) return;
    const c = donutRef.current;
    if (c._ch) c._ch.destroy();
    c._ch = new Chart(c.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Users', 'Vehicles', 'Orders'],
        datasets: [{
          data: [users || 1, products || 1, orders.length || 1],
          backgroundColor: [GOLD, 'rgba(237,232,223,0.55)', 'rgba(138,96,48,0.75)'],
          borderColor:     [DARK, DARK, DARK],
          borderWidth: 3,
          hoverOffset: 10,
        }],
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { padding: 16, boxWidth: 10, usePointStyle: true, pointStyle: 'circle' } },
        },
        animation: { animateRotate: true, duration: 1000 },
      },
    });
  }, [users, products, orders]);

  /* ── 2. Line — monthly revenue ── */
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
          label: 'Revenue ($)',
          data: mockRevenue,
          borderColor: GOLD,
          backgroundColor: goldGrad(ctx, 0.2, 0),
          fill: true,
          tension: 0.46,
          pointBackgroundColor: GOLD,
          pointBorderColor: DARK,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(200,169,110,0.07)' }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(200,169,110,0.07)' },
            ticks: { font: { size: 10 }, callback: v => '$' + (v/1000).toFixed(0) + 'k' },
          },
        },
        animation: { duration: 1100 },
      },
    });
  }, []);

  /* ── 3. Bar — monthly orders ── */
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
            i === mockOrders.length - 1 ? GOLD : 'rgba(200,169,110,0.28)'),
          borderColor: 'transparent',
          borderRadius: 7,
          borderSkipped: false,
          hoverBackgroundColor: GOLD_B,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(200,169,110,0.07)' },
            ticks: { font: { size: 10 }, stepSize: 3 },
          },
        },
        animation: { duration: 1000 },
      },
    });
  }, []);

  /* ── 4. Polar area — order status breakdown ── */
  useEffect(() => {
    const c = polarRef.current;
    if (!c || !orders.length) return;
    if (c._ch) c._ch.destroy();
    const counts = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});
    const labels = Object.keys(counts);
    const vals   = Object.values(counts);
    const cols   = ['rgba(200,169,110,0.6)','rgba(59,130,246,0.6)','rgba(72,199,142,0.6)','rgba(210,50,50,0.6)'];
    c._ch = new Chart(c.getContext('2d'), {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          data: vals,
          backgroundColor: cols.slice(0, labels.length),
          borderColor: DARK,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, boxWidth: 10, usePointStyle: true, pointStyle: 'circle' } },
        },
        scales: {
          r: { grid: { color: 'rgba(200,169,110,0.08)' }, ticks: { display: false } },
        },
        animation: { duration: 900 },
      },
    });
  }, [orders]);

  const totalItems = users + products + orders.length;

  const statusClass = (s) => S_MAP[s] || 's-pending';

  return (
    <div className="d-cont">
      <SideBar />

      <div className="dashboar-body">

        {/* ── Header ── */}
        <div className="db-page-header">
          <div className="db-title-group">
            <span className="db-eyebrow">Admin Panel</span>
            <h1 className="db-main-title">Dashboard</h1>
          </div>
          <span className="db-date">
            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </span>
        </div>

        {/* ── KPI cards ── */}
        <div className="kpi-cards">
          {[
            { icon:'👤', label:'Total Users',    value: users,                              sub:'Registered accounts' },
            { icon:'📋', label:'Total Orders',   value: orders.length,                      sub:'All time' },
            { icon:'🚗', label:'Total Vehicles', value: products,                           sub:'In inventory' },
            { icon:'💰', label:'Total Revenue',  value:`$${Number(revenue).toLocaleString()}`, sub:'Gross earnings' },
          ].map(({ icon, label, value, sub }) => (
            <div className="kpi-card" key={label}>
              <div className="kpi-icon">{icon}</div>
              <div className="kpi-label">{label}</div>
              <div className="kpi-value">{value}</div>
              <div className="kpi-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Top charts row: Revenue line + Monthly orders bar ── */}
        <div className="charts-top">

          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Financial</span>
                <span className="chart-title">Revenue Trend</span>
              </div>
              <span className="chart-tag">2025</span>
            </div>
            <div className="chart-wrap" style={{ height: 230 }}>
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
            <div className="chart-wrap" style={{ height: 230 }}>
              <canvas ref={barRef} />
            </div>
          </div>

        </div>

        {/* ── Bottom charts row: Order status polar + Platform donut ── */}
        <div className="charts-bottom">

          <div className="chart-card">
            <div className="chart-head">
              <div className="chart-title-wrap">
                <span className="chart-eyebrow">Breakdown</span>
                <span className="chart-title">Order Status</span>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: 270 }}>
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
            <div className="chart-wrap" style={{ height: 270, position: 'relative' }}>
              <canvas ref={donutRef} />
              <div className="donut-center">
                <div className="donut-val">{totalItems}</div>
                <div className="donut-lbl">Total</div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Recent orders table ── */}
        <div className="section-head">
          <span className="section-eyebrow">Recent Orders</span>
          <div className="section-rule" />
        </div>

        <div className="table-wrap">
          <table className="recent-orders">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
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
                    <span className={`status-pill ${statusClass(order.status)}`}>
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