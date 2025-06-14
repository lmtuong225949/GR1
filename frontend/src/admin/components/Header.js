import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import "../styles/Header.css";

const Header = ({ username = "Admin", onLogout }) => {
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

  // Đóng dropdown khi click ra ngoài
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
        <div className="logo">TRƯỜNG THPT CHUYÊN TTHG</div>
      </div>

      <div className="user-header_actions">
        <Link to="/admin/notifications" className="user-header_notification">
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
                <div className="user-role">Quản trị viên</div>
              </div>
              <Link to="/admin/profile" className="user-header_dropdown-item">
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
