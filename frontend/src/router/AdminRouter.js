// src/router/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../admin/components/Layout";

import DashboardAdmin from "../admin/pages/Dashboard";
import Students from "../admin/pages/Students";
import Teachers from "../admin/pages/Teachers";
import Classes from "../admin/pages/Classes";
import StudentByClass from "../admin/pages/StudentByClass";
import Schedule from "../admin/pages/Schedule";
import GenerateSchedule from "../admin/pages/GenerateSchedule";
import Scores from "../admin/pages/Scores";
import Reports from "../admin/pages/Reports";
import Notifications from "../admin/pages/Notifications";
import Users from "../admin/pages/Users";
import Settings from "../admin/pages/Settings";
import AdminProfile from "../admin/pages/AdminProfile";
import ScoreDetail from "../admin/pages/ScoreDetail";
import DocumentCreate from "../admin/pages/Creater";
import DocumentList from "../admin/pages/DocumentList";

const AdminRoutes = () => {
  // Lấy user từ localStorage
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {}

  // Kiểm tra role admin
  if (!user || user.role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Layout chính cho admin */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardAdmin />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:malop" element={<StudentByClass />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="schedule/generate" element={<GenerateSchedule />} />
        <Route path="scores" element={<Scores />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<Users />} />  
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="scores/:mahs" element={<ScoreDetail />} />
        <Route path="document" element={<DocumentList />} />
        <Route path="document/create" element={<DocumentCreate />} /> 

        {/* Nếu không tìm thấy route con, chuyển về dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
