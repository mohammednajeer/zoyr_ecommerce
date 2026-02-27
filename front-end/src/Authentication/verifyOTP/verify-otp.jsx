import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import api from "../../api/api"
import { toast } from "react-toastify"

function VerifyOTP() {

  const [otp, setOtp] = useState("")
  const location = useLocation()
  const nav = useNavigate()

  const email = location.state?.email
const username = location.state?.username  // ✅ get username from state

async function handleVerify(){
    if(!otp){
        toast.error("Enter OTP")
        return
    }
    try{
        await api.post("verify-otp/", {
            email,
            otp: otp.trim(),
            username  // ✅ send username
        })
        toast.success("Account verified successfully")
        nav("/login")
    }catch(err){
        toast.error(err.response?.data?.error || "Verification failed")
    }
}

  return (
    <div className="otp-container">
      <h2>Verify Your Email</h2>
      <p>OTP sent to {email}</p>

      <input
        type="text"
        placeholder="Enter 6 digit OTP"
        value={otp}
        onChange={(e)=>setOtp(e.target.value)}
      />

      <button onClick={handleVerify}>
        Verify
      </button>
    </div>
  )
}

export default VerifyOTP