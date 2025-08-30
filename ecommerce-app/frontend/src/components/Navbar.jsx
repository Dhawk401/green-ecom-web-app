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
  const dropdownRef = useRef(null);   // 🔹 reference for dropdown container
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

  // 🔹 Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">
          <img src="/assets/image.png" alt="GreenSure Logo" className="logo-img" />
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>Shop</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>Contact</NavLink>
        </nav>

        <div className="navbar-icons">
          <NavLink to="/cart" className="cart-link">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {user && !isProfilePage ? (
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <div onClick={() => setDropdownOpen((prev) => !prev)}>
                <ProfileAvatar />
              </div>
              {dropdownOpen && (
                <div className="profile-dropdown">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false); // close after navigating
                    }}
                  >
                    Profile
                  </button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            !user && (
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                LOG IN
              </NavLink>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
