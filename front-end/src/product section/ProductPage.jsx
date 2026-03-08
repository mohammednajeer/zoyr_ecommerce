import { useEffect, useState } from 'react';
import './ProductPage.css';
import NavBar from '../component/NavBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { reserveProduct, toggleWishlist } from "../api/api";
import api from "../api/api";
import { useLocation } from 'react-router-dom';

function ProductPage() {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [currentBrand, setCurrentBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [myWishlist, setMyWishlist] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const nav = useNavigate();
const location = useLocation()
  // ── Fetch products ──────────────────────────────────────
  useEffect(() => {
    api.get("products/")
      .then(res => {
        setOriginalData(res.data);
        setMaxPrice(getMaxPrice(res.data));
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  // ── Fetch wishlist ──────────────────────────────────────
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const res = await api.get("products/my-wishlist/");
        setMyWishlist(res.data.map(p => p.id));
      } catch {}
    }
    fetchWishlist();
  }, []);

  // ── Fetch reservations ──────────────────────────────────
  useEffect(() => {
    api.get("products/my-reservations/")
      .then(res => {
        const ids = res.data.map(r => r.product.id);
        setMyReservations(ids);
      })
      .catch(() => {});
  }, []);

  // ── Helpers ─────────────────────────────────────────────
  function getMaxPrice(products = originalData) {
    if (!products.length) return 1000000;
    return Math.max(...products.map(item => item.price));
  }

  // ── Filter + Sort ────────────────────────────────────────
  useEffect(() => {
    let filtered = [...originalData];

    if (currentBrand !== "all") {
      filtered = filtered.filter(item =>
        item.brand?.trim().toLowerCase() === currentBrand.toLowerCase()
      );
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter(item => item.availability === availabilityFilter);
    }

    filtered = filtered.filter(item => item.price <= maxPrice);

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.brand.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term)
      );
    }

    if (sort === "priceLH")      filtered.sort((a, b) => a.price - b.price);
    else if (sort === "priceHL") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "nameAZ")  filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    else if (sort === "nameZA")  filtered.sort((a, b) => b.brand.localeCompare(a.brand));

    setData(filtered);
  }, [originalData, maxPrice, currentBrand, sort, searchTerm, availabilityFilter]);

  // ── Handlers ─────────────────────────────────────────────
  async function handleWishlist(e, id) {
    e.stopPropagation(); // prevent card click
    try {
      await toggleWishlist(id);
      setMyWishlist(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    } catch (err) {
      toast.error("Wishlist failed");
    }
  }

  async function handleReserve(e, id) {
    e.stopPropagation(); // prevent card click
    try {
      await reserveProduct(id);
      toast.success("Car reserved successfully");
      setData(prev =>
        prev.map(p => p.id === id ? { ...p, availability: "reserved" } : p)
      );
    } catch (err) {
      if (err.response?.data?.error === "You already have an active reservation") {
        toast.warning("Finish your current reservation first 🚗");
        nav("/cart");
        return;
      }
      toast.dark(err.response?.data?.error || "Reserve failed");
    }
  }

  function handleCardClick(id) {
    nav(`/product-details/${id}`);
  }

  return (
    <>
      <NavBar color={false} />
      <div className='emp'></div>

      {/* ── Sorting / Filtering Bar ── */}
      <div className='sorting-Div'>
        <div className="controls">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort By</option>
            <option value="priceLH">Price: Low to High</option>
            <option value="priceHL">Price: High to Low</option>
            <option value="nameAZ">Name: A - Z</option>
            <option value="nameZA">Name: Z - A</option>
          </select>

          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
            <option value="all">All Cars</option>
            <option value="available">Available Only</option>
            <option value="reserved">Reserved Only</option>
            <option value="sold">Sold Only</option>
          </select>

          <input
            type="text"
            placeholder="Search by brand or model..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchTerm(searchInput)}
            className="search-input"
          />
          <button className="search-btn" onClick={() => setSearchTerm(searchInput)}>Search</button>

          <div className="price-slider">
            <label htmlFor="priceRange">Max Price: ${maxPrice.toLocaleString()}</label>
            <input
              type="range"
              id="priceRange"
              min="1000"
              max={getMaxPrice()}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="brand-buttons">
          {["all","BMW","AUDI","PORSCHE","JAGUAR","MERCEDES BENZ","BENTLEY","MINI","RANGE ROVER","FORD","LAMBORGHINI","ROLLS ROYSCE","VOLVO"].map(brand => (
            <button
              key={brand}
              onClick={() => setCurrentBrand(brand)}
              className={currentBrand === brand ? "active-brand" : ""}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className='Prd-main'>
        {data.filter(dt => dt.status === "active").map(dt => (

          // ✅ Entire card is clickable — navigates to detail page
          <div
            key={dt.id}
            className='prd-cards'
            onClick={() => handleCardClick(dt.id)}
            style={{ cursor: "pointer" }}
          >
            <div className='prdimg-div'>
              <img className='prdimg' src={dt.image?.url || dt.image} alt={dt.model} />

              {/* ✅ stopPropagation so wishlist click doesn't open detail page */}
              <button
                className="wishlist-btn"
                onClick={(e) => handleWishlist(e, dt.id)}
              >
                {myWishlist.includes(dt.id)
                  ? <FaHeart className="heart-icon filled" />
                  : <FaRegHeart className="heart-icon" />
                }
              </button>
            </div>

            <div className='prdcard-details'>
              <div className='btn--secion'>
                <button className='prd-btn'>${Number(dt.price).toLocaleString()}</button>
                <h5>{dt.brand}</h5>
              </div>

              <div className='car-model-text'>
                <span>{dt.model}</span>
              </div>

              <div className="car-details">
                <div className='dt-cntr'>
                  <div className="detail-sections">
                    <div><p>REG.</p><p>YEAR</p></div>
                    <h6>{dt.year}</h6>
                  </div>
                  <div className="detail-sections">
                    <div><p>FUEL</p><p>TYPE</p></div>
                    
                    <h6>{dt.fuel}</h6>
                  </div>
                  <div className="detail-sections">
                    <div><p>KMS</p><p>COVERED</p></div>
                    <h6>{dt.kmCover}</h6>
                  </div>
                </div>

                {/* ✅ stopPropagation on all reserve buttons */}
                {myReservations.includes(dt.id) ? (
                  <button className="AddBtn1" disabled onClick={e => e.stopPropagation()}>
                    Reserved By You
                  </button>
                ) : dt.availability === "sold" ? (
                  <button className="AddBtn1" disabled onClick={e => e.stopPropagation()}>
                    Sold
                  </button>
                ) : dt.availability === "reserved" ? (
                  <button className="AddBtn1" disabled onClick={e => e.stopPropagation()}>
                    Reserved
                  </button>
                ) : (
                  <button
                    className="AddBtn1"
                    onClick={(e) => handleReserve(e, dt.id)}
                  >
                    Reserve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductPage;