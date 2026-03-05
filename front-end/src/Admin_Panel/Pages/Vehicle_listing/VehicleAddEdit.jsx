import React, { useEffect, useState } from 'react';
import './VehicleAddEdit.css';
import SideBar from '../../Sidebar/SideBar';
import { createVehicle, updateVehicle } from '../../../AdminAPI/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../api/api';

function VehicleAddEdit() {
  const [formData, setFormData] = useState({
    brand: '', model: '', year: '', fuel: '',
    kmCover: '', price: '', status: 'active',
  });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(null);

  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const res = await api.get(`products/${id}/`);
        setFormData(res.data);
        if (res.data.image) setPreview(res.data.image);
      } catch (err) { console.error(err); }
    }
    load();
  }, [id]);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    if (image) data.append('image', image);
    try {
      if (isEdit) {
        await updateVehicle(id, data);
        toast.dark('Vehicle updated');
      } else {
        await createVehicle(data);
        toast.dark('Vehicle added');
      }
      navigate('/VehicleListing');
    } catch (err) { console.error(err); }
  }

  return (
    <div className="vae-cont">
      <SideBar />
      <div className="vae-body">

        {/* Back */}
        <button className="vae-back" onClick={() => navigate('/VehicleListing')}>
          <span className="vae-back-arr">←</span>
          Vehicle Listings
        </button>

        {/* Header */}
        <div className="vae-header">
          <span className="vae-eyebrow">{isEdit ? 'Editing Entry' : 'New Entry'}</span>
          <h1 className="vae-main-title">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
        </div>

        {/* Form */}
        <form className="vae-form" onSubmit={handleSubmit}>

          {/* LEFT — spec sheet */}
          <div className="vae-spec-sheet">

            {/* Identity */}
            <div className="vae-section section-identity">
              <div className="vae-section-label">Identity</div>
              <div className="vae-fields-row">
                <div className="form-row">
                  <label>Brand</label>
                  <input
                    name="brand" value={formData.brand}
                    onChange={handleChange} placeholder="e.g. Porsche" required
                  />
                </div>
                <div className="form-row">
                  <label>Model</label>
                  <input
                    name="model" value={formData.model}
                    onChange={handleChange} placeholder="e.g. 911 Carrera" required
                  />
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="vae-section section-specs">
              <div className="vae-section-label">Specifications</div>
              <div className="vae-fields-row cols-3">
                <div className="form-row">
                  <label>Year</label>
                  <input name="year" value={formData.year} onChange={handleChange} placeholder="2023" required />
                </div>
                <div className="form-row">
                  <label>Fuel Type</label>
                  <input name="fuel" value={formData.fuel} onChange={handleChange} placeholder="Petrol" required />
                </div>
                <div className="form-row">
                  <label>KMs Covered</label>
                  <input name="kmCover" value={formData.kmCover} onChange={handleChange} placeholder="12,000" required />
                </div>
              </div>
            </div>

            {/* Pricing & Status */}
            <div className="vae-section section-pricing">
              <div className="vae-section-label">Pricing &amp; Status</div>
              <div className="vae-fields-row">
                <div className="form-row">
                  <label>Price (USD)</label>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="185,000" required />
                </div>
                <div className="form-row">
                  <label>Status</label>
                  <div className="select-wrap">
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT — image panel */}
          <div className="vae-image-panel">
            <div className="vae-image-panel-head">Vehicle Image</div>

            <div className="vae-img-preview">
              {preview
                ? <img src={preview} alt="preview" />
                : (
                  <div className="vae-img-placeholder">
                    <div className="vae-img-ph-icon">📷</div>
                    <span>No image selected</span>
                  </div>
                )
              }
            </div>

            <div className="vae-image-upload-area">
              <div className="form-row">
                <label>Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFile} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="vae-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/VehicleListing')}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default VehicleAddEdit;