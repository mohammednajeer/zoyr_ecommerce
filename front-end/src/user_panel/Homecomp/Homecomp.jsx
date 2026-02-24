import React, { useEffect, useState } from 'react';
import picture1 from '../../assets/black-porsche-911-in-motion-b2-3200x2000.jpg';
import './Home.css';
import NavBar from '../../component/NavBar.jsx';
import mustang from "../../assets/DSC04289-1-scaled.jpeg"
import bmwprd from  "../../assets/DSC05990-scaled.jpeg"
import rangerover from  "../../assets/DSC02129-scaled.jpg";
import { href, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import aboutimg1 from '../../assets/aston-martin-showroom-hd-wallpaper-preview.jpg'
import aboutimg2 from '../../assets/kenjiro-yagi-RVEdgp-dkYY-unsplash.jpg'
import Facebook from '../../assets/facebook.png'
import Instagram from '../../assets/instagram (1).png'
import LinkedinIn from '../../assets/linkedin (1).png'
import Twitter from '../../assets/twitter.png'



function Home() {

  const [data, setdata] = useState([])
  const nav = useNavigate()
    const vuser = localStorage.getItem('loggedInUser');
  const conv = vuser ? JSON.parse(vuser) : null;
  const role = conv?.role;
  useEffect(()=>{
     if(role==="admin"){
      nav("/dashboard")
     }
  },[])
  useEffect(() => {
    axios.get("http://localhost:4000/Products")
      .then(res => setdata(res.data))
  }, [])

async function handleAdd(id) {
 
  let user = localStorage.getItem("loggedInUser");

  if (!user) {
    alert("Please login first ");
    nav("/login");
    return;
  }

  user = JSON.parse(user); 

  try {
    
    let res = await axios.get(`http://localhost:4000/Users/${user.id}`);
    let userData = res.data;

   
    let updatedCart = userData.cart ? [...userData.cart] : [];
    const existingItem = updatedCart.find(item => item.productId === id);

    if (existingItem) {
      
      existingItem.quantity += 1;
    } else {
     
      updatedCart.push({ productId: id, quantity: 1 });
    }

   
    await axios.patch(`http://localhost:4000/Users/${user.id}`, { cart: updatedCart });

   
    const updatedUser = { ...user, cart: updatedCart };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("cartUpdated"));

    toast.dark("Item added to cart ");

  } catch (err) {
    console.error("Add to cart error:", err);
    
    toast.error("Error adding item ")
  }
  
}
  return (
    <>
    
      <NavBar color={true}/> 

      <div className="carousel">
        <img className='carimg' src={picture1} alt="Main Background" />
        <div className="hero-content">
         
          <h1>
            Where luxury meets <span>insanity</span>
          </h1>
          
          <div className='Porschedetails'>
            <h3>Experience Luxury, Performance, and Prestige</h3>
            <p>Step into the world of premium pre-owned cars, featuring iconic models like Porsche, Mustang, and more. Every car in our collection is carefully selected to deliver unparalleled performance, style, and driving pleasure – because your next ride deserves to be extraordinary.</p>
            <button onClick={()=>nav("/product")} className="product-btn">Explore Collection</button>
          </div>
          
        </div>
       
      </div>
      <section className='showproduct'>

        <div  className='tittleofcars'>
          <h2>Special Offer Cars</h2>
        </div>

<div className='carsections'>
  {data
    .sort((a, b) => Number(b.price) - Number(a.price)) // sort by price DESC
    .slice(0, 3) // take top 3
    .map(dt => (
      <div key={dt.id} className='prd-cards'>
        
        <div className='prdimg-div'>
          <img className='prdimg' src={dt.imgSource} alt={dt.model} />
        </div>

        <div className='prdcard-details'>
          <div className='btn--secion'>
            <button className='prd-btn'>{dt.price}</button>
            <h5>{dt.brand}</h5>
          </div>

          <div className='car-model-text'>
            <span>{dt.model}</span>
          </div>

          <div className="car-details">
            <div className='dt-cntr'>
              <div className="detail-sections">
                <div>
                  <p>REG.</p>
                  <p>YEAR</p>
                </div>
                <h6>{dt.year}</h6>
              </div>

              <div className="detail-sections">
                <div>
                  <p>FUEL</p>
                  <p>TYPE</p>
                </div>
                <h6>{dt.fuel}</h6>
              </div>

              <div className="detail-sections">
                <div>
                  <p>KMS</p>
                  <p>COVERED</p>
                </div>
                <h6>{dt.kmCover}</h6>
              </div>
            </div>

            <button onClick={() => handleAdd(dt.id)} className='AddBtn'>
              Add
            </button>
          </div>
        </div>

      </div>
    ))}
</div>

       <div id='about' className='abt'>

        <div className='abt-bx'>
          <div className='abt-img'><img src={aboutimg2} alt="" /></div>
          <div className='abt-ptag'><p>At ZOYR, we are passionate about delivering premium pre-owned cars to enthusiasts who value luxury, performance, and style. Our curated collection includes iconic brands like Porsche, Mustang, and Lamborghini, as well as rare collector models, all carefully selected and rigorously inspected for authenticity and roadworthiness.

Our mission is to provide a seamless and unforgettable buying experience — whether browsing our selection online, scheduling a personalized test drive, or arranging nationwide delivery. Founded by automotive experts, ZOYR ensures every client finds a car that matches their personality, taste, and passion for driving.</p></div>
        </div>

        <div className="abt-bx">
          <div className='abt-ptag'><p>Beyond selling cars, we are committed to offering personalized guidance and expert consultation. Whether it's choosing the right model, understanding performance specifications, or navigating financing options, our team is dedicated to helping you make informed decisions. With ZOYR, your dream car isn’t just a purchase — it’s an experience, one that combines exhilaration, prestige, and unmatched satisfaction.
            Join the growing community of ZOYR enthusiasts and discover how we redefine the world of pre-owned luxury cars. With us, luxury truly meets insanity, and every drive is an adventure waiting to unfold.</p></div>
          <div className='abt-img'><img src={aboutimg1} alt="" /></div>
        </div>
       
       </div>
      </section>
      <footer className="footer">
      <div className="footer-container">
       
        <div className="footer-section about">
          <h3>ZOYR</h3>
          <p>Where luxury meets insanity. Discover premium pre-owned cars, expert guidance, and an unforgettable driving experience.</p>
        </div>

        
        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>Cars</li>
            <li>Rims</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>

        
        <div id='contact' className="footer-section contact">
          <h4>Contact Us</h4>
          <p>Email: support@zoyr.com</p>
          <p>Phone: +91 12345 67890</p>
          <p>Address: S28th Street, califronia, United state of America</p>
          <div className="social-icons">
           <img src={Facebook} alt="" />
           <img src={Instagram} alt="" />
           <img src={Twitter} alt="" />
           <img src={LinkedinIn} alt="" />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; 2025 ZOYR. All rights reserved.
      </div>
    </footer>
    </>
  );
}

export default Home;
