import './SignUp.css'
import mail from '../../assets/mail.png'
import usericon from '../../assets/profile.png'
import passwordicon from '../../assets/padlock.png'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import api from "../../api/api"

function SignUp() {
  let nav = useNavigate()
  const [user, setuser] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)   // ← NEW
  let [error, setError] = useState({})

  // ── auth guard — must be at component level, NOT inside a function ──
  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await api.get("profile/")
        // Already logged in — replace so back button can't return here
        window.location.replace(res.data.role === "admin" ? "/dashboard" : "/")
      } catch {
        // Not logged in — show the form
        setAuthChecking(false)
      }
    }
    checkLogin()
  }, [])

  // Block render until auth check completes — prevents the page flash
  if (authChecking) return null

  async function handleSubmit() {
    let newError = {}
    const trimmedUser = user.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (trimmedUser === "") {
      newError.name = "Username is required"
    } else if (!/^[a-zA-Z0-9@.+-_]+$/.test(trimmedUser)) {
      newError.name = "Username cannot contain spaces or special characters"
    }
    if (trimmedEmail === "") newError.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      newError.email = "Enter a valid email address"
    if (trimmedPassword === "") newError.password = "Password is required"
    else if (trimmedPassword.length < 6) newError.password = "Password must be at least 6 characters"

    setError(newError)
    if (Object.keys(newError).length > 0) return

    setLoading(true)
    try {
      const res = await api.post("register/", {
        username: trimmedUser,
        email: trimmedEmail,
        password: trimmedPassword
      })
      const username = res.data.username || trimmedUser
      toast.dark("Account Created successfully")
      nav("/login", { state: { email: trimmedEmail, username } })
    } catch (err) {
      if (!err.response) {
        toast.error("Network error — please check your connection")
        return
      }
      const errors = err.response?.data
      if (errors?.username) toast.error(errors.username[0])
      else if (errors?.email) toast.error(errors.email[0])
      else toast.error(err.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  function getStrength(pw) {
    if (!pw) return { level: 0, label: '', color: '' }
    if (pw.length < 6) return { level: 1, label: 'Too short', color: '#d97060' }
    const has = (r) => r.test(pw)
    const score = [has(/[A-Z]/), has(/[0-9]/), has(/[^A-Za-z0-9]/), pw.length >= 10].filter(Boolean).length
    if (score <= 1) return { level: 2, label: 'Weak', color: '#d97060' }
    if (score === 2) return { level: 3, label: 'Fair', color: '#c8a96e' }
    if (score === 3) return { level: 4, label: 'Good', color: '#80b070' }
    return { level: 5, label: 'Strong', color: '#60c080' }
  }
  const strength = getStrength(password)

  return (
    <div className='su-root' onKeyDown={handleKeyDown}>
      <div className="su-bg">
        <div className="su-orb su-orb-1"></div>
        <div className="su-orb su-orb-2"></div>
        <div className="su-grid"></div>
      </div>
      <div className='su-card'>
        <div className="su-accent-line"></div>
        <div className="su-logo"><img src={logo} alt="Logo" /></div>
        <div className="su-header">
          <h1 className="su-title">Create Account</h1>
          <p className="su-subtitle">Join us — it only takes a moment</p>
        </div>
        <div className="su-form">
          <div className="su-field-group">
            <div className={`su-field-wrap ${error.name ? 'su-field-err' : ''}`}>
              <span className="su-field-icon"><img src={usericon} alt="" /></span>
              <input type="text" placeholder="Username" value={user}
                onChange={(e) => setuser(e.target.value)} className="su-field-input" autoComplete="username" />
              <div className="su-focus-bar"></div>
            </div>
            {error.name && <p className='su-err-msg'><span className="su-err-dot">●</span> {error.name}</p>}
          </div>
          <div className="su-field-group">
            <div className={`su-field-wrap ${error.email ? 'su-field-err' : ''}`}>
              <span className="su-field-icon"><img src={mail} alt="" /></span>
              <input type="email" placeholder="Email address" value={email}
                onChange={e => setemail(e.target.value)} className="su-field-input" autoComplete="email" />
              <div className="su-focus-bar"></div>
            </div>
            {error.email && <p className='su-err-msg'><span className="su-err-dot">●</span> {error.email}</p>}
          </div>
          <div className="su-field-group">
            <div className={`su-field-wrap ${error.password ? 'su-field-err' : ''}`}>
              <span className="su-field-icon"><img src={passwordicon} alt="" /></span>
              <input type={showPass ? "text" : "password"} placeholder="Password" value={password}
                onChange={e => setpassword(e.target.value)} className="su-field-input" autoComplete="new-password" />
              <button type="button" className="su-pass-toggle" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              <div className="su-focus-bar"></div>
            </div>
            {password && (
              <div className="su-strength-wrap">
                <div className="su-strength-segs">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="su-strength-seg"
                      style={{ background: i <= strength.level ? strength.color : 'rgba(255,255,255,0.06)', transition: `background 0.3s ease ${i * 0.05}s` }} />
                  ))}
                </div>
                <span className="su-strength-label" style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            {error.password && <p className='su-err-msg'><span className="su-err-dot">●</span> {error.password}</p>}
          </div>
          <button className={`su-btn ${loading ? 'su-btn-loading' : ''}`} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="su-spinner"></span> : (
              <><span>Create Account</span>
                <svg className="su-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" /></svg></>
            )}
          </button>
        </div>
        <div className='su-footer'>
          <p>Already have an account?<span onClick={() => nav("/login")} className='su-link'> Sign in</span></p>
        </div>
      </div>
    </div>
  )
}

export default SignUp