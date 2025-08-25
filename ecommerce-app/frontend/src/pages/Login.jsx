import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      const token = data.access_token;
      const user = {
        name: data.name,
        email: data.email,
        bio: data.bio,
        profile_picture: data.profile_picture
};

      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update context
      loginUser(user);

      // Navigate
      navigate('/profile');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Log in</h2>
        <p className="login-subtext">
          New to Design Space?{' '}
          <Link to="/signup" className="login-link">Sign up for free</Link>
        </p>

        <input
          className="login-input"
          type="text"
          placeholder="Email address or phone number"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />

        <div className="password-wrapper">
          <input
            className="login-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i
            className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          ></i>
        </div>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={!identifier || !password}
        >
          Log in
        </button>

        <div className="social-login">
          <button type="button" className="social-btn facebook"><i className="fab fa-facebook-f"></i></button>
          <button type="button" className="social-btn apple"><i className="fab fa-apple"></i></button>
          <button type="button" className="social-btn google"><i className="fab fa-google"></i></button>
          <button type="button" className="social-btn twitter"><i className="fab fa-twitter"></i></button>
        </div>
      </form>
    </div>
  );
};

export default Login;
