import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your registered email address.");
      return;
    }
    // 🔗 Call backend to send reset email / OTP here
    alert("Reset link has been sent to your email.");
    navigate("/reset-password");
  };

  return (
    <div className="forgot-wrapper">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h2 className="forgot-title">Forgot Password?</h2>
        <p className="forgot-subtitle">
          Enter your registered email address and we’ll send you a reset link.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          className="forgot-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" className="forgot-btn">
          Send Reset Link
        </button>

        <button
          type="button"
          className="back-login"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
