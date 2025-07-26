import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/CompleteAccount.css';

const CompleteAccount = () => {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
  });

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) console.log('Selected file:', file.name);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isComplete = Object.values(formData).every(val => val.trim() !== '');

    if (!isComplete) {
      alert("Please fill in all fields.");
      return;
    }

    updateUser({
      ...formData,
      isAccountComplete: true,
    });

    navigate('/account-details');
  };

  return (
    <div className="edit-account">
      <div className="header">
        <button className="back-btn1" onClick={() => navigate('/profile')}>←</button>
        <h2>Complete Account</h2>
      </div>

      <div className="profile-image-section">
        <img src="/assets/cat-sweetcorn.jpg" alt="Profile" className="profile-img" />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        <div className="upload-wrapper">
          <label htmlFor="profile-upload" className="upload-btn">Upload New Photo</label>
          <input type="file" id="profile-upload" className="upload-input" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>

      <form className="edit-form" onSubmit={handleSubmit}>
        <label>First Name</label>
        <input name="firstName" type="text" placeholder="John" value={formData.firstName} onChange={handleChange} />

        <label>Last Name</label>
        <input name="lastName" type="text" placeholder="Doe" value={formData.lastName} onChange={handleChange} />

        <label>Gender</label>
        <input name="gender" type="text" placeholder="Male / Female / Other" value={formData.gender} onChange={handleChange} />

        <label>Phone Number</label>
        <input name="phone" type="tel" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />

        <label>Street Address</label>
        <input name="street" type="text" placeholder="123 Main Street" value={formData.street} onChange={handleChange} />

        <label>City</label>
        <input name="city" type="text" placeholder="Mumbai" value={formData.city} onChange={handleChange} />

        <label>ZIP Code</label>
        <input name="zip" type="text" placeholder="400001" value={formData.zip} onChange={handleChange} />

        <button className="update-btn" type="submit">Update</button>
      </form>
    </div>
  );
};

export default CompleteAccount;
