import React, { useEffect, useState } from 'react';
import './OrderPlaced.css';
import orderVideo from '../../assets/tickvideoedited.mp4'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function OrderPlaced() {
    const [orderId, setOrderId] = useState(null);
    const nav = useNavigate();

    useEffect(() => {
        async function gettingOrderId() {
            try {
                const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
                if (!storedUser) return;

                const res = await axios.get(`http://localhost:4000/Users/${storedUser.id}`);
                const dt = res.data;
                const ord = dt.orders || [];

                if (ord.length > 0) {
                    const lastOrder = ord[ord.length - 1];
                    setOrderId(lastOrder.id);
                }
            } catch (er) {
                console.log(er);
            }
        }
        gettingOrderId();
    }, []);

    return (
        <div className='oplcont'>
            <video className="opl-video" autoPlay loop muted>
                <source src={orderVideo} type="video/mp4" />
                Your browser does not support the video
            </video>

            <div className="opl-body">
                <h1>Order Placed Successfully!</h1>
                 <h3>Order ID: #{orderId}</h3>
                <p>Thank you for your purchase.</p>
                <button className='hm-btn' onClick={() => nav('/')}>Home</button>
            </div>
        </div>
    );
}

export default OrderPlaced;
