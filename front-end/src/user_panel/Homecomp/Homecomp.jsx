import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { reserveProduct } from '../../api/api.js';
import NavBar from '../../component/NavBar.jsx';
import LoadingScreen from './LoadingScreen.jsx';

// Import local assets
import picture1 from '../../assets/black-porsche-911-in-motion-b2-3200x2000.jpg';
import aboutimg1 from '../../assets/aston-martin-showroom-hd-wallpaper-preview.jpg';
import aboutimg2 from '../../assets/kenjiro-yagi-RVEdgp-dkYY-unsplash.jpg';
import bentleyImg from '../../assets/6818be000bfa22b33491a13e_Bentley2029-Hero_image-001.webp';

// Socials
import Facebook from '../../assets/facebook.png';
import Instagram from '../../assets/instagram (1).png';
import LinkedinIn from '../../assets/linkedin (1).png';
import Twitter from '../../assets/twitter.png';

import './Home.css';

const FALLBACK_SLIDES = [
  { id: 'fb1', image: picture1, brand: 'PORSCHE', model: '911 Carrera', price: 280, year: 2022, fuel: 'Petrol', kmCover: 12000 },
  { id: 'fb2', image: aboutimg1, brand: 'ASTON MARTIN', model: 'Vantage V8', price: 350, year: 2023, fuel: 'Petrol', kmCover: 8000 },
  { id: 'fb3', image: aboutimg2, brand: 'MERCEDES AMG', model: 'GT R Coupe', price: 400, year: 2021, fuel: 'Petrol', kmCover: 15000 }
];

const BLOG_POSTS = [
  {
    id: 1,
    image: picture1,
    date: '05.09.2025',
    title: 'Experience the Raw Thrills of Pre-Owned Performance',
    desc: 'How modern luxury sports cars retain their mechanical excellence and driving dynamics.'
  },
  {
    id: 2,
    image: aboutimg2,
    date: '20.10.2025',
    title: 'The Art of Selection: Meticulous Inspection Standards',
    desc: 'Behind the scenes of our rigorous testing protocols for every curated vehicle.'
  },
  {
    id: 3,
    image: aboutimg1,
    date: '18.11.2025',
    title: 'Why Vintage and Pre-Owned is the New Sustainable Luxury',
    desc: 'Exploring the shift toward premium collection ownership and circular elegance.'
  }
];

function Home() {
  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(
    () => sessionStorage.getItem('zoyr_loaded') === 'true'
  );
  
  const [slideIndex, setSlideIndex] = useState(0);
  const [bookingTab, setBookingTab] = useState('hourly'); // 'distance' or 'hourly'
  const vehiclesRef = useRef(null);

  const nav = useNavigate();
  const location = useLocation();

  // Booking Form States
  const [pickupAddr, setPickupAddr] = useState('');
  const [dropoffAddr, setDropoffAddr] = useState('');
  const [pickupDate, setPickupDate] = useState('2026-06-26');
  const [pickupTime, setPickupTime] = useState('12:00');

  useEffect(() => {
    api.get('profile/')
       .then(res => { if (res.data.role === 'admin') nav('/dashboard'); })
       .catch(() => {});
  }, [nav]);

  useEffect(() => {
    api.get('products/?limit=10&ordering=-year')
       .then(res => setData(res.data))
       .catch(err => console.error(err));
  }, []);

  function handleLoaderDone() {
    sessionStorage.setItem('zoyr_loaded', 'true');
    setLoaded(true);
  }

  async function handleAdd(id) {
    try {
      await reserveProduct(id);
      toast.success('Vehicle reserved successfully');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.warning('Please login first');
        nav('/login', { state: { from: location.pathname } });
      } else {
        toast.error('Failed to reserve vehicle');
      }
    }
  }

  const slides = data.length > 0 ? data.slice(0, 4) : FALLBACK_SLIDES;
  const vehicles = data.length > 0 ? data : FALLBACK_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!pickupAddr) {
      toast.warning('Please enter a pickup address');
      return;
    }
    toast.success(`Checking availability for ${pickupAddr}...`);
    nav('/product');
  };

  const scrollVehicles = (direction) => {
    if (vehiclesRef.current) {
      const scrollAmount = 360;
      vehiclesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const activeSlide = slides[slideIndex] || FALLBACK_SLIDES[0];

  return (
    <>
      {!loaded && <LoadingScreen onDone={handleLoaderDone} />}

      {/* ══ NAV ══ */}
      <NavBar color={true} />

      {/* ══ HERO SECTION ══ */}
      <section className="hero">
        <div className="hero-slideshow">
          {slides.map((slide, i) => {
            const isActive = i === slideIndex;
            const imgSrc = slide.image?.url || slide.image;
            return (
              <div
                key={slide.id || i}
                className={`hero-slide ${isActive ? 'active' : ''}`}
                style={{ backgroundImage: `url(${imgSrc})` }}
              />
            );
          })}
        </div>
        
        {/* Dark elegant forest overlay */}
        <div className="hero-overlay" />

        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              Luxury car<br />collection in Italy
            </h1>
            <button className="btn-peach" onClick={() => nav('/product')}>
              Rent Now
            </button>
          </div>

          {/* Floating Right Price Card */}
          <div className="hero-right">
            <div className="floating-car-card">
              <div className="card-top">
                <span className="card-price">${activeSlide.price}/day</span>
                <button className="plus-btn" onClick={() => handleAdd(activeSlide.id)}>
                  +
                </button>
              </div>
              <img
                src={activeSlide.image?.url || activeSlide.image}
                alt={activeSlide.model}
                className="floating-car-img"
              />
            </div>
            
            <p className="hero-desc">
              Experience the pinnacle of Italian driving dynamics. Meticulously inspected,
              expertly detailed luxury vehicles for those who demand absolute distinction.
            </p>
          </div>
        </div>

        {/* Floating Booking Overlap Panel */}
        <div className="booking-overlap-panel">
          <form onSubmit={handleBookingSubmit} className="booking-form">
            <div className="booking-tabs">
              <button
                type="button"
                className={`booking-tab ${bookingTab === 'distance' ? 'active' : ''}`}
                onClick={() => setBookingTab('distance')}
              >
                Distance
              </button>
              <button
                type="button"
                className={`booking-tab ${bookingTab === 'hourly' ? 'active' : ''}`}
                onClick={() => setBookingTab('hourly')}
              >
                Hourly
              </button>
            </div>

            <div className="booking-fields">
              <div className="booking-field">
                <label>Pick Up Address</label>
                <input
                  type="text"
                  placeholder="From address, airport, hotel..."
                  value={pickupAddr}
                  onChange={(e) => setPickupAddr(e.target.value)}
                />
              </div>

              <div className="booking-field">
                <label>Drop Off Address</label>
                <input
                  type="text"
                  placeholder="Distance, Hourly, Flat Rate"
                  value={dropoffAddr}
                  onChange={(e) => setDropoffAddr(e.target.value)}
                />
              </div>

              <div className="booking-field">
                <label>Pick Up Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <div className="booking-field">
                <label>Pick Up Time</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>

              <button type="submit" className="booking-submit-btn">
                <span>Book now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ══ ABOUT US SECTION ══ */}
      <section className="about-us-section" id="about">
        <div className="about-us-container">
          <div className="about-us-text">
            <h2 className="section-title-syne">About Us</h2>
            <p className="about-p">
              We curate only the finest pre-owned performance vehicles and luxury imports.
              Every machine is hand-selected, verified, and detailed to offer a brand-new
              ownership and driving feel.
            </p>
            <p className="about-p secondary">
              From iconic supercars to prestigious cruisers, our mission is to match the most
              discerning drivers with vehicles that offer both excitement and enduring value.
            </p>
          </div>

          <div className="about-us-grid">
            <div className="grid-left-col">
              <img src={aboutimg2} alt="Green Luxury Car" className="about-img-vertical" />
            </div>
            
            <div className="grid-right-col">
              <div className="experience-card">
                <span className="exp-number">+10 years</span>
                <span className="exp-lbl">Experience</span>
              </div>
              <img src={aboutimg1} alt="Car Showroom" className="about-img-horizontal" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ BEST OFFER SECTION ══ */}
      <section className="best-offer-section">
        <div className="best-offer-banner">
          <div className="best-offer-green">
            <span className="offer-eyebrow">Best offer</span>
            <h3 className="offer-title">Bentley Flying Spur</h3>
            <span className="offer-price">for $400/day</span>
            <button className="btn-peach" onClick={() => nav('/product')}>
              Rent Here
            </button>
          </div>
          
          <div className="best-offer-cream">
            <img src={bentleyImg} alt="Bentley Flying Spur" className="best-offer-img" />
          </div>
        </div>
      </section>

      {/* ══ VEHICLES SECTION ══ */}
      <section className="vehicles-section" id="collection">
        <div className="vehicles-header">
          <div className="vehicles-header-left">
            <h2 className="section-title-syne">Vehicles</h2>
            <p className="vehicles-header-desc">
              Explore our special fleet of premium imports and exotic performance models ready for reservation.
            </p>
          </div>
          
          <div className="vehicles-arrows">
            <button className="arrow-btn" onClick={() => scrollVehicles('left')} aria-label="Previous">
              ←
            </button>
            <button className="arrow-btn" onClick={() => scrollVehicles('right')} aria-label="Next">
              →
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div className="vehicles-carousel-container" ref={vehiclesRef}>
          {vehicles.map((car) => {
            const imgSrc = car.image?.url || car.image;
            return (
              <div key={car.id} className="vehicle-card" onClick={() => nav(`/product`)}>
                <div className="vehicle-card-info">
                  <h4>{car.brand} {car.model}</h4>
                  <span className="vehicle-card-price">${car.price}/day</span>
                </div>
                <div className="vehicle-card-img-wrap">
                  <img src={imgSrc} alt={car.model} className="vehicle-card-img" />
                </div>
                <button className="vehicle-arrow-link" onClick={(e) => {
                  e.stopPropagation();
                  handleAdd(car.id);
                }}>
                  →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ BLOG SECTION ══ */}
      <section className="blog-section">
        <h2 className="section-title-syne">Blog</h2>
        <p className="blog-section-desc">Keep up to date with the latest automotive news, guides, and trends.</p>

        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <div key={post.id} className="blog-card">
              <div className="blog-img-wrap">
                <img src={post.image} alt={post.title} className="blog-card-img" />
                <span className="blog-date">{post.date}</span>
              </div>
              <h4 className="blog-card-title">{post.title}</h4>
              <p className="blog-card-desc">{post.desc}</p>
              <div className="blog-card-footer">
                <span onClick={() => nav('/product')} className="blog-read-link">Read full article</span>
                <span className="blog-arrow">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NEWSLETTER SUBSCRIBE SECTION ══ */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Subscribe and get 20% off<br />your first rental.</h2>
          <form className="newsletter-form" onSubmit={(e) => {
            e.preventDefault();
            toast.success('Thank you for subscribing!');
          }}>
            <input type="email" placeholder="name@email.com" required className="newsletter-input" />
            <button type="submit" className="newsletter-btn">Submit</button>
          </form>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer" id="contact">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-logo-syne">ZOYR</div>
            <p className="footer-addr">
              Via Colombarola 7a<br />
              Sassuolo, Modena MO, 41049<br />
              Italy
            </p>
            <div className="footer-social-icons">
              <img src={Facebook} alt="Facebook" className="social-icon" />
              <img src={Instagram} alt="Instagram" className="social-icon" />
              <img src={Twitter} alt="Twitter" className="social-icon" />
              <img src={LinkedinIn} alt="LinkedIn" className="social-icon" />
            </div>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-hdr">For Renters</h5>
            <ul>
              <li onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About Us</li>
              <li onClick={() => nav('/product')}>Our Fleet</li>
              <li>How it works</li>
              <li>FAQs</li>
              <li onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-hdr">Resources</h5>
            <ul>
              <li>Media & Blog</li>
              <li>Partners</li>
              <li>Privacy Policy</li>
              <li>Cookies Policy</li>
              <li>Legal Info</li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h5 className="footer-col-hdr">Contact Us</h5>
            <p className="contact-hours">Monday – Sunday<br />9:00 AM – 9:00 PM (CET)</p>
            <p className="contact-phone">Hotline:<br />111-909-2271</p>
            <p className="contact-email">Email:<br />contact@zoyr.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 ZOYR, LLC. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}

export default Home;