import './SignIn.css'
import usericon from '../../assets/profile.png'
import passwordicon from '../../assets/padlock.png'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import api from "../../api/api"
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function SignIn() {
  const [user, setuser] = useState("")
  const [password, setpassword] = useState("")
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
const location = useLocation();
const redirectTo = location.state?.from || "/";

  let nav = useNavigate()

 useEffect(() => {

  async function checkLogin(){

    try{

      const res = await api.get("profile/")

      if(res.data.role === "admin"){
          nav("/dashboard",{replace:true})
      }else{
          nav("/",{replace:true})
      }

    }catch(err){
      // user not logged in
    }

  }

  checkLogin()

},[])

  async function handleSubmit() {
    let newError = {}
    if (user.trim() === "") newError.name = "Username is required"
    if (password.trim() === "") newError.password = "Password is required"

    if (Object.keys(newError).length === 0) {
      setLoading(true)
      try {
        let res = await api.post("login/", {
          username: user,
          password: password
        });

        let profile = await api.get("profile/");
        if (profile.data.role === "admin") {
          nav("/dashboard", { replace: true });
        } else {
          toast.dark("login success");
          nav(redirectTo, { replace: true });
        }
      } catch (err) {
        if (err.response?.data?.error === "Email not verified") {
          toast.warning("Please verify your email first")
          const email = err.response.data.email
          const username = err.response.data.username
          nav("/verify-otp", { state: { email, username } })
          return
        }
        toast.error(err.response?.data?.error || "Server error")
      } finally {
        setLoading(false)
      }
    }

    setError(newError);
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

        <div className="si-logo">
          <img src={logo} alt="Logo" />
        </div>

        <div className="si-header">
          <h1 className="si-title">Welcome Back</h1>
          <p className="si-subtitle">Sign in to continue your journey</p>
        </div>

        <div className="si-form">
          <div className="si-field-group">
            <div className={`si-field-wrap ${error.name ? 'si-field-err' : ''}`}>
              <span className="si-field-icon">
                <img src={usericon} alt="" />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={user}
                onChange={(e) => setuser(e.target.value)}
                className="si-field-input"
                autoComplete="username"
              />
              <div className="si-focus-bar"></div>
            </div>
            {error.name && (
              <p className='si-err-msg'>
                <span className="si-err-dot">●</span> {error.name}
              </p>
            )}
          </div>

          <div className="si-field-group">
            <div className={`si-field-wrap ${error.password ? 'si-field-err' : ''}`}>
              <span className="si-field-icon">
                <img src={passwordicon} alt="" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setpassword(e.target.value)}
                className="si-field-input"
                autoComplete="current-password"
              />
              <div className="si-focus-bar"></div>
            </div>
            {error.password && (
              <p className='si-err-msg'>
                <span className="si-err-dot">●</span> {error.password}
              </p>
            )}
          </div>

          <button
            className={`si-btn ${loading ? 'si-btn-loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="si-spinner"></span>
            ) : (
              <>
                <span>Sign In</span>
                <svg className="si-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className='si-footer'>
          <p>Don't have an account?
            <span onClick={() => nav("/signup")} className='si-link'> Create one</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn