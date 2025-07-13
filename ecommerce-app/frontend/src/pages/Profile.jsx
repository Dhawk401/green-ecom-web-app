import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiEdit2, FiShoppingBag } from 'react-icons/fi';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logoutUser, loginUser } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // 🔒 If no token, redirect to login
    if (!token) {
      logoutUser();
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          loginUser(data.name, data.email); // Sync context
        } else if (res.status === 401) {
          logoutUser();
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          console.error('Unexpected error:', res.status);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        alert('Could not load profile. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, logoutUser, loginUser]);

  if (loading) return <p>Loading profile...</p>;
  if (!profileData) return null;

  return (
    <div className="modern-profile-wrapper">
      <div className="modern-profile-card">
        <div className="profile-top">
          <img
            src={profileData.profile_picture || '/assets/avatar.png'}
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h3>{profileData.name}</h3>
            <p>{profileData.email}</p>
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
          localStorage.removeItem('token');
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
