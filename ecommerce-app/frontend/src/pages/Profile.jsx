import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiEdit2, FiShoppingBag } from 'react-icons/fi';
import '../styles/Profile.css'; // Assuming you have a CSS file for styles

const Profile = () => {
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) navigate('/signup');
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="modern-profile-wrapper">
      <div className="modern-profile-card">
        <div className="profile-top">
          <img src="/assets/avatar.png" alt="avatar" className="profile-avatar" />
          <div className="profile-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
          <FiEdit2 className="edit-icon" onClick={() => navigate('/edit-profile')} />
        </div>

        <div className="profile-option" onClick={() => navigate('/edit-profile')}>
          <FiUser />
          <span>Edit Account</span>
        </div>
        <div className="profile-option" onClick={() => navigate('/orders')}>
          <FiShoppingBag />
          <span>My Orders</span>
        </div>
        <div className="profile-option logout" onClick={() => {
          logoutUser();
          navigate('/');
        }}>
          <FiLogOut />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
