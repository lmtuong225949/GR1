// src/router/Unauthorized.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Bạn không có quyền truy cập trang này</h2>
      <button onClick={() => navigate(-1)}>Quay lại</button>
      <button onClick={() => navigate('/login')}>Đăng nhập lại</button>
    </div>
  );
};

export default Unauthorized;
