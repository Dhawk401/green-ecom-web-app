// AccountDetails.jsx
import React from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/AccountDetails.css";
import { FiArrowLeft, FiEdit } from "react-icons/fi";

const AccountDetails = () => {
  const { user, switchUserType } = useUser();
  const navigate = useNavigate();

  const safeUser = user || {};
  // Do NOT auto-add defaults; rely on what CompleteAccount saved
  const available = Array.isArray(safeUser.availableAccounts)
    ? safeUser.availableAccounts
    : [];
  const activeType = safeUser.userType || "retail";

  const fullAddress = [safeUser.street, safeUser.city, safeUser.state, safeUser.zip]
    .filter(Boolean)
    .join(", ");

  const fullName = `${safeUser.firstName || ""} ${safeUser.lastName || ""}`.trim();

  const handleCreateRetail = () => {
    // If retail already exists, just switch to it
    if (available.includes("retail")) {
      if (typeof switchUserType === "function") switchUserType("retail");
      return;
    }
    // Otherwise guide + navigate to retail creation
    alert(
      "You're creating a Retail account.\n\nPlease fill ONLY your personal details. Organizational/business details are not required for Retail."
    );
    navigate("/complete-account", { state: { presetRole: "retail" } });
  };

  const handleSwitch = (type) => {
    if (available.includes(type)) {
      if (typeof switchUserType === "function") switchUserType(type);
      return;
    }
    // Only allow creating Retail from Wholesale in UI
    if (type === "retail" && activeType === "wholesale") {
      alert(
        "You're creating a Retail account.\n\nPlease fill ONLY your personal details."
      );
      navigate("/complete-account", { state: { presetRole: "retail" } });
    }
  };

  // Show wholesale pill if wholesale exists or is currently active
  const showWholesalePill =
    activeType === "wholesale" || available.includes("wholesale");

  const shouldShowCreateRetailCTA =
    activeType === "wholesale" && !available.includes("retail");

  return (
    <div className="account-details">
      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate("/profile")}>
        <FiArrowLeft />
      </button>

      {/* Header */}
      <h2 className="header">
        Your Account Details
        <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
          <FiEdit /> Edit
        </button>
      </h2>

      {/* Account Switcher */}
      <div className="account-switcher">
        <button
          type="button"
          className={`switch-pill ${activeType === "retail" ? "active" : ""}`}
          onClick={() => handleSwitch("retail")}
        >
          Retail
        </button>

        {showWholesalePill && (
          <button
            type="button"
            className={`switch-pill ${activeType === "wholesale" ? "active" : ""}`}
            onClick={() => handleSwitch("wholesale")}
          >
            Wholesale
          </button>
        )}
      </div>

      {/* Optional hint for wholesale users who haven't created retail yet */}
      {shouldShowCreateRetailCTA && (
        <div className="hint-banner" style={{ marginTop: 8 }}>
          You’re on a Wholesale account. You can also create a Retail account for
          personal purchases.
        </div>
      )}

      {/* Profile Card */}
      <div className="profile-card">
        <img
          src={safeUser.profileImage || "/assets/cat-sweetcorn.jpg"}
          alt="Profile"
          className="profile-avatar"
        />
        <div className="profile-info">
          <h3>{fullName || "Unnamed User"}</h3>
          <p>{safeUser.email || "No email provided"}</p>
          <span className="badge">{activeType}</span>
        </div>
      </div>

      {/* Personal Info */}
      <div className="section">
        <h3>Personal Information</h3>
        <div className="details-section">
          <div className="info-group">
            <strong>Gender:</strong> {safeUser.gender || "Not specified"}
          </div>
          <div className="info-group">
            <strong>Phone:</strong> {safeUser.phone || "Not provided"}
          </div>
          <div className="info-group">
            <strong>Address:</strong> {fullAddress || "Not provided"}
          </div>
        </div>
      </div>

      {/* Wholesale-only fields + Create Retail CTA */}
      {activeType === "wholesale" && (
        <div className="section">
          <h3>Business Information</h3>
          <div className="details-section">
            <div className="info-group">
              <strong>Establishment:</strong>{" "}
              {safeUser.establishmentName || "Not provided"}
            </div>
            <div className="info-group">
              <strong>Designation:</strong>{" "}
              {safeUser.designation || "Not provided"}
            </div>
            <div className="info-group">
              <strong>Registered Phone:</strong>{" "}
              {safeUser.establishmentPhone || "Not provided"}
            </div>
            <div className="info-group">
              <strong>Establishment Address:</strong>{" "}
              {safeUser.establishmentAddress || "Not provided"}
            </div>
            <div className="info-group">
              <strong>GSTIN:</strong>{" "}
              {safeUser.gstNumber || "Pending verification"}
            </div>
          </div>

          {shouldShowCreateRetailCTA && (
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="edit-btn"
                type="button"
                onClick={handleCreateRetail}
                title="Create a separate Retail account using just personal details"
              >
                Create Retail Account
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountDetails;
