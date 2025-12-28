import React, { useState, useEffect } from "react";
import TimetableView from "./TimetableView";
import { useNavigate } from "react-router-dom";
import "../styles/SchedulePage.css";

const Schedule = () => {
  const navigate = useNavigate();
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/assignments/academic-years', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const years = data.data || data || [];
        setAcademicYears(years);
        
        // Auto-select current academic year (trangthai = true)
        const currentYear = years.find(year => year.trangthai === true);
        if (currentYear) {
          setSelectedYear(currentYear.id);
        }
      }
    } catch (err) {
      console.error('Error fetching academic years:', err);
    }
  };

  return (
    <div className="schedule-management-page">
      <div className="schedule-management-header">
        <h2>Thời khóa biểu</h2>
        <div className="schedule-management-filters">
          <div className="schedule-management-filter-group">
            <label htmlFor="year-select-header">Năm học:</label>
            <select
              id="year-select-header"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">Chọn năm học</option>
              {academicYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.namhoc} - {year.kyhoc}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="schedule-management-actions">
          <button
            className="schedule-management-generate-btn"
            onClick={() => navigate("/admin/schedule/generate")}
          >
            Tạo TKB mới
          </button>
        </div>
      </div>

      <TimetableView 
        selectedYear={selectedYear}
      />
    </div>
  );
};

export default Schedule;
