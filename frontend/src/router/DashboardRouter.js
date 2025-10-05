import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../dashboard/components/Layoutdb';
import DashboardPage from '../dashboard/pages/Dashboard';
import GioiThieu from '../dashboard/pages/GioiThieu';
import ChuongTrinh from '../dashboard/pages/ChuongTrinh';
import Quychets from '../dashboard/pages/Quychets';
import Quyche from '../dashboard/pages/Quyche';
import Huongdan from '../dashboard/pages/Huongdan';
import TuyenSinh from '../dashboard/pages/TuyenSinh';

function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/aboutus" element={<GioiThieu />} />
        <Route path="/program" element={<ChuongTrinh />} />
        <Route path="/rules-test" element={<Quychets />} />
        <Route path="/rules-exam" element={<Quyche />} />
        <Route path="/guide" element={<Huongdan />} />
        <Route path="/recruitment" element={<TuyenSinh />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
}

export default DashboardRoutes;
