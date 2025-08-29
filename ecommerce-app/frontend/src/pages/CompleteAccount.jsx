import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/CompleteAccount.css";

const CompleteAccount = () => {
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // If coming from "Create Retail Account"
  const presetRole = location.state?.presetRole === "retail" ? "retail" : null;

  const [role, setRole] = useState(presetRole || "retail");
  const [step, setStep] = useState(1);
  const isWholesale = role === "wholesale";

  const [photoPreview, setPhotoPreview] = useState("/assets/cat-sweetcorn.jpg");
  const [showRetailHint, setShowRetailHint] = useState(Boolean(presetRole));

  useEffect(() => {
    if (presetRole === "retail") {
      setRole("retail");
      setStep(1);
      setShowRetailHint(true);
    }
  }, [presetRole]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    establishmentName: "",
    designation: "",
    establishmentPhone: "",
    establishmentAddress: "",
    gstNumber: "",
  });

  const handleUserTypeToggle = () => {
    setRole((prev) => (prev === "retail" ? "wholesale" : "retail"));
    setStep(1);
    setShowRetailHint(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result.toString());
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateStep1 = () => {
    const required = [
      "firstName", "lastName", "gender", "email",
      "phone", "street", "city", "state", "zip"
    ];
    return required.every((k) => String(formData[k] || "").trim() !== "");
  };

  const validateStep2 = () => {
    if (!isWholesale) return true;
    const required = [
      "establishmentName", "designation",
      "establishmentPhone", "establishmentAddress", "gstNumber"
    ];
    return required.every((k) => String(formData[k] || "").trim() !== "");
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      alert("Please fill in all personal details.");
      return;
    }
    if (isWholesale) {
      setStep(2);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();

    if (isWholesale && !validateStep2()) {
      alert("Please fill in all business details.");
      return;
    }

    updateUser((prev) => {
      const setAvail = new Set(prev?.availableAccounts || []);
      setAvail.add(role);
      return {
        ...prev,
        ...formData,
        userType: role,
        availableAccounts: Array.from(setAvail),
        isAccountComplete: true,
        profileImage: photoPreview,
        completedAt: Date.now(),
      };
    });

    navigate("/account-details");
  };

  return (
    <div className="edit-account">
      {/* Header */}
      <div className="header">
        {step === 2 && isWholesale && (
          <button
            className="back-btn1"
            onClick={() => setStep(1)}
            aria-label="Back"
          >
            ←
          </button>
        )}
        <h2>Complete Account</h2>
      </div>

      {/* Retail / Wholesale Toggle */}
      <div className="user-type-toggle">
        <span className={role === "retail" ? "active" : ""}>Retail</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={role === "wholesale"}
            onChange={handleUserTypeToggle}
          />
          <span className="slider"></span>
        </label>
        <span className={role === "wholesale" ? "active" : ""}>Wholesale</span>
      </div>

      {showRetailHint && role === "retail" && (
        <div className="hint-banner">
          You’re creating a Retail account. Please enter only your personal details.
        </div>
      )}

      {/* Profile Image */}
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
            Upload New Photo
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        className="edit-form"
        onSubmit={step === 1 ? handleNext : handleFinalSubmit}
      >
        {/* Step 1: Personal */}
        {step === 1 && (
          <>
            <div className="row">
              <div className="col">
                <label>First Name</label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label>Last Name</label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="col">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Street Address</label>
            <input
              name="street"
              type="text"
              value={formData.street}
              onChange={handleChange}
              required
            />

            <div className="row">
              <div className="col">
                <label>City</label>
                <input
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label>State</label>
                <input
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>ZIP Code</label>
            <input
              name="zip"
              type="text"
              value={formData.zip}
              onChange={handleChange}
              required
            />

            <button className="update-btn" type="submit">
              {isWholesale ? "Next" : "Update"}
            </button>
          </>
        )}

        {/* Step 2: Business (wholesale only) */}
        {step === 2 && isWholesale && (
          <>
            <div className="row">
              <div className="col">
                <label>Name of the Establishment</label>
                <input
                  name="establishmentName"
                  type="text"
                  value={formData.establishmentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label>Designation</label>
                <input
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Phone Number to Register</label>
                <input
                  name="establishmentPhone"
                  type="tel"
                  value={formData.establishmentPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col">
                <label>GSTIN No.</label>
                <input
                  name="gstNumber"
                  type="text"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label>Establishment Address (with Pin)</label>
            <input
              name="establishmentAddress"
              type="text"
              value={formData.establishmentAddress}
              onChange={handleChange}
              required
            />

            <div className="step-buttons">
              <button
                type="button"
                className="update-btn"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button className="update-btn" type="submit">
                Update
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CompleteAccount;
