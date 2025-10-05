import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import '../styles/OutHeader.css';

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/login');
  };

  const location = useLocation();
  const isTuyenSinhActive = location.pathname.startsWith('/dashboard/recruitment') || 
                          location.pathname.startsWith('/dashboard/rules-test') || 
                          location.pathname.startsWith('/dashboard/rules-exam') ||
                          location.pathname.startsWith('/dashboard/guide');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="ourheader">
      <div className="ourheader-content">
        <div className="ourlogo">
          <img src="/TTHG school.png" alt="TTHG School Logo" />
        </div>
        <div className="ourname">
          <h1>TRƯỜNG THPT TRẦN ĐẠI NGHĨA</h1>
        </div>
      </div>
      <ul className="ourmenu">
        <li><NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>Trang chủ</NavLink></li>
        <li><NavLink to="/dashboard/aboutus" className={({ isActive }) => isActive ? 'active' : ''}>Giới thiệu</NavLink></li>
        <li><NavLink to="/dashboard/program" className={({ isActive }) => isActive ? 'active' : ''}>Chương trình</NavLink></li>
        <div className="ourdropdown-container" ref={dropdownRef}>
          <button
            className={`ourdropdown-button ${isTuyenSinhActive || showDropdown ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowDropdown(!showDropdown);
              }
            }}
            aria-haspopup="true"
            aria-expanded={showDropdown}
          >
            Tuyển sinh
            <span className={`ourdropdown-arrow ${showDropdown ? 'rotate' : ''}`} aria-hidden="true">▼</span>
          </button>
          
          <div className={`ourdropdown-content ${showDropdown ? 'open' : ''}`}>
            <NavLink 
              to="/dashboard/rules-test" 
              className="ourdropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              Quy chế tuyển sinh
            </NavLink>
            <NavLink 
              to="/dashboard/rules-exam" 
              className="ourdropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              Quy chế thi THPT
            </NavLink>
            <NavLink 
              to="/dashboard/guide" 
              className="ourdropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              Hướng dẫn tuyển sinh
            </NavLink>
            <NavLink 
              to="/dashboard/recruitment" 
              className="ourdropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              Đăng ký tuyển sinh
            </NavLink>
          </div>
        </div>
      </ul>
      <div className="ouruser-auth">
        <button type="button" onClick={handleLoginClick}>
          Đăng nhập
        </button>
      </div>
    </header>
  );
};
export default Header;
