import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { MdOutlineSecurity } from 'react-icons/md';
import { FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { BsBoxSeam } from 'react-icons/bs';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logoutUser, loginUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [useFakeBackend, setUseFakeBackend] = useState(true); // ✅ toggle state

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token && !useFakeBackend) {
      // If using real backend and no token → redirect
      logoutUser();
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      if (useFakeBackend) {
        // ✅ FAKE BACKEND MODE
        if (!token) {
          const dummyUser = { name: 'Demo User', email: 'demo@example.com', isAccountComplete: true };
          loginUser(dummyUser.name, dummyUser.email);
          localStorage.setItem('user', JSON.stringify(dummyUser));
          localStorage.setItem('token', 'dummy-token');
        } else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            loginUser(parsedUser.name, parsedUser.email);
          } else {
            const dummyUser = { name: 'Demo User', email: 'demo@example.com', isAccountComplete: true };
            loginUser(dummyUser.name, dummyUser.email);
            localStorage.setItem('user', JSON.stringify(dummyUser));
          }
        }
        setLoading(false);
      } else {
        // ✅ REAL BACKEND MODE
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
            loginUser(data.name, data.email);
          } else {
            logoutUser();
            localStorage.removeItem('token');
            navigate('/login');
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
          logoutUser();
          navigate('/login');
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [useFakeBackend, loginUser, logoutUser, navigate]);

  if (loading || !user) return <p>Loading profile...</p>;

  return (
    <div className="modern-profile-wrapper">
      {/* ✅ Toggle Button */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => setUseFakeBackend(prev => !prev)}
          style={{
            padding: '8px 12px',
            backgroundColor: useFakeBackend ? '#4caf50' : '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {useFakeBackend ? 'Switch to Real Backend' : 'Switch to Fake Backend'}
        </button>
      </div>

      <div className="modern-profile-card">
        <div className="profile-top">
          <img
            src="/assets/cat-sweetcorn.jpg"
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h3>{user.name || 'User Name'}</h3>
            <p>@{(user.name || 'username').toLowerCase().replace(/\s+/g, '')}</p>
          </div>
          <FiEdit2 className="edit-icon" onClick={() => navigate('/edit-profile')} />
        </div>

        <div
          className="profile-option"
          onClick={() =>
            user.isAccountComplete
              ? navigate('/account-details')
              : navigate('/complete-account')
          }
        >
          <div className="left">
            <FiUser className="icon" />
            <div className="text-block">
              <p>My Account</p>
              <span>Make changes to your account</span>
            </div>
          </div>
        </div>

        <div className="profile-option" onClick={() => navigate('/orders')}>
          <div className="left">
            <BsBoxSeam className="icon" />
            <div className="text-block">
              <p>My Orders</p>
              <span>Track your orders and history</span>
            </div>
          </div>
        </div>

        <div className="profile-option">
          <div className="left">
            <MdOutlineSecurity className="icon" />
            <div className="text-block">
              <p>Two-Factor Authentication</p>
              <span>Further secure your account for safety</span>
            </div>
          </div>
        </div>

        <div
          className="profile-option logout"
          onClick={() => {
            logoutUser();
            localStorage.removeItem('token');
            localStorage.removeItem('cart');
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
        >
          <div className="left">
            <FiLogOut className="icon" />
            <div className="text-block">
              <p>Log out</p>
              <span>Further secure your account for safety</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-option" onClick={() => navigate('/help')}>
            <div className="left">
              <FaQuestionCircle className="icon" />
              <div className="text-block1">
                <p>Help & Support</p>
              </div>
            </div>
          </div>

          <div className="profile-option" onClick={() => navigate('/about')}>
            <div className="left">
              <FaInfoCircle className="icon" />
              <div className="text-block1">
                <p>About App</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
