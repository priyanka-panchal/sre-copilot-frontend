import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles.css';
import AuthService from '../../services/authService';
import Header from '../../Home/Header/Header';
import { REACT_APP_API_ENDPOINT } from '../../environment/env';
import { setUserId } from '../../store/reducer/userSlice';

const Signin = () => {
  const dispatch = useDispatch();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!username || !password) {
      setError('UserName and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(REACT_APP_API_ENDPOINT + '/api/v1/auth/login', {
        username,
        password,
      });
      if (response && response.data && response.data.user && response.data.user.access) {
        AuthService.setToken(response.data.user.access);
        dispatch(setUserId(response.data.user.id));
        navigate('/home');
      } else {
        setError('Failed to get user information from the server.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Incorrect username or password.');
      } else {
        console.error(error.response ? error.response.data : error.message);
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

//  const handleRefreshToken = async () => {
//     try {
//       const response = await axios.get(REACT_APP_API_ENDPOINT + '/api/v1/auth/token/refresh', {
//         headers: {
//           Authorization: `Bearer ${AuthService.getToken()}`
//         }
//       });

//       if (response && response.data && response.data.access) {
//         AuthService.setToken(response.data.access);
//         // You can dispatch actions or handle other logic if needed
//       }
//     } catch (error) {
//       console.error(error.response ? error.response.data : error.message);
//       setError('Failed to refresh access token.');
//     }
//   };

  return (
    <>
      <Header />
      <br />
      <div className="signin-container">
        <h2 className="signin-heading">Sign In</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          className="signin-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signin-input"
        />
        {error && (
          <Alert variant="danger" className="signin-error">
            {error}
          </Alert>
        )}
        <button onClick={handleSignIn} className="signin-button" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        <div className="signup-link">
          New user? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </>
  );
};

export default Signin;
