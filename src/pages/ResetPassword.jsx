import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim() || !confirm.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    // 🔗 Call backend API to reset password
    alert("Password has been reset successfully.");
    navigate("/login");
  };

  return (
    <div className="reset-wrapper">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">
          Create a new password for your account.
        </p>

        <input
          type="password"
          placeholder="New Password"
          className="reset-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="reset-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        <button type="submit" className="reset-btn">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
