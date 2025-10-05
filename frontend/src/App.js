// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './login/Login';
import AdminRoutes from './router/AdminRouter';
import TeacherRoutes from './router/TeacherRouter';
import StudentRoutes from './router/StudentRouter';
import Unauthorized from './router/Unauthorized';
import LibrarianRoutes from './router/LibrarianRouter';
import ParentRoutes from './router/ParentRouter';
import Dashboard from './router/DashboardRouter';
import Forgotpw from './login/Forgotpw';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/Dashboard/*" element={<Dashboard />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/teacher/*" element={<TeacherRoutes />} />
      <Route path="/student/*" element={<StudentRoutes />} />
      <Route path="/librarian/*" element={<LibrarianRoutes />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/parent/*" element={<ParentRoutes />} />
      <Route path="/forgot-password" element={<Forgotpw />} />
      {/* Route không tìm thấy, chuyển về login hoặc 404 */}
      <Route path="*" element={<Navigate to="/Dashboard" replace />} />
    </Routes>
  </Router>
);

export default App;
