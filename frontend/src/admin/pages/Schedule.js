import React, { useState } from "react";
import TimetableView from "./TimetableView";
import AssignmentView from "./AssignmentView";
import { useNavigate } from "react-router-dom";
import "../styles/Schedule.css";

const Schedule = () => {
  const [activeView, setActiveView] = useState("schedule");
  const navigate = useNavigate();

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h2>Thời khóa biểu & Phân công giảng dạy</h2>
        <div className="toggle-buttons">
          <button
            onClick={() => setActiveView("schedule")}
            className={`toggle-btn ${activeView === "schedule" ? "active" : ""}`}
          >
            Thời khóa biểu
          </button>
          <button
            onClick={() => setActiveView("assign")}
            className={`toggle-btn ${activeView === "assign" ? "active" : ""}`}
          >
            Phân công giảng dạy
          </button>
          <button
            className="schedule-generate-btn"
            onClick={() => navigate("/admin/schedule/generate")}
          >
            Tạo TKB mới
          </button>
        </div>
      </div>

      {/* Render theo state chứ không điều hướng */}
      {activeView === "schedule" && <TimetableView />}
      {activeView === "assign" && <AssignmentView />}
    </div>
  );
};

export default Schedule;
