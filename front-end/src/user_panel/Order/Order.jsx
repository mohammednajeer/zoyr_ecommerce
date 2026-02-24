import React, { useEffect, useState } from 'react'
import './Order.css'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Order() {
  const [address, setAddress] = useState("");
  const [Phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState({});
  const [cartProducts, setCartProducts] = useState([]);

  const nav = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      let storeduser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (!storeduser) return;

      try {

        let userRes = await axios.get(`http://localhost:4000/Users/${storeduser.id}`);
        let user = userRes.data;
        setUserData(user);

        if (!user.cart || user.cart.length === 0) {
          setCartProducts([]);
          return;
        }


        let productsRes = await axios.get("http://localhost:4000/Products");
        let products = productsRes.data;


        let cartWithDetails = user.cart
          .map(item => {
            let product = products.find(p => p.id === item.productId);
            return product ? { ...product, quantity: item.quantity } : null;
          })
          .filter(Boolean);

        setCartProducts(cartWithDetails);

      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    }

    fetchCart();
  }, []);

  const totalPrice = cartProducts.reduce(
    (acc, item) => acc + parseInt(item.price.replace("$", "")) * item.quantity, 0
  );

  async function handlePlaceOrder() {
    let storeduser = JSON.parse(localStorage.getItem("loggedInUser"));


    if (!name || !Phone || !email || !address || !city || !pincode) {
      toast.error("Please fill all details");
      return;
    }

    const neworder = {
      id: Date.now(), 
      items: cartProducts,
      total: totalPrice,
      customer: {
        name,
        phone: Phone,
        email,
        address,
        city,
        pincode
      },
      date: new Date().toISOString(),
      status: "Placed"
    };

    try {
      await axios.patch(`http://localhost:4000/Users/${storeduser.id}`, {
        orders: [...(userData.orders || []), neworder],
        cart: []
      });

     

     
      nav("/orderplaced");
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place order. Try again.");
    }
  }

  return (
    <div className='order-container'>
      <div className='ordr-body'>
        <h1>Check out</h1>
        <h2>Total : ${totalPrice}</h2>

        <h4>Your Cart</h4>
        {
          cartProducts.map(prd => (
            <div className="card-prds" key={prd.id}>
              <div className="prds-img">
                <img src={prd.imgSource} alt={prd.model} />
              </div>
              <div className="cart-detls">
                <h3>{prd.brand} - {prd.model}</h3>
                <p>Price: {prd.price}</p>
                <p>Year: {prd.year}</p>
                <p>Fuel: {prd.fuel}</p>
                <p>KMs: {prd.kmCover}</p>
                <p>Quantity: {prd.quantity}</p>
              </div>
            </div>
          ))
        }

       <div className='inp-bx'>
        <div>Enter your details</div>
         <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Full name'
        />
        <div className='phnem-box'>
          <input
            type="text"
            value={Phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder='Phone'
          />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Email'
          />
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder='Street Address'
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder='City'
        />
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          placeholder='Pincode'
        />
       </div>

        <div>
          <button className='order-btn' onClick={handlePlaceOrder}>
            Place order
          </button>
        </div>
      </div>
    </div>
  );
}

export default Order;
