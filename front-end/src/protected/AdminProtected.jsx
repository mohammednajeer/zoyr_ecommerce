import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

function AdminProtected({ children }) {

  const [loading,setLoading] = useState(true);
  const [isAdmin,setIsAdmin] = useState(false);

  useEffect(()=>{

    async function checkAdmin(){

      try{

        const res = await api.get("profile/");
        
        if(res.data.role === "admin"){
            setIsAdmin(true);
        }

      }catch(err){
        setIsAdmin(false);
      }

      setLoading(false);

    }

    checkAdmin();

  },[])

  if(loading){
    return <div>Loading...</div>
  }

  if(!isAdmin){
    return <Navigate to="/" replace/>
  }

  return children
}

export default AdminProtected