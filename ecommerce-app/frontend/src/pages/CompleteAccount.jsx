import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/CompleteAccount.css';

const CompleteAccount = () => {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Simulate role (could come from backend later)
  const [role] = useState('wholesale'); // change to 'retail' to test retail path
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
    businessName: '',
    businessLocation: '',
    gstNumber: ''
  });

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

  const handleNext = (e) => {
    e.preventDefault();
    const isComplete = Object.values({
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      phone: formData.phone,
      street: formData.street,
      city: formData.city,
      zip: formData.zip
    }).every(val => val.trim() !== '');

    if (!isComplete) {
      alert("Please fill in all fields.");
      return;
    }
    if (role === 'wholesale') {
      setStep(2);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();

    if (role === 'wholesale') {
      const businessComplete = Object.values({
        businessName: formData.businessName,
        businessLocation: formData.businessLocation,
        gstNumber: formData.gstNumber
      }).every(val => val.trim() !== '');
      if (!businessComplete) {
        alert("Please fill in all business details.");
        return;
      }
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
        {step === 2 && (
          <button className="back-btn1" onClick={() => setStep(1)}>←</button>
        )}
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

      <form className="edit-form" onSubmit={step === 1 ? handleNext : handleFinalSubmit}>
        {step === 1 && (
          <>
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

            <button className="update-btn" type="submit">
              {role === 'wholesale' ? 'Next' : 'Update'}
            </button>
          </>
        )}

        {step === 2 && role === 'wholesale' && (
          <>
            <label>Business Name</label>
            <input name="businessName" type="text" placeholder="ABC Traders" value={formData.businessName} onChange={handleChange} />

            <label>Business Location</label>
            <input name="businessLocation" type="text" placeholder="Shop No. 5, Market Road" value={formData.businessLocation} onChange={handleChange} />

            <label>GST Number</label>
            <input name="gstNumber" type="text" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="update-btn" onClick={() => setStep(1)}>Back</button>
              <button className="update-btn" type="submit">Update</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CompleteAccount;
