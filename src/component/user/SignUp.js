import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles.css';
import Header from '../../Home/Header/Header';
import { REACT_APP_API_ENDPOINT } from '../../environment/env';

const Signup = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    // Validation
    if (!firstname || !lastname || !username || !password || !confirmPassword) {
      setError('First name, last name, username, password, and confirm password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    try {
      const response = await axios.post(REACT_APP_API_ENDPOINT + '/api/v1/auth/register', {
        firstname,
        lastname,
        username,
        password,
      });

      // Check if the response contains data property
      if (response.data && response.status === 201) {
        console.log(response.data);
        navigate('/');
        // You can handle the response data here if needed
      }
    } catch (error) {
      console.error('Error during sign-up:', error.response);
      if (error.response && error.response.status === 409) {
        setError(error.response.data.error); // Set error message from the API
      } else {
        setError('An unexpected error occurred. Please try again.'); // Generic error message
      }
    }
  };

  return (
    <>
      <Header />
      <br />
      <div className="signup-container">
        <h2 className="signin-heading">Sign Up</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstname}
          onChange={(e) => setFirstName(e.target.value)}
          className="signin-input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastname}
          onChange={(e) => setLastName(e.target.value)}
          className="signin-input"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="signin-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signin-input"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="signin-input"
        />
        {error && (
          <Alert variant="danger" className="signin-error">
            {error}
          </Alert>
        )}
        <button onClick={handleSignUp} className="signin-button">
          Sign Up
        </button>

        <div className="signup-link">
          Already have an account? <Link to="/">Sign In</Link>
        </div>
      </div>
    </>
  );
};

export default Signup;
