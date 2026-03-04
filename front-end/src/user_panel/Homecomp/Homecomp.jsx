import React, { useEffect, useState } from 'react';
import picture1  from '../../assets/black-porsche-911-in-motion-b2-3200x2000.jpg';
import './Home.css';
import NavBar     from '../../component/NavBar.jsx';
import { useNavigate } from 'react-router-dom';
import { toast }  from 'react-toastify';
import aboutimg1  from '../../assets/aston-martin-showroom-hd-wallpaper-preview.jpg';
import aboutimg2  from '../../assets/kenjiro-yagi-RVEdgp-dkYY-unsplash.jpg';
import Facebook   from '../../assets/facebook.png';
import Instagram  from '../../assets/instagram (1).png';
import LinkedinIn from '../../assets/linkedin (1).png';
import Twitter    from '../../assets/twitter.png';
import api        from '../../api/api.js';
import { reserveProduct } from '../../api/api.js';
import { useLocation } from 'react-router-dom';
const MARQUEE_ITEMS = [
  'Luxury','✦','Performance','✦','Prestige','✦',
  'Speed', '✦','Excellence', '✦','Precision','✦',
  'Luxury','✦','Performance','✦','Prestige','✦',
  'Speed', '✦','Excellence', '✦','Precision','✦',
];

const STATS = [
  { label: 'Vehicles',  sublabel: 'In collection',   value: '200+', barWidth: '80%'  },
  { label: 'Brands',    sublabel: 'Luxury marques',  value: '40+',  barWidth: '55%'  },
  { label: 'Inspected', sublabel: 'Quality assured', value: '100%', barWidth: '100%' },
];

function Home() {
  const [data, setdata] = useState([]);
  const nav = useNavigate();
const location = useLocation()
  useEffect(() => {
    api.get("profile/")
       .then(res => { if (res.data.role === "admin") nav("/dashboard"); })
       .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("products/?limit=3&ordering=-year")
       .then(res => setdata(res.data))
       .catch(err => console.error(err));
  }, []);

  async function handleAdd(id) {
    try {
      await reserveProduct(id);
      toast.success("Vehicle reserved successfully");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.warning("Please login first");
        nav("/login", { state: { from: location.pathname } });
      } else {
        toast.error("Failed to reserve vehicle");
      }
    }
  }

  return (
    <>
      <NavBar color={true} />

      {/* ══ HERO ══════════════════════════════════════ */}
      <div className="carousel">
        {/* Layers */}
        <div className="home-grid" style={{ zIndex: 3 }} />
        <div className="carousel-vignette" />
        <div className="carousel-grain" />

        {/* Corner brackets */}
        <div className="hero-bracket hero-bracket-tl" />
        <div className="hero-bracket hero-bracket-br" />

        <img className="carimg" src={picture1} alt="Luxury vehicle" />

        <div className="hero-content">

          {/* Left */}
          <div className="hero-left">
            <span className="hero-kicker">Premium Pre-Owned Collection</span>

            <div className="hero-h1-wrap"><span className="hero-h1-line">WHERE</span></div>
            <div className="hero-h1-wrap"><span className="hero-h1-line">LUXURY</span></div>
            <div className="hero-h1-wrap"><span className="hero-h1-line">MEETS INSANITY</span></div>

            <p className="hero-sub">
              Step into the world of premium pre-owned vehicles. Every car in our
              collection is meticulously selected for performance, style, and pure
              driving pleasure.
            </p>

            <div className="hero-btns">
              <button className="product-btn" onClick={() => nav('/product')}>
                Explore Collection
              </button>
              <button
                className="hero-btn-ghost"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Our Story
              </button>
            </div>
          </div>

          {/* Right — redesigned stats card */}
          <div className="Porschedetails">
            <div className="details-header">
              <span>Collection Highlights</span>
              <div className="details-live">
                <div className="details-live-dot" />
                Live
              </div>
            </div>

            {STATS.map((s) => (
              <div className="stat-row" key={s.label}>
                <div className="stat-left">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-sublabel">{s.sublabel}</span>
                </div>
                <div className="stat-right">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-bar-wrap">
                    <div className="stat-bar-fill" style={{ width: s.barWidth }} />
                  </div>
                </div>
              </div>
            ))}

            <button className="explore-cta" onClick={() => nav('/product')}>
              <div className="explore-cta-text">
                <span className="explore-cta-label">View All Vehicles</span>
                <span className="explore-cta-sub">Browse full inventory</span>
              </div>
              <div className="explore-arrow-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

        </div>

        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </div>

      {/* ══ MARQUEE ═══════════════════════════════════ */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className={item === '✦' ? 'marquee-dot' : ''}>{item}</span>
          ))}
        </div>
      </div>

      {/* ══ PRODUCTS ══════════════════════════════════ */}
      <section className="showproduct">
        <div className="home-orb-layer">
          <div className="home-orb home-orb-a" />
          <div className="home-orb home-orb-b" />
          <div className="home-orb home-orb-c" />
        </div>
        <div className="home-grid" />

        <div className="tittleofcars">
          <div />
          <div className="title-inner">
            <span className="title-eyebrow">Curated Selection</span>
            <h2>Special Offer Vehicles</h2>
          </div>
          <div />
        </div>

        <div className="carsections">
          {data.map((dt) => (
            <div key={dt.id} className="prd-cards">
              <div className="prdimg-div">
                <img className="prdimg" src={dt.image?.url || dt.image} alt={dt.model} />
                <div className="prd-year-tag">{dt.year}</div>
              </div>
              <div className="prdcard-details">
                <div className="btn--secion">
                  <span className="prd-btn">${Number(dt.price).toLocaleString()}</span>
                  <h5>{dt.brand}</h5>
                </div>
                <div className="car-model-text">
                  <span>{dt.model}</span>
                </div>
                <div className="car-details">
                  <div className="dt-cntr">
                    <div className="detail-sections">
                      <div><p>REG.</p><p>YEAR</p></div>
                      <h6>{dt.year}</h6>
                    </div>
                    <div className="detail-sections">
                      <div><p>FUEL</p><p>TYPE</p></div>
                      <h6>{dt.fuel}</h6>
                    </div>
                    <div className="detail-sections">
                      <div><p>KMS</p><p>COVER</p></div>
                      <h6>{dt.kmCover}</h6>
                    </div>
                  </div>
                  <button className="AddBtn1" onClick={() => handleAdd(dt.id)}>
                    Reserve 
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ ABOUT ══════════════════════════════════ */}
        <div id="about" className="abt">
          <div className="home-orb-layer">
            <div className="home-orb home-orb-b" style={{ opacity: 0.07 }} />
            <div className="home-orb home-orb-c" />
          </div>
          <div className="home-grid" />

          <div className="abt-bx">
            <div className="abt-img"><img src={aboutimg2} alt="ZOYR showroom" /></div>
            <div className="abt-ptag">
              <span className="abt-eyebrow">Our Mission</span>
              <h2 className="abt-heading">Passionate about <em>exceptional</em> machines</h2>
              <p>
                At ZOYR, we curate only the finest pre-owned vehicles — from iconic
                Porsches to rare collector pieces. Every car is rigorously inspected
                and hand-selected for authenticity, performance, and roadworthiness.
                We don't just sell cars; we match drivers with their perfect machine.
              </p>
              <div className="abt-stat-row">
                <div className="abt-stat"><span className="abt-stat-num">8+</span><span className="abt-stat-lbl">Years</span></div>
                <div className="abt-stat"><span className="abt-stat-num">1.2k</span><span className="abt-stat-lbl">Cars Sold</span></div>
                <div className="abt-stat"><span className="abt-stat-num">98%</span><span className="abt-stat-lbl">Satisfaction</span></div>
              </div>
            </div>
          </div>

          <div className="abt-bx">
            <div className="abt-ptag">
              <span className="abt-eyebrow">The Experience</span>
              <h2 className="abt-heading">More than a purchase — <em>an adventure</em></h2>
              <p>
                Beyond selling cars, we offer personalized guidance and expert
                consultation at every step. From selecting the right model to
                arranging nationwide delivery, our team ensures your journey to
                ownership is as thrilling as the drive itself.
              </p>
              <p>
                Join the growing ZOYR community and discover how we redefine
                pre-owned luxury. With us, every drive is an adventure waiting to unfold.
              </p>
            </div>
            <div className="abt-img"><img src={aboutimg1} alt="ZOYR collection" /></div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════ */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section about">
            <h3>ZOYR</h3>
            <p>Where luxury meets insanity. Discover premium pre-owned cars, expert guidance, and an unforgettable driving experience.</p>
          </div>
          <div className="footer-section links">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => nav('/')}>Home</li>
              <li onClick={() => nav('/product')}>Cars</li>
              <li>Rims</li>
              <li onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</li>
              <li onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</li>
            </ul>
          </div>
          <div id="contact" className="footer-section contact">
            <h4>Contact Us</h4>
            <p>📧 support@zoyr.com</p>
            <p>📞 +91 12345 67890</p>
            <p>📍 28th Street, California, United States</p>
            <div className="social-icons">
              <img src={Facebook}   alt="Facebook" />
              <img src={Instagram}  alt="Instagram" />
              <img src={Twitter}    alt="Twitter" />
              <img src={LinkedinIn} alt="LinkedIn" />
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2025 ZOYR. All rights reserved.</span>
          <span>Premium Pre-Owned Vehicles</span>
        </div>
      </footer>
    </>
  );
}

export default Home;