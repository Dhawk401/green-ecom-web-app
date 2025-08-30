import React from "react";
import '../styles/ProfileAvatar.css';

const ProfileAvatar = () => {
  return (
    <div className="navbar-avatar profile-dropdown-container">
      <img 
        src="/assets/cat-sweetcorn.jpg" 
        alt="Profile" 
        className="navbar-avatar-image" 
      />
    </div>
  );
};

export default ProfileAvatar;
