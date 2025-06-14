// src/router/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../teacher/components/Layout";

import DashboardTeacher from "../teacher/pages/Dashboard";
import ClassPage from "../teacher/pages/Classer";
import TeacherProfile from "../teacher/pages/TeacherProfile";
import ClassScores from "../teacher/pages/ClassScores";
import ScoreDetailPage from "../teacher/pages/ScoreDetailPage"; 
import Settings from "../teacher/pages/Settings";
import Notifications from "../teacher/pages/Notifications";
import TeacherReportPage from "../teacher/pages/TeacherReportPage";
import Schedule from "../teacher/pages/Schedule";
import Grading from "../teacher/pages/Grading";
import StudentListByClass from "../teacher/pages/StudentListByClass";
import DocumentList from "../teacher/pages/DocumentList";
import DocumentCreate from "../teacher/pages/Creater";

const TeacherRoutes = () => {
  // Lấy user từ localStorage
  const userStr = localStorage.getItem("user");
  let user = null;

  try {     
    user = JSON.parse(userStr);
  } catch {}

  // Kiểm tra role admin
  if (!user || user.role?.toLowerCase() !== "teacher") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Layout chính cho admin */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardTeacher />} />
        <Route path="classes" element={<ClassPage />} />
        <Route path="classes/:malop" element={<ClassScores />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="scores/:mahs" element={<ScoreDetailPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />  
        <Route path="reports" element={<TeacherReportPage />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="grading" element={<Grading />} />
        <Route path="grading/:lopid" element={<StudentListByClass />} />
        <Route path="document" element={<DocumentList />} />
        <Route path="document/create" element={<DocumentCreate />} />
        {/* Nếu không tìm thấy route con, chuyển về dashboard */}
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Route>
    </Routes>
  );
};

export default TeacherRoutes;
