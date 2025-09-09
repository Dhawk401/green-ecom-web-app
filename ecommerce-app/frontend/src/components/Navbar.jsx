import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { FaShoppingCart } from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logoutUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // 🔹 mobile menu state
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/");
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <>
      {/* Sticky Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo">
            <img
              src="/assets/image.png"
              alt="GreenSure Logo"
              className="logo-img"
            />
          </NavLink>

          {/* Desktop Nav links */}
          <nav className="navbar-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
              Home
            </NavLink>
            <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>
              Shop
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
              Contact
            </NavLink>
          </nav>

          {/* Icons + Hamburger (far right) */}
          <div className="navbar-icons">
            <NavLink to="/cart" className="cart-link">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>

            {user && !isProfilePage ? (
              <div className="profile-dropdown-container">
                <div onClick={() => setDropdownOpen((prev) => !prev)}>
                  <ProfileAvatar />
                </div>
              </div>
            ) : (
              !user && (
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                  LOG IN
                </NavLink>
              )
            )}

            {/* 🔹 Hamburger beside profile/cart */}
            <div
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay when menu or profile dropdown is open */}
      <div
        className={`menu-overlay ${(menuOpen || dropdownOpen) ? "open" : ""}`}
        onClick={() => {
          setMenuOpen(false);
          setDropdownOpen(false);
        }}
      ></div>

      {/* 🔹 Mobile Menu (sibling, outside navbar) */}
      {menuOpen && (
        <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </nav>
      )}

      {/* 🔹 Profile Dropdown (sibling, outside navbar) */}
      {dropdownOpen && (
        <div className="profile-dropdown">
          <button
            onClick={() => {
              navigate("/profile");
              setDropdownOpen(false);
            }}
          >
            Profile
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </>
  );
};

export default Navbar;
