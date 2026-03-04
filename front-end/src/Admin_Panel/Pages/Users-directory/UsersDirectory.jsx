import './UsersDirectory.css'
import SideBar from '../../Sidebar/SideBar'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import icn from '../../../assets/3736502.png'
import { getAdminUsers, deleteUser, toggleUserStatus } from '../../../AdminAPI/adminApi'

function UsersDirectory() {

  const [users,setUsers] = useState([])
  const nav = useNavigate()

  useEffect(()=>{

    async function loadUsers(){
      try{
        const res = await getAdminUsers()
        setUsers(res.data)
      }
      catch(err){
        console.error(err)
      }
    }

    loadUsers()

  },[])

  async function handleStatus(id){

    try{
      const res = await toggleUserStatus(id)

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, status: res.data.status } : u
        )
      )

    }catch(err){
      console.error(err)
    }

  }

  async function handledel(id){

    if(!window.confirm("Delete this user?")) return

    try{

      await deleteUser(id)

      setUsers(prev => prev.filter(u => u.id !== id))

    }
    catch(err){
      console.error(err)
    }

  }

  function handlenavigate(id){
    nav('/userprofile',{state:id})
  }

  return (

    <div className='ud-cont'>

      <SideBar/>

      <div className='ud-body'>

        <div className='titl'>
          <h2>User Directory</h2>
        </div>

        <div className='usrs-list'>

          {users.map(user => (

            <div key={user.id} className='usr'>

              <div onClick={()=>handlenavigate(user.id)} className='profile-section'>
                <div className='cl-for-img'>
                  <img src={icn} alt="" />
                </div>
              </div>

              <div onClick={()=>handlenavigate(user.id)} className="usr-Dtl">

                <h2>{user.username}</h2>
                <h3>ID #{user.id}</h3>
                <h4>{user.email}</h4>

              </div>

              <div className="usr-mng">

                <button
                  className={user.status === "active" ? "active-btn" : "block-btn"}
                  onClick={() => handleStatus(user.id)}
                >
                  {user.status === "active" ? "Active" : "Blocked"}
                </button>

                <button
                  onClick={()=>handledel(user.id)}
                  className="delete-btn"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}

export default UsersDirectory