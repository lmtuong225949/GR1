// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './login/Login';
import AdminRoutes from './router/AdminRouter';
import TeacherRoutes from './router/TeacherRouter';
import StudentRoutes from './router/StudentRouter';
import Unauthorized from './router/Unauthorized';
import ParentRoutes from './router/ParentRouter';
import Dashboard from './router/DashboardRouter';
import Forgotpw from './login/Forgotpw';

// Multi-user session management
const USER_SESSION_KEY = 'activeUserSession';
const ALL_USERS_KEY = 'allUserSessions';

const App = () => {
  const [activeUser, setActiveUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Load active user and all users from localStorage
    const activeUserData = localStorage.getItem(USER_SESSION_KEY);
    const allUsersData = localStorage.getItem(ALL_USERS_KEY);
    
    if (activeUserData) {
      setActiveUser(JSON.parse(activeUserData));
    }
    
    if (allUsersData) {
      setAllUsers(JSON.parse(allUsersData));
    }
  }, []);

  const switchUser = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setActiveUser(user);
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      window.location.reload(); // Reload to update app state
    }
  };

  const addUser = (userData) => {
    const newAllUsers = [...allUsers.filter(u => u.id !== userData.id), userData];
    setAllUsers(newAllUsers);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(newAllUsers));
    setActiveUser(userData);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
  };

  const removeUser = (userId) => {
    const newAllUsers = allUsers.filter(u => u.id !== userId);
    setAllUsers(newAllUsers);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(newAllUsers));
    
    if (activeUser?.id === userId) {
      const remainingUsers = newAllUsers;
      if (remainingUsers.length > 0) {
        switchUser(remainingUsers[0].id);
      } else {
        setActiveUser(null);
        localStorage.removeItem(USER_SESSION_KEY);
      }
    }
  };

  // Provide multi-user context to child components
  const multiUserContext = {
    activeUser,
    allUsers,
    switchUser,
    addUser,
    removeUser,
    isMultiUserMode: allUsers.length > 1
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Dashboard" replace />} />
        <Route path="/Dashboard/*" element={<Dashboard />} />
        <Route path="/login" element={<Login onLogin={addUser} />} /> 
        <Route path="/admin/*" element={<AdminRoutes multiUserContext={multiUserContext} />} />
        <Route path="/teacher/*" element={<TeacherRoutes multiUserContext={multiUserContext} />} />
        <Route path="/student/*" element={<StudentRoutes multiUserContext={multiUserContext} />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/parent/*" element={<ParentRoutes multiUserContext={multiUserContext} />} />
        <Route path="/forgot-password" element={<Forgotpw />} />
        {/* Route không tìm thấy, chuyển về login hoặc 404 */}
        <Route path="*" element={<Navigate to="/Dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
