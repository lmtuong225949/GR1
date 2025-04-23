import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaChartBar, FaCalendar, FaBell } from "react-icons/fa";
import "../style/MainScreen.css";

const MainScreen = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="main-layout">
      <div className="sidebar">
        <div className="logo">☰</div>
        <ul className="menu">
          <li onClick={() => navigate("/main")}><FaHome /></li>
          <li onClick={() => navigate("/profile")}><FaUser /></li>
          <li onClick={() => navigate("/reports")}><FaChartBar /></li>
          <li onClick={() => navigate("/calendar")}><FaCalendar /></li>
          <li onClick={() => navigate("/notifications")}><FaBell /></li>
          <li onClick={() => navigate("/settings")}><FaCog /></li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <span className="company-name">TRƯỜNG THPT CHUYÊN TTHG</span>
          <div className="user-info">
            <FaBell className="icon" />
            <span className="user-name">{username || "Người dùng"}</span>
            <span className="user-role">Product Manager</span>
            <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
        <div className="content-area"></div>
      </div>
    </div>
  );
};

export default MainScreen;
