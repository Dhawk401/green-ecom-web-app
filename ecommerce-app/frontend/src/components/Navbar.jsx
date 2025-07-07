import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css'; // Assuming you have a CSS file for styles
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo">Gromania</NavLink>
        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Shop</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
        </nav>
        <div className="navbar-icons">
          <NavLink to="/cart" className={({ isActive }) => `nav-link cart-link ${isActive ? 'active' : ''}`}>
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><FaUser /></NavLink>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
