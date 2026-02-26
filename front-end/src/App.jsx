import './App.css'
import SignUp from './Authentication/Sign up/SignUp'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import SignIn from './Authentication/Sing in/SignIn'
import Home from './user_panel/Homecomp/Homecomp.jsx'
import ProductPage from './product section/ProductPage.jsx'
import CartPage from './user_panel/cart/CartPage.jsx'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import Order from './user_panel/Order/Order.jsx'
import OrderPlaced from './user_panel/Order/OrderPlaced.jsx'
import PreviousOrder from './user_panel/Previousorder/PreviousOrder.jsx'
import SideBar from './Admin_Panel/Sidebar/SideBar.jsx'
import DashBoard from './Admin_Panel/Pages/Dashboard/DashBoard.jsx'
import OrdersList from './Admin_Panel/Pages/Orders/OrdersList.jsx'
import VehicleListing from './Admin_Panel/Pages/Vehicle_listing/VehicleListing.jsx'
import UsersDirectory from './Admin_Panel/Pages/Users-directory/UsersDirectory.jsx'
import AdminProtected from './protected/AdminProtected.jsx'
import VehicleAddEdit from './Admin_Panel/Pages/Vehicle_listing/VehicleAddEdit.jsx'
import Wishlist from './user_panel/wishlist/Wishlist.jsx'
import UserProfile from './Admin_Panel/Pages/Users-directory/UserProfile.jsx'
import Profile from './user_panel/profile/Profile.jsx'


function App() {


  return (
    <>
    <BrowserRouter>
    <Routes>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/login" element={<SignIn/>}/>
    <Route path="/" element={<Home/>}/>
    <Route path="/product" element={<ProductPage/>}/>
    <Route path="/cart" element={<CartPage/>}/>
    <Route path="/order" element={<Order/>}/>
    <Route path="/orderplaced" element={<OrderPlaced/>}/>
    <Route path="/previousOrder" element={<PreviousOrder/>}/>
    <Route path="/sidebar" element={<SideBar/>}/>
    <Route path="/dashboard" element={<AdminProtected><DashBoard/></AdminProtected>}/>
    <Route path="/ordersList" element={<AdminProtected><OrdersList/></AdminProtected>}/>
    <Route path="/VehicleListing" element={<AdminProtected><VehicleListing/></AdminProtected>}/>
    <Route path="/userdirectory" element={<AdminProtected><UsersDirectory/></AdminProtected>}/>
    <Route path="/vehicleUpdate" element={<AdminProtected><VehicleAddEdit /></AdminProtected>} />
    <Route path="/vehicleUpdate/:id" element={<AdminProtected><VehicleAddEdit/></AdminProtected>}/>
     <Route path="/userprofile" element={<AdminProtected><UserProfile/></AdminProtected>}/>
    <Route path="/wishlist" element={<Wishlist/>}/>
    <Route path="/profile" element={<Profile />} />
    </Routes>
    <ToastContainer position="bottom-right" autoClose={1000}/>
    </BrowserRouter>
    </>
  )
}

export default App

