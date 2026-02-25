import { useEffect, useState } from 'react';
import axios from 'axios';
import './ProductPage.css';
import NavBar from '../component/NavBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { reserveProduct } from "../api/api";
import api from "../api/api";


function ProductPage() {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [currentBrand, setCurrentBrand] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [wishlist, setWishlist] = useState([]); 

  const nav = useNavigate();


 useEffect(() => {

  api.get("products/")
    .then(res => {
      setOriginalData(res.data);
      setMaxPrice(getMaxPrice(res.data));
    })
    .catch(err => console.error("Error fetching products:", err));

}, []);


  function getMaxPrice(products = originalData) {
    if (!products.length) return 1000000;
    return Math.max(...products.map(item => item.price));
  }


  useEffect(() => {
    let filtered = [...originalData];

   if (currentBrand !== "all") {
  filtered = filtered.filter(item =>
    item.brand?.trim().toLowerCase() === currentBrand.toLowerCase()
  );
}
    filtered = filtered.filter(item => item.price <= maxPrice);

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.brand.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term)
      );
    }

    if (sort === "priceLH") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "priceHL") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "nameAZ") {
      filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    } else if (sort === "nameZA") {
      filtered.sort((a, b) => b.brand.localeCompare(a.brand));
    }

    setData(filtered);
  }, [originalData, maxPrice, currentBrand, sort, searchTerm]);

  // Add item to cart
  // async function handleAdd(id) {
  //   let user = localStorage.getItem("loggedInUser");
  //   if (!user) {
  //     toast.error("Please login first");
  //     nav("/login");
  //     return;
  //   }

  //   user = JSON.parse(user);

  //   try {
  //     const res = await axios.get(`http://localhost:4000/Users/${user.id}`);
  //     let userData = res.data;

  //     let updateCart = userData.cart ? [...userData.cart] : [];
  //     const currItem = updateCart.find(item => item.productId === id);
  //     if (currItem) currItem.quantity += 1;
  //     else updateCart.push({ productId: id, quantity: 1 });

  //     await axios.patch(`http://localhost:4000/Users/${user.id}`, { cart: updateCart });
  //     const updatedUser = { ...user, cart: updateCart };
  //     localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

  //     toast.dark("Item added to cart 🛒");
  //     window.dispatchEvent(new Event("cartUpdated"));
  //   } catch (err) {
  //     console.error("Add to cart error:", err);
  //     toast.error("Error adding item ");
  //   }
  // }


  function handleSortChange(op) {
    setSort(op);
  }


  function handleBrandFilter(brand) {
    setCurrentBrand(brand);
  }


  function handleSearch() {
    setSearchTerm(searchInput);
  }


  // async function handleWishlist(productId) {
  //   let user = localStorage.getItem("loggedInUser");
  //   if (!user) {
  //     toast.error("Please login first");
  //     nav("/login");
  //     return;
  //   }

  //   user = JSON.parse(user);

  //   try {
  //     const res = await axios.get(`http://localhost:4000/Users/${user.id}`);
  //     let userData = res.data;
  //     let updatedWishlist = userData.wishlist ? [...userData.wishlist] : [];

  //     if (updatedWishlist.includes(productId)) {
  //       updatedWishlist = updatedWishlist.filter(id => id !== productId);
  //       toast.dark("Removed from wishlist ");
  //     } else {
  //       updatedWishlist.push(productId);
  //       toast.dark("Added to wishlist ");
  //     }

  //     await axios.patch(`http://localhost:4000/Users/${user.id}`, { wishlist: updatedWishlist });
  //     setWishlist(updatedWishlist);

  //     const updatedUser = { ...user, wishlist: updatedWishlist };
  //     localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
  //   } catch (err) {
  //     console.error("Wishlist error:", err);
  //     toast.error("Error updating wishlist ❌");
  //   }
  // }

  async function handleReserve(id) {

  try {

    await reserveProduct(id);

    toast.success("Car reserved successfully");

    // update UI instantly
    setData(prev =>
      prev.map(p =>
        p.id === id ? { ...p, availability: "reserved" } : p
      )
    );

  } catch(err) {

    if(err.response?.data?.error === "You already have an active reservation"){
      toast.warning("Finish your current reservation first 🚗");
      nav("/cart");
      return;
  }

    toast.error(err.response?.data?.error || "Reserve failed");

  }

}

  return (
    <>
      <NavBar color={false} />
      <div className='emp'></div>
      
      <div className='sorting-Div'>
        <div className="controls">
          <select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
            <option value="">Sort By</option>
            <option value="priceLH">Price: Low to High</option>
            <option value="priceHL">Price: High to Low</option>
            <option value="nameAZ">Name: A - Z</option>
            <option value="nameZA">Name: Z - A</option>
          </select>

          <input
            type="text"
            placeholder="Search by brand or model..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button className="search-btn" onClick={handleSearch}>Search</button>

          <div className="price-slider">
            <label htmlFor="priceRange">Max Price: ${maxPrice}</label>
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
          {["all", "BMW", "AUDI", "PORSCHE", "JAGUAR", "MERCEDES BENZ", "BENTLEY", "MINI", "RANGE ROVER", "FORD", "LAMBORGHINI", "ROLLS ROYSCE", "VOLVO"].map(brand => (
            <button key={brand} onClick={() => handleBrandFilter(brand)} className={currentBrand === brand ? "active-brand" : ""}>
              {brand}
            </button>
          ))}
        </div>
      </div>


      <div className='Prd-main'>
        {data.filter(dt => dt.status === "active").map(dt => (
          <div key={dt.id} className='prd-cards'>
            <div className='prdimg-div'>
              <img className='prdimg' src={dt.image?.url || dt.image} alt={dt.model} />
              {/* <button
                className="wishlist-btn"
                onClick={() => handleWishlist(dt.id)}
              >
                {wishlist.includes(dt.id) ? <FaHeart className="heart-icon filled" /> : <FaRegHeart className="heart-icon" />}
              </button> */}
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
                      <p>REG. </p>
                      <p>YEAR</p>
                    </div>
                    <h6>{dt.year}</h6>
                  </div>

                  <div className="detail-sections">
                    <div>
                      <p>FUEL </p>
                      <p>TYPE </p>
                    </div>
                    <h6>{dt.fuel}</h6>
                  </div>

                  <div className="detail-sections">
                    <div>
                      <p>KMS </p>
                      <p>COVERED </p>
                    </div>
                    <h6>{dt.kmCover}</h6>
                  </div>
                </div>

                {dt.availability === "available" ? (
                    <button
                        className="AddBtn"
                        onClick={() => handleReserve(dt.id)}
                      >
                      Reserve
                    </button>
                    ) : (
                      <button className="AddBtn" disabled>
                        Reserved
                      </button>

                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ProductPage;
