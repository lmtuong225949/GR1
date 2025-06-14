import React, { useEffect, useState } from "react";
import "../styles/TeacherProfile.css";

const TeacherProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ email: "", sdt: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(stored);

    fetch(`http://localhost:5000/api/users/${parsedUser.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Không tìm thấy người dùng");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setFormData({ email: data.email || "", sdt: data.sdt || "" });
      })
      .catch(err => {
        console.error("Lỗi khi lấy thông tin user:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Cập nhật thất bại");
      }
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      setEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải thông tin...</p>;
  if (!user) return <p>Không tìm thấy thông tin người dùng.</p>;

  return (
    <div className="admin-profile-container">
      <h2>Thông Tin Quản Trị Viên</h2>
      <div className="profile-box">
        <div><strong>Họ tên:</strong> {user.hoten || "Không có"}</div>
        <div><strong>Tài khoản:</strong> {user.username}</div>
        <div><strong>Vai trò:</strong> {user.role}</div>

        <div>
          <strong>Email:</strong>{" "}
          {editing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          ) : (
            user.email || "Không có"
          )}
        </div>

        <div>
          <strong>SDT:</strong>{" "}
          {editing ? (
            <input
              type="text"
              name="sdt"
              value={formData.sdt}
              onChange={handleChange}
            />
          ) : (
            user.sdt || "Không có"
          )}
        </div>

        <div><strong>Trạng thái:</strong> {user.locked ? "Khóa" : "Mở khóa"}</div>

        <button onClick={() => (editing ? handleSave() : setEditing(true))} disabled={saving}>
          {editing ? (saving ? "Đang lưu..." : "Lưu") : "Chỉnh sửa"}
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;
