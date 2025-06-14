import React, { useEffect, useState } from "react";
import "../styles/Settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return;

    // Gọi API để lấy thông tin người dùng
    fetch(`http://localhost:5000/api/users/${storedUser.id}`)
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => {
        console.error("Lỗi lấy thông tin user:", err);
        setUser(null);
      });

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token trong localStorage");
      setLoginHistory([]);
      return;
    }

    // Gọi API để lấy lịch sử đăng nhập từ bảng history
    fetch(`http://localhost:5000/api/auth/login-history`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLoginHistory(data);
        } else if (data.history && Array.isArray(data.history)) {
          setLoginHistory(data.history);
        } else {
          console.warn("Định dạng dữ liệu lịch sử không hợp lệ:", data);
          setLoginHistory([]);
        }
      })
      .catch(err => {
        console.error("Lỗi lấy lịch sử đăng nhập:", err);
        setLoginHistory([]);
      });
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { current, new: newPass, confirm } = passwordData;

    if (newPass !== confirm) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đổi mật khẩu thành công!");
        setPasswordData({ current: "", new: "", confirm: "" });
      } else {
        alert(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      alert("Lỗi kết nối đến server khi đổi mật khẩu");
    }
  };

  return (
    <div className="settings-page">
      <h2>Cài đặt tài khoản</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? "active" : ""}>Hồ sơ</button>
        <button onClick={() => setActiveTab("history")} className={activeTab === "history" ? "active" : ""}>Lịch sử đăng nhập</button>
        <button onClick={() => setActiveTab("password")} className={activeTab === "password" ? "active" : ""}>Đổi mật khẩu</button>
      </div>

      <div className="tab-content">
        {activeTab === "profile" && user && (
          <div className="profile-info">
            <p><strong>Họ tên:</strong> {user.hoten || "Chưa có"}</p>
            <p><strong>Tên đăng nhập:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email || "Chưa có"}</p>
            <p><strong>Vai trò:</strong> {user.role}</p>
          </div>
        )}

        {activeTab === "history" && (
          <>
            {loginHistory.length === 0 ? (
              <p>Không có lịch sử đăng nhập.</p>
            ) : (
              <ul className="login-history">
                {loginHistory.map((entry, idx) => (
                  <li key={idx}>
                    <strong>{new Date(entry.timestamp || entry.login_time).toLocaleString("vi-VN")}</strong>
                    {entry.ip && ` - IP: ${entry.ip}`}
                    {entry.device && ` - Thiết bị: ${entry.device}`}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {activeTab === "password" && (
          <form className="password-form" onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              required
            />
            <button type="submit">Đổi mật khẩu</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;
