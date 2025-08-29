import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { FaShoppingCart } from 'react-icons/fa';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logoutUser } = useUser();
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <img src="/assets/image.png" alt="GreenSure Logo" className="logo-img" />
        </NavLink>

        {/* Links */}
        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>Shop</NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>Contact</NavLink>
        </nav>

        {/* Cart + Profile */}
        <div className="navbar-icons">
          <NavLink to="/cart" className="cart-link">
            <FaShoppingCart />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {user ? (
            <div 
              className="profile-container"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
            >
              <img src="/assets/cat-sweetcorn.jpg" alt="Profile" className="profile-avatar" />
              {hover && (
                <div className="logout-dropdown" onClick={handleLogout}>
                  Logout
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
              LOG IN
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
