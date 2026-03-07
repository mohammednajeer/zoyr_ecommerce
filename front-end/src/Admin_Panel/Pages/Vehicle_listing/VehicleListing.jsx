import React, { useEffect, useState } from 'react';
import './VehicleListing.css';
import SideBar from '../../Sidebar/SideBar';
import { getVehicles } from '../../../AdminAPI/adminApi';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';

function VehicleListing() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await getVehicles();
        setData(res.data);
      } catch (err) { console.error(err); }
    }
    loadProducts();
  }, []);

  function handleEdit(e, id) {
    e.stopPropagation();
    navigate(`/vehicleUpdate/${id}`);
  }

  async function handleStatus(e, id) {
    e.stopPropagation();
    const product   = data.find(p => p.id === id);
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`products/${id}/`, { status: newStatus });
      setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) { console.error(err); }
  }

  return (
    <div className="vl-cont">
      <SideBar />
      <div className="vl-body">

        {/* Header */}
        <div className="vl-top-bar">
          <div className="vl-title-group">
            <span className="vl-eyebrow">Inventory</span>
            <h1 className="vl-main-title">Vehicle Listings</h1>
          </div>
          <button className="Add-Btn" onClick={() => navigate('/vehicleUpdate')}>
            + Add Vehicle
          </button>
        </div>

        {data.length === 0 ? (
          <div className="vl-empty">
            <div className="vl-empty-icon">🚗</div>
            <p>No vehicles in inventory</p>
          </div>
        ) : (
          <div className="vl-list">
            {data.map(vehicle => (
              <div
                key={vehicle.id}
                className="vl-card"
                onClick={() => navigate(`/vehicleDetail/${vehicle.id}`)}
                style={{ cursor: 'pointer' }}
              >

                {/* Image pane */}
                <div className="vl-img-pane">
                  <img src={vehicle.image} alt={vehicle.model} />
                  <span className={`vl-badge ${vehicle.status}`}>{vehicle.status}</span>
                </div>

                {/* Content */}
                <div className="vl-content">

                  {/* Identity */}
                  <div className="vl-identity">
                    <span className="vl-brand">{vehicle.brand}</span>
                    <span className="vl-model">{vehicle.model}</span>
                    <span className="vl-id">ID #{vehicle.id}</span>
                    <span className={`vl-avail-badge ${vehicle.availability}`}>{vehicle.availability}</span>
                  </div>

                  <div className="vl-divider" />

                  {/* Specs */}
                  <div className="vl-specs">
                    <div className="vl-spec-item">
                      <span className="vl-spec-lbl">Year</span>
                      <span className="vl-spec-val">{vehicle.year}</span>
                    </div>
                    <div className="vl-spec-item">
                      <span className="vl-spec-lbl">Fuel</span>
                      <span className="vl-spec-val">{vehicle.fuel}</span>
                    </div>
                    <div className="vl-spec-item">
                      <span className="vl-spec-lbl">KMs</span>
                      <span className="vl-spec-val">{Number(vehicle.kmCover).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="vl-price-block">
                    <span className="vl-price-lbl">Price</span>
                    <span className="vl-price">${Number(vehicle.price).toLocaleString()}</span>
                  </div>

                  {/* Actions — stopPropagation so card click doesn't fire */}
                  <div className="vl-actions">
                    <button className="vl-btn Edit-Btn" onClick={(e) => handleEdit(e, vehicle.id)}>
                      Edit
                    </button>
                    <button
                      className={`vl-btn Status-Btn${vehicle.status === 'active' ? '' : ' inactive'}`}
                      onClick={(e) => handleStatus(e, vehicle.id)}
                    >
                      {vehicle.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default VehicleListing;