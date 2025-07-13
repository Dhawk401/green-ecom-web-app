import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors',
      });

      const data = await res.json();
      console.log('Login response:', data); // ✅ Debug line

      if (res.ok && data.access_token) {
        // ✅ Save token to localStorage
        localStorage.setItem('token', data.access_token);

        // ✅ Update user context
        loginUser(data.name, data.email);

        // ✅ Redirect after login
        const params = new URLSearchParams(location.search);
        const redirectTo = params.get('redirectTo') || '/profile';
        navigate(redirectTo);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>
        <input
          className="login-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="login-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Login</button>
        <p className="login-footer-text">
          Don’t have an account?{' '}
          <Link to="/signup" className="login-link">Sign up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
