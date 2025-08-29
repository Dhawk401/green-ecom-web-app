import React from "react";
import "../styles/ProfileAvatar.css";

const ProfileAvatar = () => {
  return (
    <div className="profile-avatar" style={{ position: "relative" }}>
      <img
        src="/assets/cat-sweetcorn.jpg"
        alt="Profile"
        className="profile-image"
      />
      <div className="logout-tooltip">Logout</div>
    </div>
  );
};

export default ProfileAvatar;
