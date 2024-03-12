import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from '../Home/Home';
import Signin from '../component/user/SignIn';
import Signup from '../component/user/SignUp';
import AuthService from '../services/authService';


const PrivateRoute = ({ element, ...props }) => {
  return AuthService.isAuthenticated() ? (
    element
  ) : (
    <Navigate to="/" replace />
  );
};

const Routess = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      setAuthenticated(AuthService.isAuthenticated());
    };

    checkAuthentication(); // Initial check

    const unsubscribe = AuthService.subscribe(checkAuthentication);

    return () => {
      unsubscribe();
    };
  }, []); // Run only on mount

  const handleSignOut = () => {
    AuthService.removeToken();
  };

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          authenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Signin onSignOut={handleSignOut} />
          )
        }
      />
      <Route path="/home" element={<PrivateRoute element={<Home />} />} />
    </Routes>
  );
};

export default Routess;
