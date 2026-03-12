import './UsersDirectory.css'
import SideBar from '../../Sidebar/SideBar'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import icn from '../../../assets/3736502.png'
import { getAdminUsers, deleteUser, toggleUserStatus } from '../../../AdminAPI/adminApi'

function UsersDirectory() {
  const [users, setUsers] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getAdminUsers()
        setUsers(res.data)
      } catch (err) { console.error(err) }
    }
    loadUsers()
  }, [])

  async function handleStatus(id) {
    try {
      const res = await toggleUserStatus(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u))
    } catch (err) { console.error(err) }
  }

  async function handleDel(id) {
    if (!window.confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) { console.error(err) }
  }

  return (
    <div className="ud-cont">
      <SideBar />

      <div className="ud-body">

        {/* Header */}
        <div className="ud-page-header">
          <div className="ud-title-group">
            <span className="ud-eyebrow">Management</span>
            <h1 className="ud-main-title">User Directory</h1>
          </div>
          <div className="ud-count">{users.length}</div>
        </div>

        {/* List */}
        <div className="usrs-list">

          {users.length === 0 && (
            <div className="ud-empty">
              <div className="ud-empty-icon">👤</div>
              <p>No users found</p>
            </div>
          )}

          {users.map(user => (
            <div key={user.id} className="usr">

              {/* Avatar */}
              <div className="usr-avatar">
                <img src={icn} alt="" />
              </div>

              {/* Details */}
              <div className="usr-Dtl" onClick={() => nav('/userprofile', { state: user.id })}>
                <h2>{user.username}</h2>
                <h3>ID #{user.id}</h3>
                <h4>{user.email}</h4>
              </div>

              {/* Status badge */}
              <span className={`usr-status-pill ${user.status}`}>
                <span className="status-dot" />
                {user.status}
              </span>
             
              {/* Actions */}
              <div className="usr-mng">
                <button
                  className={`u-btn ${user.status === 'active' ? 'u-toggle-active' : 'u-toggle-blocked'}`}
                  onClick={() => handleStatus(user.id)}
                >
                  {user.status === 'active' ? 'Active' : 'Blocked'}
                </button>

                <button
                  className="u-btn u-view-btn"
                  onClick={() => nav('/userprofile', { state: user.id })}
                  title="View profile"
                >
                  →
                </button>

                <button
                  className="u-btn u-del-btn"
                  onClick={() => handleDel(user.id)}
                  title="Delete user"
                >
                  ✕
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