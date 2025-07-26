import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import ProfileAvatar from './ProfileAvatar'; // Importing the ProfileAvatar component

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <NavLink to="/" className="navbar-logo">
            <img src="/assets/image.png" alt="GreenSure Logo" className="logo-img" />
          </NavLink>

          <nav className="navbar-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'active' : ''}>Shop</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
          </nav>

          <div className="navbar-icons">
            <NavLink to="/cart" className="cart-link">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>
            <NavLink to="/profile" className="profile-avatar">
              <ProfileAvatar />
            </NavLink>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
