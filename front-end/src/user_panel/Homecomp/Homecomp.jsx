import React, { useEffect, useState } from 'react';
import picture1   from '../../assets/black-porsche-911-in-motion-b2-3200x2000.jpg';
import './Home.css';
import NavBar      from '../../component/NavBar.jsx';
import { useNavigate }  from 'react-router-dom';
import { toast }        from 'react-toastify';
import aboutimg1   from '../../assets/aston-martin-showroom-hd-wallpaper-preview.jpg';
import aboutimg2   from '../../assets/kenjiro-yagi-RVEdgp-dkYY-unsplash.jpg';
import Facebook    from '../../assets/facebook.png';
import Instagram   from '../../assets/instagram (1).png';
import LinkedinIn  from '../../assets/linkedin (1).png';
import Twitter     from '../../assets/twitter.png';
import api         from '../../api/api.js';
import { reserveProduct } from '../../api/api.js';
import { useLocation }   from 'react-router-dom';
import LoadingScreen from './LoadingScreen.jsx';

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
  const [data,   setData]   = useState([]);

  const [loaded, setLoaded] = useState(
    () => sessionStorage.getItem('zoyr_loaded') === 'true'
  );

  const nav      = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('profile/')
       .then(res => { if (res.data.role === 'admin') nav('/dashboard'); })
       .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('products/?limit=3&ordering=-year')
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

  return (
    <>
      {!loaded && <LoadingScreen onDone={handleLoaderDone} />}

      {/* ══ NAV ══ */}
      <NavBar color={true} />

      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${picture1})` }} />
        <div className="hero-overlay" />
        <div className="hero-scan" />
        <div className="hero-grain" />
        <div className="hero-grid" />
        <div className="hero-arch" />
        <div className="hero-arch-2" />

        <div className="bracket bracket-tl" />
        <div className="bracket bracket-br" />
        <div className="bracket bracket-tr" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" />
              <span>Premium Pre-Owned Collection</span>
            </div>

            <div className="hero-headline">
              <div className="hl-row"><span className="hl-word">WHERE</span></div>
              <div className="hl-row"><span className="hl-word gold">LUXURY</span></div>
              <div className="hl-row"><span className="hl-word">MEETS INSANITY</span></div>
            </div>

            <p className="hero-sub">
              Step into the world of premium pre-owned vehicles. Every car in our
              collection is meticulously selected for performance, style, and pure
              driving pleasure.
            </p>

            <div className="hero-btns">
              <button className="btn-primary" onClick={() => nav('/product')}>
                Explore Collection
              </button>
              <button
                className="btn-ghost"
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Our Story
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <span className="panel-title">Collection Highlights</span>
              <div className="live-badge">
                <div className="live-dot" />
                Live
              </div>
            </div>

            {STATS.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-meta">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-desc">{s.sublabel}</span>
                </div>
                <div className="stat-right-block">
                  <div className="stat-num">{s.value}</div>
                  <div className="stat-bar">
                    <div className="stat-bar-fill" style={{ width: s.barWidth }} />
                  </div>
                </div>
              </div>
            ))}

            <button className="panel-cta" onClick={() => nav('/product')}>
              <div className="panel-cta-text">
                <span className="panel-cta-label">View All Vehicles</span>
                <span className="panel-cta-sub">Browse full inventory</span>
              </div>
              <div className="panel-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="hero-scroll-line" />
          <span className="hero-scroll-label">Scroll</span>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className={item === '✦' ? 'marquee-dot' : ''}>{item}</span>
          ))}
        </div>
      </div>

      {/* ══ PRODUCTS ══ */}
      <section className="products" id="collection">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="section-grid" />

        <div className="prod-side prod-side-left">
          <div className="side-vert-text">ZOYR COLLECTION</div>
          <div className="side-line-animated" />
          <div className="side-diamond" />
          <div className="side-circle-ring" />
        </div>

        <div className="prod-side prod-side-right">
          <div className="side-vert-text">EST. 2017</div>
          <div className="side-line-animated" />
          <div className="side-dot-grid">
            {Array.from({length: 12}).map((_,i) => <span key={i} />)}
          </div>
        </div>

        <div className="section-header">
          <div className="section-line" />
          <div className="section-title-wrap">
            <span className="section-eyebrow">Curated Selection</span>
            <h2 className="section-title">Special Offer Vehicles</h2>
          </div>
          <div className="section-line" />
        </div>

        {/* ── CARDS — prd-cards style ── */}
        <div className="carsections">
          {data.map((dt) => (
            <div key={dt.id} className="prd-cards">
              {/* Animated corner accents */}
              <div className="prd-corner prd-corner-tl" />
              <div className="prd-corner prd-corner-br" />

              <div className="prdimg-div">
                <img className="prdimg" src={dt.image?.url || dt.image} alt={dt.model} />
                {/* Shimmer sweep on hover */}
                <div className="prd-img-shimmer" />
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

        <div className="products-footer">
          <div className="prod-footer-line" />
          <button className="prod-view-all" onClick={() => nav('/product')}>
            <span>View Full Collection</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="prod-footer-line" />
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section className="about-section" id="about">
        <div className="about-orb" />
        <div className="section-grid" />

        <div className="about-particles">
          {Array.from({length: 8}).map((_,i) => (
            <div key={i} className={`about-particle about-particle-${i+1}`} />
          ))}
        </div>

        <div className="about-edge-label">
          <span>OUR STORY</span>
          <div className="about-edge-line" />
        </div>

        <div className="about-block">
          <div className="about-img-wrap">
            <img src={aboutimg2} alt="ZOYR showroom" />
            <div className="img-bracket img-bracket-tl" />
            <div className="img-bracket img-bracket-br" />
          </div>
          <div className="about-text">
            <div className="about-num-accent">01</div>
            <div className="about-eyebrow">
              <div className="about-eyebrow-line" />
              <span>Our Mission</span>
            </div>
            <h2 className="about-heading">
              Passionate about <em>exceptional</em> machines
            </h2>
            <p className="about-p">
              At ZOYR, we curate only the finest pre-owned vehicles — from iconic
              Porsches to rare collector pieces. Every car is rigorously inspected
              and hand-selected for authenticity, performance, and roadworthiness.
            </p>
            <p className="about-p">
              We don't just sell cars; we match drivers with their perfect machine.
            </p>
            <div className="about-stats">
              <div className="about-stat">
                <span className="about-stat-num">8+</span>
                <span className="about-stat-lbl">Years</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-num">1.2k</span>
                <span className="about-stat-lbl">Cars Sold</span>
              </div>
              <div className="about-stat">
                <span className="about-stat-num">98%</span>
                <span className="about-stat-lbl">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>

        <div className="about-divider">
          <div className="about-divider-line" />
          <div className="about-divider-diamond">◆</div>
          <div className="about-divider-line" />
        </div>

        <div className="about-block reverse">
          <div className="about-img-wrap">
            <img src={aboutimg1} alt="ZOYR collection" />
            <div className="img-bracket img-bracket-tl" />
            <div className="img-bracket img-bracket-br" />
          </div>
          <div className="about-text">
            <div className="about-num-accent">02</div>
            <div className="about-eyebrow">
              <div className="about-eyebrow-line" />
              <span>The Experience</span>
            </div>
            <h2 className="about-heading">
              More than a purchase — <em>an adventure</em>
            </h2>
            <p className="about-p">
              Beyond selling cars, we offer personalized guidance and expert
              consultation at every step. From selecting the right model to
              arranging nationwide delivery, our team ensures your journey to
              ownership is as thrilling as the drive itself.
            </p>
            <p className="about-p">
              Join the growing ZOYR community and discover how we redefine
              pre-owned luxury. With us, every drive is an adventure waiting to unfold.
            </p>
            <div className="about-tags">
              <span className="about-tag">Expert Curation</span>
              <span className="about-tag">Nationwide Delivery</span>
              <span className="about-tag">Full Inspection</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer" id="contact">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">ZOYR</div>
            <div className="footer-tagline">Where luxury meets insanity.</div>
            <p className="footer-desc">
              Discover premium pre-owned cars, expert guidance, and an unforgettable
              driving experience.
            </p>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links">
              <li onClick={() => nav('/')}>Home</li>
              <li onClick={() => nav('/product')}>Collection</li>
              <li>Rims</li>
              <li onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</li>
              <li onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact</li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Contact Us</div>
            <div className="footer-contact-item">📧 support@zoyr.com</div>
            <div className="footer-contact-item">📞 +91 12345 67890</div>
            <div className="footer-contact-item">📍 28th Street, California, United States</div>
            <div className="socials">
              <img src={Facebook}   alt="Facebook"  className="social-icon" />
              <img src={Instagram}  alt="Instagram" className="social-icon" />
              <img src={Twitter}    alt="Twitter"   className="social-icon" />
              <img src={LinkedinIn} alt="LinkedIn"  className="social-icon" />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 ZOYR. All rights reserved.</span>
          <span>Premium Pre-Owned Vehicles</span>
        </div>
      </footer>
    </>
  );
}

export default Home;