import React, { useEffect, useState } from 'react';
import './Wishlist.css';
import NavBar from '../../component/NavBar.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Wishlist() {
  const [WData, setWData] = useState([]);
  const [userData, setUserData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    async function fetchWishlist() {
      let storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

      if (!storedUser) {
        toast.error("Please login to view your Wishlist ❌");
        nav("/login");
        return;
      }

      try {

        let userRes = await axios.get(`http://localhost:4000/Users/${storedUser.id}`);
        let user = userRes.data;
        setUserData(user);

        if (!user.wishlist || user.wishlist.length === 0) {
          setWData([]);
          return;
        }


        let productsRes = await axios.get("http://localhost:4000/Products");
        let products = productsRes.data;

        let WishlistDT = user.wishlist.map(itemId => products.find(p => p.id === itemId)).filter(Boolean);
        setWData(WishlistDT);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    }

    fetchWishlist();
  }, [nav]);
const handleRemoveFromWishlist = async (productId) => {
  try {

    const userRes = await axios.get(`http://localhost:4000/Users/${userData.id}`);
    const user = userRes.data;

    const updatedWishlist = user.wishlist.filter(id => id !== productId);

    await axios.patch(`http://localhost:4000/Users/${user.id}`, { wishlist: updatedWishlist });

    setWData(prev => prev.filter(p => p.id !== productId));


    setUserData({ ...user, wishlist: updatedWishlist });

    toast.info("Removed from wishlist 🗑️");
  } catch (err) {
    console.error("Error removing from wishlist:", err);
  }
};


  const handleAddToCart = async (product) => {
    try {
      const userRes = await axios.get(`http://localhost:4000/Users/${userData.id}`);
      const user = userRes.data;

      const existingItem = user.cart.find(item => item.productId === product.id);
      let updatedCart = existingItem
        ? user.cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...user.cart, { productId: product.id, quantity: 1 }];

      await axios.patch(`http://localhost:4000/Users/${user.id}`, { cart: updatedCart });
      toast.success(`${product.brand} ${product.model} added to cart 🛒`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart ");
    }
  };

  return (
    <>
      <NavBar />
      <div className="Wcontainer">
        <div className="wbody">
          {WData.length === 0 ? (
            <p className="empty-msg">Your wishlist is empty ❤️</p>
          ) : (
            WData.map(dt => (
              <div className="prd-cards" key={dt.id}>
                <div className="prdimg-div">
                  <img className="prdimg" src={dt.imgSource} alt={dt.model} />
                </div>

                <div className="prdcard-details">
                  <div className="btn--secion">
                    <button className="prd-btn">{dt.price}</button>
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
                        <div><p>KMS</p><p>COVERED</p></div>
                        <h6>{dt.kmCover}</h6>
                      </div>
                    </div>
                    <div className="actions">
                      <button className="AddBtn" onClick={() => handleAddToCart(dt)}>Add</button>
                      <button className="remove-btn" onClick={() => handleRemoveFromWishlist(dt.id)}>Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Wishlist;
