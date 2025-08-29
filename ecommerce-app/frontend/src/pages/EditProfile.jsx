import React, { useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [photoPreview, setPhotoPreview] = useState(
    user?.profileImage || "/assets/cat-sweetcorn.jpg"
  );

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    gender: user?.gender || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.street || "",
    city: user?.city || "",
    zip: user?.zip || "",
    // wholesale fields (read-only)
    establishmentName: user?.establishmentName || "",
    designation: user?.designation || "",
    establishmentPhone: user?.establishmentPhone || "",
    establishmentAddress: user?.establishmentAddress || "",
    gstNumber: user?.gstNumber || "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ only send personal info updates
    const {
      establishmentName,
      designation,
      establishmentPhone,
      establishmentAddress,
      gstNumber,
      ...personalData
    } = formData;

    updateUser({
      ...personalData,
      profileImage: photoPreview, // ✅ update profile picture
    });

    alert("Profile updated!");
    navigate("/profile");
  };

  return (
    <div className="edit-profile-wrapper">
      <button className="back-btn" onClick={() => navigate("/profile")}>
        ←
      </button>
      <form className="edit-profile-form" onSubmit={handleSubmit}>
        <h2 className="edit-profile-title">Edit Profile</h2>

        {/* Profile Picture Section */}
        <div className="profile-image-section">
          <img src={photoPreview} alt="Profile" className="profile-img" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="upload-input"
            onChange={handleFileChange}
          />
          <div className="upload-wrapper">
            <button type="button" className="upload-btn" onClick={triggerUpload}>
              Change Photo
            </button>
          </div>
        </div>

        {/* Personal Info */}
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

        {/* Email/Phone — respect signup type */}
        {user?.signupType === "email" && (
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
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

        <div className="row">
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
        </div>

        {/* Wholesale-only (read-only) */}
        {user?.userType === "wholesale" && (
          <div className="wholesale-section">
            <h3 className="wholesale-title">Business Information</h3>
            <p className="note">
              Editing business details requires admin approval.
            </p>
            <input
              type="text"
              value={formData.establishmentName}
              disabled
              className="edit-profile-input disabled"
            />
            <input
              type="text"
              value={formData.designation}
              disabled
              className="edit-profile-input disabled"
            />
            <input
              type="tel"
              value={formData.establishmentPhone}
              disabled
              className="edit-profile-input disabled"
            />
            <input
              type="text"
              value={formData.establishmentAddress}
              disabled
              className="edit-profile-input disabled"
            />
            <input
              type="text"
              value={formData.gstNumber}
              disabled
              className="edit-profile-input disabled"
            />
          </div>
        )}

        <button type="submit" className="edit-profile-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
