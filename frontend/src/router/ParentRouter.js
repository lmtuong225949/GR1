import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../parent/components/Layout";

import Dashboard from "../parent/pages/Dashboard";
import StudentSchedule from "../parent/pages/ParentSchedule";
import ParentProfile from "../parent/pages/ParentProfile";
import StudentScoreView from "../parent/pages/ParentScoreView";
import PrScoreDetail from "../parent/pages/PrScoreDetail";
import Notifications from "../parent/pages/Notifications";
import Settings from "../parent/pages/Settings";

const ParentRoutes = () => {
    const userStr = localStorage.getItem("user");
    let user = null;
    try {
        user = JSON.parse(userStr);
    } catch {}

    if (!user || user.role?.toLowerCase() !== "parent") {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<ParentProfile />} />    
                <Route path="schedule" element={<StudentSchedule />} />
                <Route path="grades" element={<StudentScoreView />} />
                <Route path="grades/:mahs/:hocky/:namhoc" element={<PrScoreDetail />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
}

export default ParentRoutes;
