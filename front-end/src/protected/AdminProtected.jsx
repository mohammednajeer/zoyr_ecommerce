import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminProtected({ children}) {
  const user = localStorage.getItem('loggedInUser');
  const conv = user ? JSON.parse(user) : null;
  const role = conv?.role;
  return role === 'admin' ?children:<Navigate to='/'/>
}

export default AdminProtected;
