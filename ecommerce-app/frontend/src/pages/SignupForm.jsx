import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/SignupForm.css';

const SignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const isEmail = form.email.includes('@');
    const userData = {
      name: form.name.trim(),
      email: isEmail ? form.email.trim() : '',
      phone: isEmail ? '' : form.email.trim(),
      password: form.password
    };

    localStorage.setItem("user", JSON.stringify(userData));
    navigate('/login');
  };

  return (
    <div className="signup-wrapper">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-title">Create an account</h2>
        <h2 className="signup-title">Continue with Email / Phone number</h2>
        <p className="signup-subtext">
          Already have an account? <Link to="/login" className="signup-link">Log in</Link>
        </p>

        <label className="signup-label">What should we call you?</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your profile name"
          className="signup-input"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label className="signup-label">What's your email or phone number?</label>
        <input
          type="text"
          name="email"
          placeholder="Enter your email or phone number"
          className="signup-input"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="signup-label">Create a password</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            className="signup-input"
            value={form.password}
            onChange={handleChange}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>

        <label className="signup-label">Confirm password</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm your password"
            className="signup-input"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>

        <p className="terms-text">
          By creating an account, you agree to the <a href="#">Terms of use</a> and <a href="#">Privacy Policy</a>.
        </p>

        <button
          type="submit"
          className="signup-submit"
          disabled={!form.name || !form.email || !form.password || !form.confirmPassword}
        >
          Continue
        </button>

        <p className="signup-or">OR Continue with</p>
        <div className="social-login">
          <button type="button" className="social-btn"><i className="fab fa-facebook-f"></i> Facebook</button>
          <button type="button" className="social-btn"><i className="fab fa-google"></i> Google</button>
          <button type="button" className="social-btn"><i className="fab fa-apple"></i> Apple</button>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
