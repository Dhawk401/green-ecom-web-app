import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    gender: user?.gender || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.street || '',
    city: user?.city || '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    alert('Profile updated!');
    navigate('/profile');
  };

  return (
    <div className="edit-profile-wrapper">
      <button className="back-btn" onClick={() => navigate('/profile')}>←</button>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <h2 className="edit-profile-title">Edit Profile</h2>

        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="edit-profile-input1"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {user?.signupType === 'email' && (
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="edit-profile-input"
          />
        )}

        {user?.signupType === 'phone' && (
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="edit-profile-input"
          />
        )}

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <input
          type="text"
          name="street"
          placeholder="Street Address"
          value={formData.street}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <input
          type="text"
          name="zip"
          placeholder="ZIP Code"
          value={formData.zip}
          onChange={handleChange}
          className="edit-profile-input"
        />

        <button type="submit" className="edit-profile-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
