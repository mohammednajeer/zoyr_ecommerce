import './SignUp.css'
import mail from '../../assets/mail.png'
import usericon from '../../assets/profile.png'
import passwordicon from '../../assets/padlock.png'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import api from "../../api/api"


function SignUp() {
  let nav = useNavigate()
  const [user, setuser] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  let [error, setError] = useState({})

  async function handleSubmit() {
    let newError = {}

   
    const trimmedUser = user.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (trimmedUser === "") newError.name = "Please enter the name"
    if (trimmedEmail === "") newError.email = "Please enter the Email"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      newError.email = "Please enter a valid email"
    if (trimmedPassword === "") newError.password = "Please enter the password"

    if (Object.keys(newError).length === 0) {
      try {

        await api.post("register/",{
          username: trimmedUser,
          email: trimmedEmail,
          password: trimmedPassword
        })
        const username = res.data.username || trimmedUser
        nav("/verify-otp", { state: { email: trimmedEmail, username: username } })
      } catch (err) {
        console.log("FULL ERROR:", err.response?.data);
        toast.error(err.response?.data?.error || "Something went wrong");
      }
    }

    setError(newError)
  }

  return (
    <div className='maind'>
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>
      <div className='container'>
        <div className="header">
          <div className="text">Sign Up</div>
          <div className='underline'></div>
        </div>

        <div className="inputs">
         
          <div className="input">
            <img src={usericon} alt="User icon" />
            <input
              type="text"
              placeholder="Username"
              value={user}
              onChange={(e) => setuser(e.target.value)}
            />
          </div>
          {error.name && <p className='errortext'>{error.name}</p>}

          
          <div className="input">
            <img src={mail} alt="Email icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setemail(e.target.value)}
            />
          </div>
          {error.email && <p className='errortext'>{error.email}</p>}

          
          <div className="input">
            <img src={passwordicon} alt="Password icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setpassword(e.target.value)}
            />
          </div>
          {error.password && <p className='errortext'>{error.password}</p>}

          <div className='submit-container'>
            <button className='submit' onClick={handleSubmit}>Sign Up</button>
          </div>

          <div className='guidtosign'>
            <p>Already have an account?
              <span onClick={() => nav("/login")} className='navigateLink'> LogIn here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
