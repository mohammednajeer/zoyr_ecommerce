import React, { useEffect, useState } from 'react';
import './VehicleListing.css';
import SideBar from '../../Sidebar/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VehicleListing() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:4000/Products')
      .then(res => setData(res.data))
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const handleEdit = (id) => {
    navigate(`/vehicleUpdate/${id}`);
  };

  async function handleStatus(id) {
    let find = data.find((d) => d.id === id);

    let newStatus = find.status === "active" ? "inactive" : "active";
    axios.patch(`http://localhost:4000/Products/${id}`, { status: newStatus });
    let change = data.map((d) => d.id !== id ? d : { ...d, status: newStatus });
    setData(change);
  }

  return (
    <div className='vl-cont'>
      <SideBar />
      <div className='vl-body'>
        <div className='vl-top-bar'>
          <h2>Vehicle Listings</h2>
          <button className='Add-Btn' onClick={() => navigate('/vehicleUpdate')}>
            + Add Vehicle
          </button>
        </div>

        {data.map(dt => (
          <div key={dt.id} className='Prd-cards'>
            <div className='Prdimg-div'>
              <img className='Prdimg' src={dt.imgSource} alt={dt.model} />
            </div>

            <div className='prdcards-details'>
              <div className='Btn--secion'>
                <button className='prd-btn'>{dt.price}</button>
                <h5>{dt.brand}</h5>
              </div>

              <div className='Car-model-text'>
                <span>{dt.model}</span>
              </div>

              <div className='Car-details'>
                <div className='DT-cntr'>
                  <div className='Detail-sections'>
                    <div>
                      <p>REG.</p>
                      <p>YEAR</p>
                    </div>
                    <h6>{dt.year}</h6>
                  </div>

                  <div className='Detail-sections'>
                    <div>
                      <p>FUEL</p>
                      <p>TYPE</p>
                    </div>
                    <h6>{dt.fuel}</h6>
                  </div>

                  <div className='Detail-sections'>
                    <div>
                      <p>KMS</p>
                      <p>COVERED</p>
                    </div>
                    <h6>{dt.kmCover}</h6>
                  </div>
                </div>

                <div className='Btn-wrapper'>
                  <button onClick={() => handleEdit(dt.id)} className='Edit-Btn'>
                    Edit
                  </button>
                  <button onClick={() => handleStatus(dt.id)} className='Status-Btn'>
                    {dt.status === "active" ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VehicleListing;
