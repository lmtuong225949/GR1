import React, { useState } from "react";
import TimetableView from "./TimetableForGV";
import AssignmentView from "./AssignmentForGV";
import "../styles/Schedule.css";

const Schedule = () => {
  const [activeView, setActiveView] = useState("schedule");

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
        </div>
      </div>

      {activeView === "schedule" && <TimetableView />}
      {activeView === "assign" && <AssignmentView />}
    </div>
  );
};

export default Schedule;
