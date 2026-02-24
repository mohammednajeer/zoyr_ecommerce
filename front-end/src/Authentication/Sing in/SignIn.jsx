import './SignIn.css'
import usericon from '../../assets/profile.png'
import passwordicon from '../../assets/padlock.png'
import logo from '../../assets/Screenshot 2025-09-21 153022.png'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify';
import api from "../../api/api"

function SignIn() {
  const [user, setuser] = useState("")
  const [password, setpassword] = useState("")
  let [error, setError] = useState({})
  let nav = useNavigate()

//    useEffect(() => {
//   const token = localStorage.getItem("access");
//   if (token) {
//     nav("/", { replace: true });
//   }
// }, [nav]);

  async function handleSubmit() {
  let newError = {}
  if (user.trim() === "") newError.name = "Please enter the name"
  if (password.trim() === "") newError.password = "Please enter the password"

  if (Object.keys(newError).length === 0) {
    try {
      
      let res = await api.post("login/",{
        username:user,
        password: password
      });

      let profile = await api.get("profile/");
      localStorage.setItem("user",JSON.stringify(profile.data))
      if(profile.data.role == "admin"){
        nav("/dashboard");
      }
      else{
        toast.dark("login success");
        nav("/");
      }
      
      // let res = await axios.get(
      //   `http://localhost:4000/Users?username=${user}&password=${password}`
      // );

      // if (res.data.length === 0) {
      //   toast.error("Invalid username or password ");
      //   return;
      // }

      // const loggedUser = res.data[0];

      // if (loggedUser.status === "block") {
      //   toast.error("You have been blocked by admin ");
      //   return;
      // }

      // localStorage.setItem("loggedInUser", JSON.stringify(loggedUser));

      // if (loggedUser.role === "admin") {
      //   toast.dark("Welcome Admin");
      //   nav("/dashboard", { replace: true });
      // } else {
      //   toast.dark("Login success");
      //   nav("/", { replace: true });
      // }

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Server error, try again later");
    }
  }

  setError(newError);
}


  return (
    <div className='maind'>
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>
      <div className='container'>
        <div className="header">
          <div className="text">Sign In</div>
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
            <button className='submit' onClick={handleSubmit}>Sign In</button>
          </div>

          <div className='guidtosign'>
            <p>Don't have an account?  
              <span onClick={() => nav("/signup")} className='navigateLink'> SignUp here</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
