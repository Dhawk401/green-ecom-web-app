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
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu state
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, placement: "bottom" });
  const avatarBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePage = location.pathname === "/profile";

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/");
  };

  // Ensure closed when navigating to profile page (prevents overlays)
  useEffect(() => {
    if (isProfilePage) {
      setDropdownOpen(false);
      setMenuOpen(false);
    }
  }, [isProfilePage]);

  // Helper: get viewport dimensions using visualViewport when available
  const getViewport = () => {
    if (window.visualViewport) {
      return {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        offsetTop: window.visualViewport.offsetTop || 0,
        offsetLeft: window.visualViewport.offsetLeft || 0,
      };
    }
    return { width: window.innerWidth, height: window.innerHeight, offsetTop: 0, offsetLeft: 0 };
  };

  // Compute preferred position (initial) and then measure dropdown to flip if needed.
  const computeAndAdjustPosition = () => {
    const avatar = avatarBtnRef.current;
    const dropdown = dropdownRef.current;

    if (!avatar || !dropdown) return;

    const avatarRect = avatar.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect(); // current size
    const vp = getViewport();

    const gap = 10; // px gap between avatar and dropdown
    const margin = 8; // viewport margin

    // default prefer below avatar and right-align with avatar right edge if possible
    let left = Math.round(Math.min(Math.max(margin, avatarRect.right - dropdownRect.width), vp.width - dropdownRect.width - margin));
    // default top below avatar
    let top = Math.round(avatarRect.bottom + gap - vp.offsetTop);

    // Check if there's enough space below; if not, place above avatar
    const spaceBelow = vp.height - (avatarRect.bottom - vp.offsetTop) - gap;
    const spaceAbove = avatarRect.top - vp.offsetTop - gap;

    let placement = "bottom";
    if (spaceBelow < dropdownRect.height && spaceAbove >= dropdownRect.height) {
      // place above
      top = Math.round(avatarRect.top - dropdownRect.height - gap - vp.offsetTop);
      placement = "top";
    } else if (spaceBelow < dropdownRect.height && spaceAbove < dropdownRect.height) {
      // neither side fits fully -> clamp to fit inside viewport, prefer below
      if (spaceBelow >= spaceAbove) {
        // clamp dropdown bottom to viewport bottom
        top = Math.round(Math.max(margin - vp.offsetTop, vp.height - dropdownRect.height - margin - vp.offsetTop));
        placement = "bottom";
      } else {
        // clamp to top
        top = Math.round(Math.max(margin - vp.offsetTop, margin - vp.offsetTop));
        placement = "top";
      }
    }

    // Final clamp left
    if (left + dropdownRect.width + margin > vp.width) {
      left = Math.max(margin, vp.width - dropdownRect.width - margin);
    }
    if (left < margin) left = margin;

    // set position (we'll render using fixed coordinates relative to viewport)
    setDropdownPos({ top, left, placement });
  };

  // When dropdownOpen changes to true, wait for dropdown to render then compute position.
  useEffect(() => {
    if (!dropdownOpen) return;

    // small delay to ensure dropdown is in DOM and layout stable
    const rafId = requestAnimationFrame(() => {
      // allow one frame to render children then compute
      computeAndAdjustPosition();
    });

    // Also listen for orientationchange, resize, scroll (capture) to keep alignment
    const onResize = () => computeAndAdjustPosition();
    const onScroll = () => computeAndAdjustPosition();
    const onOrientation = () => setTimeout(computeAndAdjustPosition, 50); // slight delay after orientation change

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    // capture scrolls from any container
    window.addEventListener("scroll", onScroll, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onScroll);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      window.removeEventListener("scroll", onScroll, true);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", onResize);
        window.visualViewport.removeEventListener("scroll", onScroll);
      }
    };
  }, [dropdownOpen]);

  // Close dropdown/menu on outside click or Escape
  useEffect(() => {
    const onOutside = (e) => {
      if (!dropdownOpen && !menuOpen) return;
      const target = e.target;
      if (avatarBtnRef.current && avatarBtnRef.current.contains(target)) return; // clicked avatar
      if (dropdownRef.current && dropdownRef.current.contains(target)) return; // inside dropdown
      // clicked outside
      setDropdownOpen(false);
      setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen, menuOpen]);

  return (
    <>
      {/* Sticky Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo">
            <img src="/assets/image.png" alt="GreenSure Logo" className="logo-img" />
          </NavLink>

          {/* Desktop Nav links */}
          <nav className="navbar-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>Home</NavLink>
            <NavLink to="/shop" className={({ isActive }) => (isActive ? "active" : "")}>Shop</NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>Contact</NavLink>
          </nav>

          {/* Icons + Hamburger (far right) */}
          <div className="navbar-icons">
            <NavLink to="/cart" className="cart-link" aria-label="Cart">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </NavLink>

            {user && !isProfilePage ? (
              <div className="profile-dropdown-container">
                <div
                  ref={avatarBtnRef}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                  tabIndex={0}
                >
                  <ProfileAvatar />
                </div>
              </div>
            ) : (
              !user && (
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>LOG IN</NavLink>
              )
            )}

            {/* Hamburger */}
            <div
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              role="button"
              aria-label="menu"
              tabIndex={0}
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

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
        </nav>
      )}

      {/* Fixed dropdown drawn relative to viewport */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="profile-dropdown-fixed"
          style={{
            position: "fixed",
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: 220,
            maxWidth: "calc(100% - 16px)",
          }}
          role="menu"
        >
          <button
            className="dropdown-item"
            onClick={() => {
              navigate("/profile");
              setDropdownOpen(false);
            }}
          >
            Profile
          </button>
          <button className="dropdown-item" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </>
  );
};

export default Navbar;
