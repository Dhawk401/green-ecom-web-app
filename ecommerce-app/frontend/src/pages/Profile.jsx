import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiEdit2 } from "react-icons/fi";
import { MdOutlineSecurity } from "react-icons/md";
import { FaQuestionCircle, FaInfoCircle, FaWallet } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import "../styles/Profile.css";

const Profile = () => {
  const { user, logoutUser, loginUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      logoutUser();
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          // ✅ Sync backend-provided user data
          loginUser(data.name, data.email, data.role);
        } else {
          logoutUser();
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        logoutUser();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logoutUser, loginUser, navigate]);

  if (loading || !user) return <p>Loading profile...</p>;

  return (
    <div className="modern-profile-wrapper">
      <div className="modern-profile-card">
        {/* 🔹 Profile Top */}
        <div className="profile-top">
          <img
            src="/assets/cat-sweetcorn.jpg"
            alt="avatar"
            className="profile-avatar"
          />
          <div className="profile-info1">
            <h3>{user.name || "User Name"}</h3>
            <p>@{(user.name || "username").toLowerCase().replace(/\s+/g, "")}</p>
          </div>
          <FiEdit2
            className="edit-icon"
            onClick={() => navigate("/edit-profile")}
          />
        </div>

        {/* 🔹 Wallet option */}
        <div className="profile-option" onClick={() => navigate("/wallet")}>
          <div className="left">
            <FaWallet className="icon" />
            <div className="text-block">
              <p>Wallet</p>
              <span>Check balance & transactions</span>
            </div>
          </div>
        </div>

        {/* 🔹 My Account */}
        <div
          className="profile-option"
          onClick={() =>
            user.isAccountComplete
              ? navigate("/account-details")
              : navigate("/complete-account")
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

        {/* 🔹 My Orders */}
        <div className="profile-option" onClick={() => navigate("/orders")}>
          <div className="left">
            <BsBoxSeam className="icon" />
            <div className="text-block">
              <p>My Orders</p>
              <span>Track your orders and history</span>
            </div>
          </div>
        </div>

        {/* 🔹 Security (disabled for now) */}
        <div className="profile-option disabled">
          <div className="left">
            <MdOutlineSecurity className="icon" />
            <div className="text-block">
              <p>Two-Factor Authentication</p>
            </div>
          </div>
        </div>

        {/* 🔹 Logout */}
        <div
          className="profile-option logout"
          onClick={() => {
            logoutUser();
            localStorage.removeItem("token");
            localStorage.removeItem("cart");
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
        >
          <div className="left">
            <FiLogOut className="icon" />
            <div className="text-block">
              <p>Log out</p>
              <span>Clear all data & secure exit</span>
            </div>
          </div>
        </div>

        {/* 🔹 Help & About Section */}
        <div className="profile-section">
          <div className="profile-option" onClick={() => navigate("/help")}>
            <div className="left">
              <FaQuestionCircle className="icon" />
              <div className="text-block1">
                <p>Help & Support</p>
              </div>
            </div>
          </div>

          <div className="profile-option" onClick={() => navigate("/about")}>
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
