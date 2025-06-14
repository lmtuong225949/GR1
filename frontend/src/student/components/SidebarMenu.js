import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaBell,
  FaCog,
  FaBook,
} from "react-icons/fa";
import "../styles/SidebarMenu.css";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: "/student", icon: <FaHome />, label: "Trang chính" },
    { path: "/student/scores", icon: <FaClipboardList />, label: "Xem điểm" },
    { path: "/student/document", icon: <FaBook />, label: "Tài liệu - Bài giảng" },
    { path: "/student/notifications", icon: <FaBell />, label: "Thông báo" },
    { path: "/student/settings", icon: <FaCog />, label: "Cài đặt" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <div className="logo" onClick={toggleSidebar}>
        ☰
      </div>
      <ul className="menu">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`menu-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {isOpen && <span className="label">{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarMenu;
