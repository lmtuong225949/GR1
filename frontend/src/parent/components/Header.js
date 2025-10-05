import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import "../../components/ui/styles/Header.css";

const Header = ({ username = "parent", onLogout }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const dropdownRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const toggleProfileDropdown = () => {
    setProfileOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notifications/count");
        const data = await response.json();
        setNotificationCount(data.count);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
  }, []);

  return (
    <header className="header">
      <div className="header-top">
      <div className="logo"><img src="/TTHG school.png" alt="TTHG school" /></div>
        <div className="name">
          <h1>TRƯỜNG THPT TRẦN ĐẠI NGHĨA</h1>
        </div>
      </div>

      <div className="user-header_actions">
        <Link to="/parent/notifications" className="user-header_notification">
          <Bell />
          {notificationCount > 0 && (
            <span className="user-header_notification-badge">{notificationCount}</span>
          )}
        </Link>

        <div className="user-header_avatar-wrapper" onClick={toggleProfileDropdown} ref={dropdownRef}>
          <img
            src="https://i.pravatar.cc/27"
            alt="avatar"
            className="user-header_avatar"
          />
          {profileOpen && (
            <div className="user-header_dropdown">
              <div className="user-header_dropdown-item user-info-box">
                <div className="user-name">{username}</div>
                <div className="user-role">Phụ huynh</div>
              </div>
              <Link to="/parent/profile" className="user-header_dropdown-item">
                Hồ sơ
              </Link>
              <button onClick={handleLogout} className="user-header_dropdown-item logout-button">
                <LogOut className="logout-icon" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
