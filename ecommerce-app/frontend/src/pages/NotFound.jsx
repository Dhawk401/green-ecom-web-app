import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'; // Assuming you have a CSS file for styles

const NotFound = () => {
  return (
    <div className="notfound-wrapper">
      <h1 className="notfound-code">404</h1>
      <p className="notfound-message">Oops! Page not found.</p>
      <Link to="/" className="notfound-button">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
