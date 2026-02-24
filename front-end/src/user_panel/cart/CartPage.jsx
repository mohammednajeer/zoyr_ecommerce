import { useEffect, useState } from "react";
import "./CartPage.css";
import NavBar from '../../component/NavBar.jsx';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import inc from "../../assets/increase.png";
import dec from "../../assets/decrease.png";
import { toast } from "react-toastify";

function CartPage() {
  const [cartProducts, setCartProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [total,setTotal]=useState(0)
  const nav = useNavigate();

  useEffect(() => {
    async function fetchCart() {
      let storeduser = JSON.parse(localStorage.getItem("loggedInUser"));

      if (!storeduser) {
        toast.error("Please login to view your cart ❌");
        nav("/login");
        return;
      }

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


        let cartWithDetails = user.cart.map(item => {
          let product = products.find(p => p.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        }).filter(Boolean);

        setCartProducts(cartWithDetails);

      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    }

    fetchCart();
  }, [nav]);


  const handleInc = (id) => {
    if (!userData) return;
    let updatedCart = userData.cart.map(item =>
      item.productId === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));

  };


  const handleDec = (id) => {
    if (!userData) return;
    let updatedCart = userData.cart.map(item =>
      item.productId === id
        ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
        : item
    );
    updateCart(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));

  };


  const handleRemove = (id) => {
    if (!userData) return;
    let updatedCart = userData.cart.filter(item => item.productId !== id);
     window.dispatchEvent(new Event("cartUpdated"));
    updateCart(updatedCart);
   

  };


  const updateCart = (updatedCart) => {
    axios.patch(`http://localhost:4000/Users/${userData.id}`, { cart: updatedCart })
      .then(() => {
        let updatedUser = { ...userData, cart: updatedCart };
        setUserData(updatedUser);
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

        
        setCartProducts(prev =>
          prev.map(p => {
            let item = updatedCart.find(i => i.productId === p.id);
            return item ? { ...p, quantity: item.quantity } : null;
          }).filter(Boolean)
        );
      })
      .catch(err => console.error(err));
  };
  const totalPrice=cartProducts.reduce(
    (acc,item)=>acc+parseInt(item.price.replace("$",""))*item.quantity,0
  )
  return (
    <>
      <NavBar color={false} />
      <div className="Cartbody">
        <div className="cart-cont">
          {cartProducts.length === 0 ? (
            <h2>Your cart is empty 🛒</h2>
          ) : (
            cartProducts.map(prd => (
              
              <div className="card-prd" key={prd.id}>
                <div className="prd-img">
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
                <div className="fnct-cart">
                  <button className="remove-btn" onClick={() => handleRemove(prd.id)}>Remove</button>
                  <div className="quantity-btns">
                    <div className="ct-inc-btn" onClick={() => handleInc(prd.id)}>
                      <img src={inc} alt="increase" />
                    </div>
                    <div className="ct-dec-btn" onClick={() => handleDec(prd.id)}>
                      <img src={dec} alt="decrease" />
                    </div>
                  </div>
                </div>
              </div>
             
             
            ))
            
          )}
        <div className="ord-section">
          <button onClick={()=>nav("/order")} className="plc-ord-btn">Order</button>
          <h2>
           Total :${totalPrice}
          </h2>
          </div>  
        </div>
      </div>
    </>
  );
}

export default CartPage;
