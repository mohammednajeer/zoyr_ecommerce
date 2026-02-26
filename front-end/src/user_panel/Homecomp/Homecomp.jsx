import React, { useEffect, useState } from 'react';
import picture1    from '../../assets/black-porsche-911-in-motion-b2-3200x2000.jpg';
import './Home.css';
import NavBar       from '../../component/NavBar.jsx';
import { useNavigate } from 'react-router-dom';
import axios        from 'axios';
import { toast }    from 'react-toastify';
import aboutimg1    from '../../assets/aston-martin-showroom-hd-wallpaper-preview.jpg';
import aboutimg2    from '../../assets/kenjiro-yagi-RVEdgp-dkYY-unsplash.jpg';
import Facebook     from '../../assets/facebook.png';
import Instagram    from '../../assets/instagram (1).png';
import LinkedinIn   from '../../assets/linkedin (1).png';
import Twitter      from '../../assets/twitter.png';

const MARQUEE_ITEMS = [
  'Luxury','✦','Performance','✦','Prestige','✦',
  'Speed', '✦','Excellence', '✦','Precision','✦',
  'Luxury','✦','Performance','✦','Prestige','✦',
  'Speed', '✦','Excellence', '✦','Precision','✦',
];

function Home() {
  const [data, setdata] = useState([]);
  const nav = useNavigate();

  const vuser = localStorage.getItem('loggedInUser');
  const conv  = vuser ? JSON.parse(vuser) : null;
  const role  = conv?.role;

  useEffect(() => { if (role === 'admin') nav('/dashboard'); }, []);

  useEffect(() => {
    axios.get('http://localhost:4000/Products').then(res => setdata(res.data));
  }, []);

  async function handleAdd(id) {
    let user = localStorage.getItem('loggedInUser');
    if (!user) { alert('Please login first'); nav('/login'); return; }
    user = JSON.parse(user);
    try {
      const res  = await axios.get(`http://localhost:4000/Users/${user.id}`);
      const cart = res.data.cart ? [...res.data.cart] : [];
      const ex   = cart.find(i => i.productId === id);
      if (ex) ex.quantity += 1;
      else cart.push({ productId: id, quantity: 1 });
      await axios.patch(`http://localhost:4000/Users/${user.id}`, { cart });
      localStorage.setItem('loggedInUser', JSON.stringify({ ...user, cart }));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.dark('Vehicle added to reservations');
    } catch (err) {
      console.error(err);
      toast.error('Error adding vehicle');
    }
  }

  return (
    <>
      <NavBar color={true} />

      {/* ══ HERO ══════════════════════════════════════ */}
      <div className="carousel">
        <img className="carimg" src={picture1} alt="Luxury vehicle" />

        <div className="hero-content">

          {/* Left — headline */}
          <div className="hero-left">
            <span className="hero-kicker">Premium Pre-Owned Collection</span>

            <div className="hero-h1-wrap">
              <span className="hero-h1-line">WHERE</span>
            </div>
            <div className="hero-h1-wrap">
              <span className="hero-h1-line">LUXURY</span>
            </div>
            <div className="hero-h1-wrap">
              <span className="hero-h1-line">MEETS INSANITY</span>
            </div>

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

          {/* Right — stats card */}
          <div className="Porschedetails">
            <div className="details-header">
              <span>Collection Highlights</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">Vehicles</span>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-value">200+</div>
                <div className="stat-desc">Premium models</div>
              </div>
            </div>

            <div className="stat-row">
              <span className="stat-label">Brands</span>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-value">40+</div>
                <div className="stat-desc">Luxury marques</div>
              </div>
            </div>

            <div className="stat-row">
              <span className="stat-label">Inspected</span>
              <div style={{ textAlign: 'right' }}>
                <div className="stat-value">100%</div>
                <div className="stat-desc">Every vehicle</div>
              </div>
            </div>

            <button className="explore-cta" onClick={() => nav('/product')}>
              <span>View All Vehicles</span>
              <span className="explore-arrow" />
            </button>
          </div>

        </div>

        {/* Scroll indicator */}
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

        <div className="tittleofcars">
          <div />
          <div className="title-inner">
            <span className="title-eyebrow">Curated Selection</span>
            <h2>Special Offer Vehicles</h2>
          </div>
          <div />
        </div>

        <div className="carsections">
          {data
            .sort((a, b) => Number(b.price) - Number(a.price))
            .slice(0, 3)
            .map((dt, i) => (
              <div key={dt.id} className="prd-cards">
                <div className="prdimg-div">
                  <img className="prdimg" src={dt.imgSource} alt={dt.model} />
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
                      Reserve Vehicle
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* ══ ABOUT ══════════════════════════════════ */}
        <div id="about" className="abt">

          <div className="abt-bx">
            <div className="abt-img"><img src={aboutimg2} alt="ZOYR showroom" /></div>
            <div className="abt-ptag">
              <span className="abt-eyebrow">Our Mission</span>
              <h2 className="abt-heading">
                Passionate about <em>exceptional</em> machines
              </h2>
              <p>
                At ZOYR, we curate only the finest pre-owned vehicles — from iconic
                Porsches to rare collector pieces. Every car is rigorously inspected
                and hand-selected for authenticity, performance, and roadworthiness.
                We don't just sell cars; we match drivers with their perfect machine.
              </p>
              <div className="abt-stat-row">
                <div className="abt-stat">
                  <span className="abt-stat-num">8+</span>
                  <span className="abt-stat-lbl">Years</span>
                </div>
                <div className="abt-stat">
                  <span className="abt-stat-num">1.2k</span>
                  <span className="abt-stat-lbl">Cars Sold</span>
                </div>
                <div className="abt-stat">
                  <span className="abt-stat-num">98%</span>
                  <span className="abt-stat-lbl">Satisfaction</span>
                </div>
              </div>
            </div>
          </div>

          <div className="abt-bx">
            <div className="abt-ptag">
              <span className="abt-eyebrow">The Experience</span>
              <h2 className="abt-heading">
                More than a purchase — <em>an adventure</em>
              </h2>
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
            <p>
              Where luxury meets insanity. Discover premium pre-owned cars, expert
              guidance, and an unforgettable driving experience.
            </p>
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