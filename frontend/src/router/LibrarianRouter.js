// src/router/AdminRoutes.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../librarian/components/Layout";

import DashboardLibrarian from "../librarian/pages/Dashboard";
import Students from "../librarian/pages/Students";
import Teachers from "../librarian/pages/Teachers";
import Classes from "../librarian/pages/Classes";
import StudentByClass from "../librarian/pages/StudentByClass";
import Schedule from "../librarian/pages/Schedule";
import GenerateSchedule from "../librarian/pages/GenerateSchedule";
import Scores from "../librarian/pages/Scores";
import Reports from "../librarian/pages/Reports";
import Notifications from "../librarian/pages/Notifications";
import LibrarianProfile from "../librarian/pages/LibrarianProfile";
import Settings from "../librarian/pages/Settings";
import ScoreDetail from "../librarian/pages/ScoreDetail";
import DocumentCreate from "../librarian/pages/Creater";
import DocumentList from "../librarian/pages/DocumentList";

const LibrarianRoutes = () => {
  // Lấy user từ localStorage
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = JSON.parse(userStr);
  } catch {}

  // Kiểm tra role librarian
  if (!user || user.role?.toLowerCase() !== "librarian") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Layout chính cho admin */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardLibrarian />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:malop" element={<StudentByClass />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="schedule/generate" element={<GenerateSchedule />} />
        <Route path="scores" element={<Scores />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<LibrarianProfile />} />
        <Route path="scores/:mahs" element={<ScoreDetail />} />
        <Route path="document" element={<DocumentList />} />
        <Route path="document/create" element={<DocumentCreate />} /> 

        {/* Nếu không tìm thấy route con, chuyển về dashboard */}
        <Route path="*" element={<Navigate to="/librarian" replace />} />
      </Route>
    </Routes>
  );
};

export default LibrarianRoutes;
