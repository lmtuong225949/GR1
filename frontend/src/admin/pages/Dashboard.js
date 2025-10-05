import React, { useState, useEffect } from "react";
import { FaUsers, FaChalkboardTeacher, FaSchool, FaChartPie } from "react-icons/fa";
import "../../components/ui/styles/Card.css";
import "../../components/ui/styles/Button.css";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [studentRes, teacherRes, classRes] = await Promise.all([
          fetch('http://localhost:5000/api/students/count'),
          fetch('http://localhost:5000/api/teachers/count'),
          fetch('http://localhost:5000/api/classes/count')
        ]);

        // Check for errors first
        if (!studentRes.ok) {
          throw new Error(`Lỗi khi lấy số lượng học sinh: ${studentRes.status}`);
        }
        if (!teacherRes.ok) {
          throw new Error(`Lỗi khi lấy số lượng giáo viên: ${teacherRes.status}`);
        }
        if (!classRes.ok) {
          throw new Error(`Lỗi khi lấy số lượng lớp: ${classRes.status}`);
        }

        // Get all responses
        const [studentData, teacherData, classData] = await Promise.all([
          studentRes.json(),
          teacherRes.json(),
          classRes.json()
        ]);

        // Validate data structure
        const stats = {
          students: studentData?.count || studentData?.data?.count || 0,
          teachers: teacherData?.count || teacherData?.data?.count || 0,
          classes: classData?.count || classData?.data?.count || 0
        };

        if (stats.students === 0 && stats.teachers === 0 && stats.classes === 0) {
          throw new Error('Không tìm thấy dữ liệu');
        }

        setStats(stats);
      } catch (err) {
        const errorMessage = err.message || 'Lỗi không xác định khi lấy dữ liệu';
        setError(errorMessage);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Trang chính - Tổng quan</h2>
        <div className="cards">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="card loading" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h2>Trang chính - Tổng quan</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Trang chính - Tổng quan</h2>
      <div className="cards">
        <div className="card" onClick={() => window.location.href = "/admin/students"}>
          <FaUsers className="icon" />
          <div className="card-content">
            <h3>Học sinh</h3>
            <p>{stats.students.toLocaleString()}</p>
          </div>
        </div>

        <div className="card" onClick={() => window.location.href = "/admin/teachers"}>
          <FaChalkboardTeacher className="icon" />
          <div className="card-content">
            <h3>Giáo viên</h3>
            <p>{stats.teachers.toLocaleString()}</p>
          </div>
        </div>

        <div className="card" onClick={() => window.location.href = "/admin/classes"}>
          <FaSchool className="icon" />
          <div className="card-content">
            <h3>Lớp học</h3>
            <p>{stats.classes.toLocaleString()}</p>
          </div>
        </div>

        <div className="card" onClick={() => window.location.href = "/admin/reports"}>
          <FaChartPie className="icon" />
          <div className="card-content">
            <h3>Thống kê</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
