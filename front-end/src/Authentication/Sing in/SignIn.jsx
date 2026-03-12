import './SignIn.css'
import usericon from '../../assets/profile.png'
import passwordicon from '../../assets/padlock.png'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify';
import api from "../../api/api"

function SignIn() {
  const [user, setuser] = useState("")
  const [password, setpassword] = useState("")
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)   // ← NEW
  const location = useLocation()
  const redirectTo = location.state?.from || "/"
  const nav = useNavigate()

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await api.get("profile/")
        window.location.replace(res.data.role === "admin" ? "/dashboard" : redirectTo)
      } catch {
        setAuthChecking(false)
      }
    }
    checkLogin()
  }, [])

  // Block render until auth check completes
  if (authChecking) return null

  async function handleSubmit() {
    let newError = {}
    if (user.trim() === "") newError.name = "Username is required"
    if (password.trim() === "") newError.password = "Password is required"

    setError(newError)
    if (Object.keys(newError).length > 0) return

    setLoading(true)
    try {
      await api.post("login/", { username: user, password: password })
      const profile = await api.get("profile/")
      window.location.replace(profile.data.role === "admin" ? "/dashboard" : redirectTo)
    } catch (err) {
      if (!err.response) {
        toast.error("Network error — please check your connection")
        return
      }
      
      if (err.response?.status === 403) {
        toast.error(err.response.data?.error || "Access denied")
        return
      }
      toast.error(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className='si-root'>
      <div className="si-bg">
        <div className="si-orb si-orb-1"></div>
        <div className="si-orb si-orb-2"></div>
        <div className="si-grid"></div>
      </div>
      <div className='si-card' onKeyDown={handleKeyDown}>
        <div className="si-accent-line"></div>
        <div className="si-logo"><img src={logo} alt="Logo" /></div>
        <div className="si-header">
          <h1 className="si-title">Welcome Back</h1>
          <p className="si-subtitle">Sign in to continue your journey</p>
        </div>
        <div className="si-form">
          <div className="si-field-group">
            <div className={`si-field-wrap ${error.name ? 'si-field-err' : ''}`}>
              <span className="si-field-icon"><img src={usericon} alt="" /></span>
              <input type="text" placeholder="Username" value={user}
                onChange={(e) => setuser(e.target.value)} className="si-field-input" autoComplete="username" />
              <div className="si-focus-bar"></div>
            </div>
            {error.name && <p className='si-err-msg'><span className="si-err-dot">●</span> {error.name}</p>}
          </div>
          <div className="si-field-group">
            <div className={`si-field-wrap ${error.password ? 'si-field-err' : ''}`}>
              <span className="si-field-icon"><img src={passwordicon} alt="" /></span>
              <input type="password" placeholder="Password" value={password}
                onChange={e => setpassword(e.target.value)} className="si-field-input" autoComplete="current-password" />
              <div className="si-focus-bar"></div>
            </div>
            {error.password && <p className='si-err-msg'><span className="si-err-dot">●</span> {error.password}</p>}
          </div>
          <button className={`si-btn ${loading ? 'si-btn-loading' : ''}`} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="si-spinner"></span> : (
              <><span>Sign In</span>
                <svg className="si-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" /></svg></>
            )}
          </button>
        </div>
        <div className='si-footer'>
          <p>Don't have an account?<span onClick={() => nav("/signup")} className='si-link'> Create one</span></p>
        </div>
      </div>
    </div>
  )
}

export default SignIn