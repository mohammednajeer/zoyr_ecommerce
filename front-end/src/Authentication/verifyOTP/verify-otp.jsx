import './verify-otp.css'
import { useState, useRef, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../../api/api"
import { toast } from "react-toastify"

function VerifyOTP() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputsRef = useRef([])
  const location = useLocation()
  const nav = useNavigate()

  const email = location.state?.email
  const username = location.state?.username

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await api.get("profile/")
        nav(res.data.role === "admin" ? "/dashboard" : "/", { replace: true })
      } catch {}
    }
    checkLogin()
  }, [])

  /* Countdown timer for resend */
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function handleDigitChange(i, val) {
    const char = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)
    if (char && i < 5) inputsRef.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
    if (e.key === "Enter") handleVerify()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pasted) return
    const next = [...digits]
    pasted.split("").forEach((ch, i) => { if (i < 6) next[i] = ch })
    setDigits(next)
    const lastFilled = Math.min(pasted.length, 5)
    inputsRef.current[lastFilled]?.focus()
  }

  async function handleVerify() {
    const otp = digits.join("")
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code")
      return
    }
    setLoading(true)
    try {
      await api.post("verify-otp/", { email, otp, username })
      toast.success("Email verified successfully!")
      nav("/login")
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed")
      setDigits(["", "", "", "", "", ""])
      inputsRef.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (countdown > 0) return
    setResending(true)
    try {
      await api.post("resend-otp/", { email })
      toast.success("New code sent!")
      setCountdown(60)
      setDigits(["", "", "", "", "", ""])
      inputsRef.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to resend")
    } finally {
      setResending(false)
    }
  }

  const filled = digits.filter(Boolean).length

  return (
    <div className="auth-root">
      <div className="auth-bg">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="auth-card otp-card">
        <div className="card-accent-line"></div>

        {/* Icon */}
        <div className="otp-icon-wrap">
          <div className="otp-icon-ring">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="otp-icon">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Verify Email</h1>
          <p className="auth-subtitle">
            We sent a 6-digit code to
          </p>
          <p className="otp-email">{email}</p>
        </div>

        {/* OTP Inputs */}
        <div className="otp-inputs" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => inputsRef.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`otp-digit ${d ? 'otp-digit-filled' : ''}`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Progress indicator */}
        <div className="otp-progress">
          <div
            className="otp-progress-fill"
            style={{ width: `${(filled / 6) * 100}%` }}
          ></div>
        </div>

        <button
          className={`auth-btn ${loading ? 'auth-btn-loading' : ''} ${filled < 6 ? 'auth-btn-disabled' : ''}`}
          onClick={handleVerify}
          disabled={loading || filled < 6}
        >
          {loading ? (
            <span className="btn-spinner"></span>
          ) : (
            <>
              <span>Verify & Continue</span>
              <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Resend */}
        <div className="otp-resend">
          <p>Didn't receive it?{" "}
            <button
              className={`resend-btn ${countdown > 0 ? 'resend-disabled' : ''}`}
              onClick={handleResend}
              disabled={resending || countdown > 0}
            >
              {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
            </button>
          </p>
        </div>

        <div className="auth-footer">
          <p>
            <span onClick={() => nav("/login")} className='auth-link'>← Back to sign in</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP