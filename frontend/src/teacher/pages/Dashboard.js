import React from "react";
import "../styles/Dashboard.css";
import { FaUsers, FaChalkboardTeacher, FaSchool, FaChartPie } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Trang chính - Tổng quan</h2>
      <div className="cards">
          <button className="card" onClick={() => window.location.href = "/teacher/classes"}>
            <FaUsers className="icon" />
            <div>
              <h3>Lớp học</h3>
            </div>
          </button>
          <button className="card" onClick={() => window.location.href = "/teacher/schedule"}>
            <FaChalkboardTeacher className="icon" />
            <div>
              <h3>Phân công giảng dạy</h3>
            </div>
          </button>
          <button className="card" onClick={() => window.location.href = "/teacher/grading"}>
            <FaSchool className="icon" />
            <div>
              <h3>Nhập điểm</h3>
            </div>
          </button>
          <button className="card" onClick={() => window.location.href = "/teacher/reports"}>
            <FaChartPie className="icon" />
            <div>
              <h3>Thống kê</h3>
            </div>
          </button>
      </div>
    </div>
  );
};

export default Dashboard;
