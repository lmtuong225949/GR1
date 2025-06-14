import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCog,
  FaChartBar,
  FaCalendar,
  FaBell,
  FaUsers,
  FaClipboardList,
  FaChalkboardTeacher,
  FaSchool,
  FaUserShield,
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
    { path: "/admin", icon: <FaHome />, label: "Trang chính" },
    { path: "/admin/students", icon: <FaUsers />, label: "Quản lý học sinh" },
    { path: "/admin/teachers", icon: <FaChalkboardTeacher />, label: "Quản lý giáo viên" },
    { path: "/admin/classes", icon: <FaSchool />, label: "Quản lý lớp học" },
    { path: "/admin/schedule", icon: <FaCalendar />, label: "Thời khóa biểu" },
    { path: "/admin/scores", icon: <FaClipboardList />, label: "Quản lý điểm" },
    { path: "/admin/document", icon: <FaBook />, label: "Quản lý tài liệu" },
    { path: "/admin/notifications", icon: <FaBell />, label: "Thông báo" },
    { path: "/admin/reports", icon: <FaChartBar />, label: "Báo cáo - Thống kê" },
    { path: "/admin/users", icon: <FaUserShield />, label: "Tài khoản người dùng" },
    { path: "/admin/settings", icon: <FaCog />, label: "Cài đặt" },
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
