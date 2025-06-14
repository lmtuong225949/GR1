// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './login/Login';
import AdminRoutes from './router/AdminRouter';
import TeacherRoutes from './router/TeacherRouter';
import StudentRoutes from './router/StudentRouter';
import Unauthorized from './router/Unauthorized';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} /> 
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/teacher/*" element={<TeacherRoutes />} />
      <Route path="/student/*" element={<StudentRoutes />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Route không tìm thấy, chuyển về login hoặc 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Router>
);

export default App;
