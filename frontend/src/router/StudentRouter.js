// src/router/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../student/components/Layout";
import Settings from "../student/pages/Settings";
import Notifications from "../student/pages/Notifications";
import StudentProfile from "../student/pages/StudentProfile";
import StudentSchedule from "../student/pages/StudentSchedule";
import Dashboard from "../student/pages/Dashboard";
import DocumentList from "../student/pages/DocumentList";
import StudentScoreView from "../student/pages/StudentScoreView";
import ScoreDetail from "../student/pages/ScoreDetail"; 

const StudentRoutes = () => {
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {}

  if (!user || user.role?.toLowerCase() !== "student") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Layout chính cho admin */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="document" element={<DocumentList/>} />
        <Route path="scores" element={<StudentScoreView />} />
        <Route path="scores/:hocky/:namhoc" element={<ScoreDetail />} />
        {/* Nếu không tìm thấy route con, chuyển về dashboard */}
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
