import React, { useEffect, useState } from 'react';
import logo from '../assets/logoblack.png';
import logowhite from '../assets/Screenshot 2025-09-21 153022.png';
import heart from "../assets/heart (1).png";
import cartimg from "../assets/online-shopping.png";
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function NavBar(props) {
  let nav = useNavigate();
  const [loggedUser, setLoggedUser] = useState(null);
  const [cartdata, setcartdata] = useState(0);

  
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setLoggedUser(JSON.parse(storedUser));
    }
  }, []);

  
  useEffect(() => {
    if (!loggedUser) return;

    const fetchCartCount = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/Users/${loggedUser.id}`);
        const userData = res.data;
        const totalQuantity = userData.cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setcartdata(totalQuantity);
      } catch (err) {
        console.error("Error fetching cart data:", err);
      }
    };

    fetchCartCount(); 

   
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [loggedUser]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setLoggedUser(null);
    toast.dark("Logged out");
  };

  const handleUserOption = (e) => {
    const value = e.target.value;
    if (value === "orders") nav("/previousOrder");
    if (value === "logout") handleLogout();
  };

  const scrollToAbout = (inp) => {
    const aboutSection = document.getElementById("about");
    const contactSection = document.getElementById("contact");
    if (inp === "abt") aboutSection.scrollIntoView({ behavior: "smooth" });
    if (inp === "cnt") contactSection.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className='navbar'>
      <div className='leftside'>
        <ul>
          <li onClick={() => nav("/product")}>Cars</li>
          <li onClick={() => scrollToAbout("abt")}>About</li>
          <li onClick={() => scrollToAbout("cnt")}>Contact</li>
        </ul>
      </div>

      <div onClick={() => nav("/")} className='logocont'>
        <img src={props.color ? logo : logowhite} alt="Logo" />
      </div>

      <div className='rightside'>
        <ul>
          <li>
            <img className='navimgs' onClick={() => nav('/wishlist')} src={heart} alt="" />
          </li>
          <li>
            <div className='cartdiv'>
              <img className='navimgs' onClick={() => nav("/cart")} src={cartimg} alt="" />
              {cartdata > 0 && <span className="cart-count">{cartdata}</span>}
            </div>
          </li>
          <li>
            {loggedUser ? (
              <select className="user-select" onChange={handleUserOption} defaultValue="username">
                <option value="username" disabled>{loggedUser.username}</option>
                <option value="profile">Profile</option>
                <option value="orders">Previous Orders</option>
                <option value="logout">Logout</option>
              </select>
            ) : (
              <span onClick={() => nav("/login")}>Login/Signup</span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
