import React, { useEffect, useState } from 'react';
import './VehicleAddEdit.css';
import SideBar from '../../Sidebar/SideBar';
import { createVehicle, updateVehicle } from '../../../AdminAPI/adminApi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../api/api';
function VehicleAddEdit() {

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    fuel: '',
    kmCover: '',
    price: '',
    status: 'active'
  });

  const [image,setImage] = useState(null)

  const { id } = useParams();
  const navigate = useNavigate();


  useEffect(() => {

    if (id) {

      async function load(){

        const res = await api.get(`products/${id}/`)

        setFormData(res.data)

      }

      load()

    }

  }, [id]);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

  };


 const handleSubmit = async (e) => {

  e.preventDefault()

  const data = new FormData()

  data.append("brand", formData.brand);
  data.append("model", formData.model);
  data.append("year", formData.year);
  data.append("fuel", formData.fuel);
  data.append("kmCover", formData.kmCover);
  data.append("price", formData.price);
  data.append("status", formData.status);

  if (image) {
    data.append("image", image);
  }

  try {

    if (id) {

      await updateVehicle(id, data);

      toast.dark("Vehicle updated")

    } else {

      await createVehicle(data);

      toast.dark("Vehicle added")

    }

    navigate('/VehicleListing')

  } catch (err) {

    console.error(err)

  }

}


  return (

    <div className="vae-cont">

      <SideBar />

      <div className="vae-body">

        <h2>{id ? "Edit Vehicle" : "Add New Vehicle"}</h2>


        <form className="vae-form" onSubmit={handleSubmit}>


          <div className="form-row">
            <label>Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>Model</label>
            <input name="model" value={formData.model} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>Year</label>
            <input name="year" value={formData.year} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>Fuel</label>
            <input name="fuel" value={formData.fuel} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>KMs Covered</label>
            <input name="kmCover" value={formData.kmCover} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>Price</label>
            <input name="price" value={formData.price} onChange={handleChange} required />
          </div>


          <div className="form-row">
            <label>Vehicle Image</label>
            <input type="file" onChange={e=>setImage(e.target.files[0])} />
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

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/VehicleListing')}
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  )

}

export default VehicleAddEdit;