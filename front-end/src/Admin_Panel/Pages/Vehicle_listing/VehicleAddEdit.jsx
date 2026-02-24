import React, { useEffect, useState } from 'react';
import './VehicleAddEdit.css';
import SideBar from '../../Sidebar/SideBar';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function VehicleAddEdit() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    fuel: '',
    kmCover: '',
    price: '',
    imgSource: '',
    status: 'active'
  });

  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:4000/Products/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error("Error loading product:", err));
    }
  }, [id]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:4000/Products/${id}`, formData);
        toast.dark("Vehicle updated successfully!");
      } else {
        await axios.post('http://localhost:4000/Products', formData);
        toast.dark("Vehicle added successfully!");
      }
      navigate('/VehicleListing');
    } catch (err) {
      console.error("Error savin", err);
    }
  };

  return (
    <div className="vae-cont">
      <SideBar />
      <div className="vae-body">
        <h2>{id ? "Edit Vehicle" : "Add New Vehicle"}</h2>

        <form className="vae-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Model</label>
            <input type="text" name="model" value={formData.model} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Year</label>
            <input type="text" name="year" value={formData.year} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Fuel Type</label>
            <input type="text" name="fuel" value={formData.fuel} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Kilometers Covered</label>
            <input type="text" name="kmCover" value={formData.kmCover} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Price</label>
            <input type="text" name="price" value={formData.price} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Image URL</label>
            <input type="text" name="imgSource" value={formData.imgSource} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="btn-container">
            <button type="submit" className="save-btn">
              {id ? "Update Vehicle" : "Add Vehicle"}
            </button>
            <button type="button" className="cancel-btn" onClick={() => navigate('/VehicleListing')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleAddEdit;


