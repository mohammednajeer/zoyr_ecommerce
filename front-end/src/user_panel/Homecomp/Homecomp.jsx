import React, { useEffect, useState, useRef } from 'react';
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

const FAQ_ITEMS = [
  {
    q: "Do you offer international shipping?",
    a: "Yes, we arrange secure, climate-controlled flatbed transport and covered sea freight worldwide. All shipping options include fully insured concierge customs clearance."
  },
  {
    q: "What does the ZOYR 150-point inspection include?",
    a: "It covers full mechanical diagnostics, chassis integrity checking, paint thickness analysis to detect historical accidents, engine compression tests, and a complete road test by certified technicians."
  },
  {
    q: "Can I trade-in my current exotic vehicle?",
    a: "Absolutely. We provide premium evaluations for luxury imports, sports cars, and classic vehicles. The trade-in value can be directly applied to your new acquisition."
  },
  {
    q: "Do the vehicles come with a warranty?",
    a: "Yes, all vehicles purchased through ZOYR include a comprehensive 12-month powertrain and electrical warranty, which can be extended up to 36 months."
  }
];

function Home() {
  const [data,   setData]   = useState([]);
  const [slides, setSlides] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const isAnimatingRef = useRef(false);
  const timerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState(null);
  const [myReservations, setMyReservations] = useState([]);

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
    api.get('products/my-reservations/')
       .then(res => {
         const ids = res.data.map(r => r.product.id);
         setMyReservations(ids);
       })
       .catch(() => {});
  }, []);

  // IntersectionObserver for scroll fading out/in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
          } else {
            entry.target.classList.remove('reveal-active');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
    );
    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach((el) => observer.observe(el));
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [data, activeCategory]);

  useEffect(() => {
    api.get('products/?limit=24&ordering=-year')
       .then(res => {
         const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
         setData(list);
       })
       .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    api.get('products/?limit=5&ordering=-year')
       .then(res => {
         const list = Array.isArray(res.data) ? res.data : res.data.results ?? [];
         setSlides(list);
       })
       .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToNext();
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [slides.length, slideIndex]);

  function goTo(i) {
    if (isAnimatingRef.current || i === slideIndex) return;
    isAnimatingRef.current = true;
    setSlideIndex(i);
    setTimeout(() => { isAnimatingRef.current = false; }, 800);
  }

  function goToNext() {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setSlideIndex(prev => (prev + 1) % slides.length);
    setTimeout(() => { isAnimatingRef.current = false; }, 800);
  }

  function handleLoaderDone() {
    sessionStorage.setItem('zoyr_loaded', 'true');
    setLoaded(true);
  }

  async function handleAdd(id) {
    try {
      await reserveProduct(id);
      toast.success('Vehicle reserved successfully');
      setMyReservations(prev => [...prev, id]);
      setData(prev => prev.map(p => p.id === id ? { ...p, availability: 'reserved' } : p));
    } catch (err) {
      if (err.response?.status === 401) {
        toast.warning('Please login first');
        nav('/login', { state: { from: location.pathname } });
      } else if (err.response?.data?.error === "You already have an active reservation") {
        toast.warning("Finish your current reservation first 🚗");
        nav("/cart");
      } else {
        toast.error(err.response?.data?.error || 'Failed to reserve vehicle');
      }
    }
  }

  return (
    <>
      {!loaded && <LoadingScreen onDone={handleLoaderDone} />}

      {/* ══ NAV ══ */}
      <NavBar color={true} />

      {/* ══ HERO SLIDESHOW (Mansory Style) ══ */}
      <section className="hero-slideshow">
        {slides.map((car, i) => {
          const isActive = i === slideIndex;
          const imgSrc = car.image?.url || car.image;
          return (
            <div key={car.id} className={`hero-slide ${isActive ? 'active' : ''}`}>
              <div className="hero-slide-bg" style={{ backgroundImage: `url(${imgSrc})` }} />
            </div>
          );
        })}
        
        {slides.length === 0 && (
          <div className="hero-slide active">
            <div className="hero-slide-bg skeleton" />
          </div>
        )}

        {/* Mansory-style dark gradient overlay on the bottom/left */}
        <div className="hero-slide-overlay" />

        {/* Main Text Content */}
        {slides.length > 0 && (
          <div className="hero-slide-content">
            <div className="hero-slide-badge">Featured Masterpiece</div>
            <h1 className="hero-slide-title">
              <span className="brand">{slides[slideIndex].brand}</span>
              <span className="model">{slides[slideIndex].model}</span>
            </h1>
            
            {/* Real world luxury specs details in slideshow */}
            <div className="hero-slide-specs">
              <div className="hero-spec-box">
                <span className="spec-label">Year</span>
                <span className="spec-value">{slides[slideIndex].year}</span>
              </div>
              <div className="hero-spec-box">
                <span className="spec-label">Fuel</span>
                <span className="spec-value">{slides[slideIndex].fuel || 'Petrol'}</span>
              </div>
              <div className="hero-spec-box">
                <span className="spec-label">Milage</span>
                <span className="spec-value">{slides[slideIndex].kmCover?.toLocaleString() || '0'} KM</span>
              </div>
              <div className="hero-spec-box price">
                <span className="spec-label">Acquisition Price</span>
                <span className="spec-value">${Number(slides[slideIndex].price).toLocaleString()}</span>
              </div>
            </div>

            <div className="hero-slide-actions">
              <button className="btn-primary" onClick={() => nav('/product')}>
                View Inventory
              </button>
            </div>
          </div>
        )}

        {/* Slide Indicators (Mansory long dashes) */}
        {slides.length > 1 && (
          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === slideIndex ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="marquee-strip scroll-reveal">
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className={item === '✦' ? 'marquee-dot' : ''}>{item}</span>
          ))}
        </div>
      </div>

      {/* ══ PRODUCTS ══ */}
      <section className="products scroll-reveal" id="collection">
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

        {/* Dynamic Category Filters Strip */}
        <div className="category-filter-strip">
          {['All', 'SUV', 'Sedan', 'Sports'].map(category => (
            <button
              key={category}
              className={`category-filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ── CARDS — prd-cards style ── */}
        <div className="carsections">
          {(() => {
            const filteredVehicles = data.filter(car => {
              if (activeCategory === 'All') return true;
              const modelLower = car.model?.toLowerCase() || '';
              const brandLower = car.brand?.toLowerCase() || '';
              if (activeCategory === 'SUV') {
                return modelLower.includes('x5') || modelLower.includes('sport') || modelLower.includes('velar') || modelLower.includes('cayenne') || modelLower.includes('lx');
              }
              if (activeCategory === 'Sedan') {
                return modelLower.includes('series') || modelLower.includes('class') || modelLower.includes('530') || modelLower.includes('730') || modelLower.includes('a6') || modelLower.includes('xjl') || modelLower.includes('flying');
              }
              if (activeCategory === 'Sports') {
                return brandLower.includes('lamborghini') || brandLower.includes('porsche') || modelLower.includes('m3') || modelLower.includes('m5') || modelLower.includes('mustang') || modelLower.includes('cooper');
              }
              return true;
            });

            const displayedVehicles = filteredVehicles.slice(0, 3);

            if (displayedVehicles.length === 0) {
              return (
                <div className="no-filtered-results">
                  No premium vehicles matching the "{activeCategory}" category are currently in stock.
                </div>
              );
            }

            return displayedVehicles.map((dt) => (
              <div key={dt.id} className="home-prd-card scroll-reveal" onClick={() => nav(`/product-details/${dt.id}`)}>
                {/* Animated corner accents */}
                <div className="home-prd-corner home-prd-corner-tl" />
                <div className="home-prd-corner home-prd-corner-br" />

                <div className="home-prdimg-div">
                  <img className="home-prdimg" src={dt.image?.url || dt.image} alt={dt.model} />
                  {/* Shimmer sweep on hover */}
                  <div className="home-prd-img-shimmer" />
                  <div className="home-prd-year-tag">{dt.year}</div>
                </div>

                <div className="home-prdcard-details">
                  <div className="btn--secion">
                    <span className="home-prd-btn">${Number(dt.price).toLocaleString()}</span>
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
                        <h6>{dt.kmCover?.toLocaleString()}</h6>
                      </div>
                    </div>
                    {myReservations.includes(dt.id) ? (
                      <button className="home-add-btn" disabled onClick={e => e.stopPropagation()}>
                        Reserved By You
                      </button>
                    ) : dt.availability === "sold" ? (
                      <button className="home-add-btn" disabled onClick={e => e.stopPropagation()}>
                        Sold
                      </button>
                    ) : dt.availability === "reserved" ? (
                      <button className="home-add-btn" disabled onClick={e => e.stopPropagation()}>
                        Reserved
                      </button>
                    ) : (
                      <button
                        className="home-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(dt.id);
                        }}
                      >
                        Reserve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ));
          })()}
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
      <section className="about-section scroll-reveal" id="about">
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

      {/* ══ ADVANTAGES / WHY CHOOSE US ══ */}
      <section className="advantages-section scroll-reveal">
        <div className="advantages-container">
          <h2 className="section-title text-center">The ZOYR Distinction</h2>
          <p className="advantages-subtitle text-center">We redefine the premium automotive buying journey through bespoke service and absolute transparency.</p>
          
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="adv-icon">🛡️</div>
              <h4>Rigorous Certification</h4>
              <p>Every vehicle is subjected to an exhaustive 150-point diagnostic inspection and full historical background verification.</p>
            </div>
            <div className="advantage-card">
              <div className="adv-icon">💳</div>
              <h4>Tailored Financial Solutions</h4>
              <p>Custom flexible financing and concierge trade-in evaluations designed around your personal capital structure.</p>
            </div>
            <div className="advantage-card">
              <div className="adv-icon">🚚</div>
              <h4>White-Glove Delivery</h4>
              <p>Seamless flatbed transport directly to your private residence, detailing completed upon arrival.</p>
            </div>
            <div className="advantage-card">
              <div className="adv-icon">⚙️</div>
              <h4>Bespoke Aftercare</h4>
              <p>Direct priority booking for certified maintenance, customized upgrades, and comprehensive warranty programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CLIENT TESTIMONIALS ══ */}
      <section className="testimonials-section scroll-reveal">
        <div className="section-header">
          <div className="section-line" />
          <div className="section-title-wrap">
            <span className="section-eyebrow">Endorsements</span>
            <h2 className="section-title">Discerning Voices</h2>
          </div>
          <div className="section-line" />
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <span className="quote-mark">“</span>
            <p className="testimonial-text">Purchasing my Porsche Panamera through ZOYR was an absolute masterclass in client services. Transparent, prompt, and the vehicle was delivered in showroom condition.</p>
            <div className="testimonial-author">
              <div className="author-details">
                <h5>Stefano Rossi</h5>
                <span>Milan, Italy (Verified Buyer)</span>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <span className="quote-mark">“</span>
            <p className="testimonial-text">The level of professional inspection they provide gave me complete confidence in acquiring a collectible Aston Martin unseen. Truly outstanding team.</p>
            <div className="testimonial-author">
              <div className="author-details">
                <h5>Charlotte Vance</h5>
                <span>Zurich, Switzerland (Verified Buyer)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION ══ */}
      <section className="faq-section scroll-reveal">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <p className="faq-subtitle text-center">Everything you need to know about our luxury acquisition process.</p>
        
        <div className="faq-accordion">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`} onClick={() => setOpenFaq(isOpen ? null : index)}>
                <div className="faq-question">
                  <span>{item.q}</span>
                  <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
                </div>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
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