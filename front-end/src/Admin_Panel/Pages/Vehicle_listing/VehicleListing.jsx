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

    async function loadProducts(){

      try{

        const res = await getVehicles();

        setData(res.data);

      }catch(err){
        console.error(err);
      }

    }

    loadProducts();

  }, []);


  const handleEdit = (id) => {
    navigate(`/vehicleUpdate/${id}`);
  };


  async function handleStatus(id){

    const product = data.find(p => p.id === id);

    const newStatus = product.status === "active" ? "inactive" : "active";

    try{

      await api.patch(`products/${id}/`, { status: newStatus });

      setData(prev =>
        prev.map(p =>
          p.id === id ? { ...p, status: newStatus } : p
        )
      );

    }catch(err){
      console.error(err);
    }

  }


  return (

    <div className='vl-cont'>

      <SideBar />

      <div className='vl-body'>

        <div className='vl-top-bar'>
          <h2>Vehicle Listings</h2>

          <button
            className='Add-Btn'
            onClick={() => navigate('/vehicleUpdate')}
          >
            + Add Vehicle
          </button>

        </div>


        {data.map(vehicle => (

          <div key={vehicle.id} className='Prd-cards'>

            <div className='Prdimg-div'>
              <img
                className='Prdimg'
                src={vehicle.image}
                alt={vehicle.model}
              />
            </div>


            <div className='prdcards-details'>

              <div className='Btn--secion'>
                <button className='prd-btn'>
                  ${vehicle.price}
                </button>

                <h5>{vehicle.brand}</h5>
              </div>


              <div className='Car-model-text'>
                <span>{vehicle.model}</span>
              </div>


              <div className='Car-details'>

                <div className='DT-cntr'>

                  <div className='Detail-sections'>
                    <div>
                      <p>REG.</p>
                      <p>YEAR</p>
                    </div>
                    <h6>{vehicle.year}</h6>
                  </div>


                  <div className='Detail-sections'>
                    <div>
                      <p>FUEL</p>
                      <p>TYPE</p>
                    </div>
                    <h6>{vehicle.fuel}</h6>
                  </div>


                  <div className='Detail-sections'>
                    <div>
                      <p>KMS</p>
                      <p>COVERED</p>
                    </div>
                    <h6>{vehicle.kmCover}</h6>
                  </div>

                </div>


                <div className='Btn-wrapper'>

                  <button
                    onClick={() => handleEdit(vehicle.id)}
                    className='Edit-Btn'
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleStatus(vehicle.id)}
                    className='Status-Btn'
                  >
                    {vehicle.status === "active" ? "Active" : "Inactive"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}

export default VehicleListing;