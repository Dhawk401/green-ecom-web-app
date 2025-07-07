import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Signup.css'; // Assuming you have a CSS file for styles

const Signup = () => {
  const navigate = useNavigate();
  const { loginUser } = useUser();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Save user to localStorage
    const userData = {
      name: form.name,
      email: form.email,
      password: form.password, // You can hash this in real apps
    };
    localStorage.setItem('user', JSON.stringify(userData));

    // Optionally save to context immediately (or just redirect to login)
    loginUser(form.name, form.email);

    // Redirect to login
    navigate('/login');
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-title">Sign Up</h2>
        <input
          name="name"
          className="signup-input"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          className="signup-input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          className="signup-input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="signup-button">Sign Up</button>
        <p className="signup-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="signup-link">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
