import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Login.css";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useUser();
  const navigate = useNavigate();

  const splitName = (name = "") => {
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token = data.access_token;

      // Map backend -> our user shape
      const { firstName, lastName } = splitName(data.name || "");
      const user = {
        // identity
        name: data.name || "",
        firstName,
        lastName,
        email: data.email || identifier.trim(),
        phone: data.phone || "",
        // profile
        bio: data.bio || "",
        profileImage: data.profile_picture || "",
        gender: data.gender || "",
        // address (if backend returns them)
        street: data.street || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        // accounts (let CompleteAccount manage creation)
        userType: data.userType || "retail",
        availableAccounts: Array.isArray(data.availableAccounts)
          ? data.availableAccounts
          : [],

        // For edit page logic (optional)
        signupType: "email",
        isAccountComplete: Boolean(data.isAccountComplete),
        completedAt: data.completedAt || null,

        // wholesale fields if returned (optional)
        establishmentName: data.establishmentName || "",
        designation: data.designation || "",
        establishmentPhone: data.establishmentPhone || "",
        establishmentAddress: data.establishmentAddress || "",
        gstNumber: data.gstNumber || "",
      };

      // Persist token and user for the app
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update context
      loginUser(user);

      // Go to profile
      navigate("/profile");
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Log in</h2>
        <p className="login-subtext">
          New to Design Space?{" "}
          <Link to="/signup" className="login-link">
            Sign up for free
          </Link>
        </p>

        <input
          className="login-input"
          type="email"
          placeholder="Email address"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
        />

        <div className="password-wrapper">
          <input
            className="login-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <i
            className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} toggle-password`}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
            role="button"
            tabIndex={0}
          ></i>
        </div>

        <div className="forgot-password">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={!identifier || !password || loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="social-login">
          <button type="button" className="social-btn facebook">
            <i className="fab fa-facebook-f"></i>
          </button>
          <button type="button" className="social-btn apple">
            <i className="fab fa-apple"></i>
          </button>
          <button type="button" className="social-btn google">
            <i className="fab fa-google"></i>
          </button>
          <button type="button" className="social-btn twitter">
            <i className="fab fa-twitter"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
