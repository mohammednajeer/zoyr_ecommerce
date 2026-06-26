import React, { useEffect, useState } from 'react';
import logo from '../assets/logoblack.png';
import logowhite from '../assets/Screenshot 2025-09-21 153022.png';
import heart from "../assets/heart (1).png";
import cartimg from "../assets/online-shopping.png";
import car1 from '../assets/dollar.png'
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import api from '../api/api'
function NavBar(props) {
  let nav = useNavigate();
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {

    async function checkAuth(){

      try{

        // CALL BACKEND PROFILE ENDPOINT
        const res = await api.get("profile/", {
          withCredentials: true
        });

        setLoggedUser(res.data);

      }catch(err){

        // token expired OR not logged
        setLoggedUser(null);

      }

    }

    checkAuth();

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

const handleLogout = async () => {
  try {
    await api.post("logout/");
  } catch (err) {
    console.error("Logout error:", err);
  }
  nav("/login");
  toast.dark("Logged out");
};

  const handleUserOption = (e) => {
    const value = e.target.value;
    // if (value === "orders") nav("/previousOrder");
    if (value === "logout") handleLogout();
    if (value == "profile") nav("/profile");
  };

  const scrollToAbout = (inp) => {
    const aboutSection = document.getElementById("about");
    const contactSection = document.getElementById("contact");
    if (inp === "abt") aboutSection.scrollIntoView({ behavior: "smooth" });
    if (inp === "cnt") contactSection.scrollIntoView({ behavior: "smooth" });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`navbar ${scrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`}>
      {/* 3-Dot Mobile Toggle Button */}
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </button>

      <div className={`leftside ${isOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => { nav("/product"); setIsOpen(false); }}>Cars</li>
          <li onClick={() => { scrollToAbout("abt"); setIsOpen(false); }}>About</li>
          <li onClick={() => { scrollToAbout("cnt"); setIsOpen(false); }}>Contact</li>
        </ul>
      </div>

      <div onClick={() => { nav("/"); setIsOpen(false); }} className='logocont'>
        <img src={props.color ? logowhite : logowhite} alt="Logo" />
      </div>

      <div className={`rightside ${isOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <img className='navimgs' onClick={() => { nav('/wishlist'); setIsOpen(false); }} src={heart} alt="" />
          </li>
          <li>
            <div className='cartdiv'>
              <img className='navimgs' style={{height:"26px", width:"26px",}} onClick={() => { nav("/cart"); setIsOpen(false); }} src={car1} alt="" />
            </div>
          </li>
          <li>
            {loggedUser ? (
              <select className="user-select" onChange={handleUserOption} defaultValue="username">
                <option value="username" disabled>{loggedUser.username}</option>
                <option value="profile">Profile</option>
                <option value="logout">Logout</option>
              </select>
            ) : (
              <span onClick={() => { nav("/login"); setIsOpen(false); }}>Login/Signup</span>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li onClick={() => { nav("/product"); setIsOpen(false); }}>Cars</li>
          <li onClick={() => { scrollToAbout("abt"); setIsOpen(false); }}>About</li>
          <li onClick={() => { scrollToAbout("cnt"); setIsOpen(false); }}>Contact</li>
          <li onClick={() => { nav('/wishlist'); setIsOpen(false); }}>Wishlist</li>
          <li onClick={() => { nav('/cart'); setIsOpen(false); }}>Cart</li>
          <li>
            {loggedUser ? (
              <span onClick={() => { handleLogout(); setIsOpen(false); }} style={{color: "var(--peach, #eaa787)"}}>
                Logout ({loggedUser.username})
              </span>
            ) : (
              <span onClick={() => { nav("/login"); setIsOpen(false); }}>Login/Signup</span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
