import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState([]); // Danh sách giáo viên & học sinh

  useEffect(() => {
    // Lấy thông tin user hiện tại
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser({
        name: "Chưa có tài khoản",
        email: "N/A",
        phone: "N/A",
        role: "student",
        avatar: "/default-avatar.png",
        className: "N/A",
        gpa: "N/A",
      });
    }

    // Nếu user là admin, lấy danh sách người dùng (giả lập từ localStorage hoặc API)
    if (storedUser?.role === "admin") {
      const users = JSON.parse(localStorage.getItem("userList")) || [
        { name: "Nguyễn Văn A", role: "teacher", email: "teacherA@gmail.com", phone: "0123456789", subject: "Toán" },
        { name: "Trần Thị B", role: "student", email: "studentB@gmail.com", phone: "0987654321", className: "10A1", gpa: "8.5" },
      ];
      setUserList(users);
    }
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img src={user?.avatar || "/default-avatar.png"} alt="Avatar" className="avatar" />
        <h2>{user.name}</h2>
        <p><strong>Vai trò:</strong> {user.role === "admin" ? "Quản trị viên" : user.role === "teacher" ? "Giáo viên" : "Học sinh"}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>

        {user.role === "teacher" && (
          <div>
            <h3>Môn dạy: {user.subject || "N/A"}</h3>
          </div>
        )}

        {user.role === "student" && (
          <div>
            <h3>Lớp: {user.className}</h3>
            <p><strong>GPA:</strong> {user.gpa}</p>
          </div>
        )}

        {user.role === "admin" && (
          <div className="user-list">
            <h3>Danh sách người dùng</h3>
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Vai trò</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Thông tin bổ sung</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((u, index) => (
                  <tr key={index}>
                    <td>{u.name}</td>
                    <td>{u.role === "teacher" ? "Giáo viên" : "Học sinh"}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>
                      {u.role === "teacher" ? `Môn: ${u.subject}` : `Lớp: ${u.className}, GPA: ${u.gpa}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate("/main")}>Quay lại</button>
      </div>
    </div>
  );
};

export default Profile;
