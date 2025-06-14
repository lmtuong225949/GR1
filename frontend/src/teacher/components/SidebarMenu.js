import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaCalendar,
  FaBell,
  FaChartBar,
  FaCog,  
  FaSchool,
  FaBook
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
    { path: "/teacher", icon: <FaHome />, label: "Trang chính" },
    { path: "/teacher/classes", icon: <FaSchool />, label: "Quản lý lớp học" },
    { path: "/teacher/schedule", icon: <FaCalendar />, label: "Phân công giảng dạy" },
    { path: "/teacher/grading", icon: <FaClipboardList />, label: "Nhập điểm" },
    { path: "/teacher/reports", icon: <FaChartBar />, label: "Thống kê điểm" },
    { path: "/teacher/document", icon: <FaBook />, label: "Quản lý tài liệu" },
    { path: "/teacher/notifications", icon: <FaBell />, label: "Thông báo" },
    { path: "/teacher/settings", icon: <FaCog />, label: "Cài đặt" },
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
