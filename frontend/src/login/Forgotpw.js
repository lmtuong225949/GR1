import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic email validation
    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi gửi yêu cầu');
      }

      setSuccess('Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu');
      setEmail('');
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', err);
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <img src="/truonghoc.jpg" alt="Background" />
      </div>
      <div className="right-panel">
        <h2>Quên Mật Khẩu</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <p style={{ marginBottom: '20px', textAlign: 'center' }}>
            Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
          
          <input
            type="email"
            placeholder="Địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          
          {error && <p className="error" style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
          {success && <p className="success" style={{ color: 'green', margin: '10px 0' }}>{success}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '15px' }}
          >
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
          </button>
          
          <div className="forgot-password" style={{ textAlign: 'center', marginTop: '15px' }}>
            <a 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              style={{ color: '#3498db', textDecoration: 'none' }}
            >
              Quay lại đăng nhập
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;