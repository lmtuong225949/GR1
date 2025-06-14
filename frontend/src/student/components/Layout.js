import React, { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import Header from "./Header";
import "../styles/Layout.css";

const MainLayout = () => {
  const [username, setUsername] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUsername(user.username || "");
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login"); // chuyển về trang login nếu chưa đăng nhập
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="main-layout">
      <Header
        username={username}
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />
      <div className="layout-body">
        <SidebarMenu isOpen={isSidebarOpen} />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
