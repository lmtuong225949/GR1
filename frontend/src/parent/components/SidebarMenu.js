import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaCalendar,
  FaChartBar,
  FaBell,
  FaCog,
} from "react-icons/fa";
import "../../components/ui/styles/SidebarMenu.css";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: "/parent", icon: <FaHome />, label: "Trang chính" },
    { path: "/parent/schedule", icon: <FaCalendar />, label: "Thời khóa biểu" },
    { path: "/parent/grades", icon: <FaChartBar />, label: "Điểm số" },
    { path: "/parent/notifications", icon: <FaBell />, label: "Thông báo" },
    { path: "/parent/settings", icon: <FaCog />, label: "Cài đặt" },
  
    
    
    
    
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
