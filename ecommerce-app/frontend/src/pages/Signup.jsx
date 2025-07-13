import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Signup.css';

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

 const handleSignup = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('http://127.0.0.1:8000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Welcome, ${data.user.name}! Please log in.`);
      navigate('/login');
    } else {
      alert(data.message || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert('Server error. Please try again later.');
  }
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
