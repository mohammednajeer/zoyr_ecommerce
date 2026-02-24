import './UsersDirectory.css'
import SideBar from '../../Sidebar/SideBar'
import { useEffect, useState } from 'react'
import axios from 'axios'
import icn from '../../../assets/3736502.png'
import { useNavigate } from 'react-router-dom'

function UsersDirectory() {
  const [data,setdata]=useState([])
  let nav = useNavigate()
  useEffect(()=>{
    axios.get('http://localhost:4000/Users?role=user')

      .then(res => setdata(res.data))
      .catch(err => console.log(err))
  },[handledel])

  async function handleStatus(id){
    let find = data.find((d) => d.id === id);
    if (!find) return;

    let newStatus = find.status === "active" ? "block" : "active";
    await axios.patch(`http://localhost:4000/Users/${id}`, { status: newStatus });
    
    let change = data.map((d) => d.id !== id ? d : { ...d, status: newStatus });
    setdata(change);
  }
  async function handledel(id){
    let find = data.find((d) => d.id === id);
    if (!find) return;
    axios.delete(`http://localhost:4000/Users/${id}`)
  }
  function handlenavigate(id){
    nav('/userprofile',{state:id})
  }

  return (
    <div className='ud-cont'>
      <SideBar/>
      <div className='ud-body'>
        <div className='titl'><h2>User Directory</h2></div>
        <div className='usrs-list'>
          {data.map((dt) => (
            <div  key={dt.id} className='usr'>
              <div onClick={()=>handlenavigate(dt.id)} className='profile-section'>
                <div onClick={()=>handlenavigate(dt.id)} className='cl-for-img' >
                  <img src={icn} alt="" />
                </div>
              </div>
              <div onClick={()=>handlenavigate(dt.id)} className="usr-Dtl">
                <h2>{dt.username}</h2>
                <h3>{`ID #${dt.id}`}</h3>
                <h4>{dt.email}</h4>
                <p>Orders Placed: {dt.orders ? dt.orders.length : 0}</p>
              </div>
              <div className="usr-mng">
                <button 
                  className={dt.status === "active" ? "active-btn" : "block-btn"} 
                  onClick={() => handleStatus(dt.id)}
                >
                  {dt.status === "active" ? "Active" : "Block"}
                </button>
                <button onClick={()=>handledel(dt.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UsersDirectory
