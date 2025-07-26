// AccountDetails.jsx
import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountDetails.css';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';

const AccountDetails = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const fullAddress = [user.street, user.city, user.zip]
    .filter(Boolean)
    .join(', ');

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return (
    <div className="account-details">
      <h2 className="header">
        Your Account Details
        <button className="edit-btn" onClick={() => navigate('/edit-profile')}>
          <FiEdit /> Edit
        </button>
      </h2>

      <div className="info-group"><strong>Name:</strong> {fullName || 'Not provided'}</div>
      <div className="info-group"><strong>Gender:</strong> {user.gender || 'Not specified'}</div>
      <div className="info-group"><strong>Email:</strong> {user.email}</div>
      <div className="info-group"><strong>Phone:</strong> {user.phone || 'Not provided'}</div>
      <div className="info-group"><strong>Address:</strong> {fullAddress || 'Not provided'}</div>

      <button className="back-btn" onClick={() => navigate('/profile')}>
        <FiArrowLeft />
      </button>
    </div>
  );
};

export default AccountDetails;
