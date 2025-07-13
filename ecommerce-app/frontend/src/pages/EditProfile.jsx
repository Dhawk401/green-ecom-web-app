import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css'; // Assuming you have a CSS file for styles

const EditProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const { updateUser } = useUser();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser({
      name: formData.name,
      email: formData.email,
    });
    alert('Profile updated!');
    navigate('/profile');
  };

  return (
    <div className="edit-profile-wrapper">
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <h2 className="edit-profile-title">Edit Profile</h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="edit-profile-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
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
