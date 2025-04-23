import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import "../style/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "123456") {
      localStorage.setItem("username", username);
      navigate("/main"); 
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
      <img src="/truonghoc.jpg" alt="Background" />
      </div>
      <div className="right-panel">
        <h2>Đăng Nhập</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Tài khoản" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Đăng Nhập</button>
          <a href="#">Quên mật khẩu</a>
        </form>
      </div>
    </div>
  );
};

export default Login;
