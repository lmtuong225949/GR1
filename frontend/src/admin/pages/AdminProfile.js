import React, { useEffect, useState } from "react";
import "../styles/AdminProfile.css";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ email: "", sdt: "" });
  const [saving, setSaving] = useState(false);
  
  // Helper to render initials in avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || "?";
  };

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
      <h2>Hồ Sơ Quản Trị</h2>

      {/* Header section with avatar and primary info */}
      <div className="profile-header">
        <div className="avatar" aria-label="avatar">
          {getInitials(user.hoten || user.username)}
        </div>
        <div className="header-info">
          <div className="name-row">
            <span className="name">{user.hoten || "Không có"}</span>
            <span className={`role-badge ${user.role?.toLowerCase() || ""}`}>{user.role}</span>
          </div>
          <div className="sub-row">
            <span className="username">@{user.username}</span>
            <span className={`status-badge ${user.locked ? "locked" : "active"}`}>
              {user.locked ? "Đang khóa" : "Đang hoạt động"}
            </span>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="profile-grid">
        <div className="field">
          <label>Họ tên</label>
          <div className="value">{user.hoten || "Không có"}</div>
        </div>
        <div className="field">
          <label>Tài khoản</label>
          <div className="value">{user.username}</div>
        </div>
        <div className="field">
          <label>Email</label>
          <div className="value">
            {editing ? (
              <input
                type="email"
                name="email"
                placeholder="email@domain.com"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              user.email || "Không có"
            )}
          </div>
        </div>
        <div className="field">
          <label>SDT</label>
          <div className="value">
            {editing ? (
              <input
                type="text"
                name="sdt"
                placeholder="090xxxxxxx"
                value={formData.sdt}
                onChange={handleChange}
              />
            ) : (
              user.sdt || "Không có"
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="profile-actions">
        {editing ? (
          <>
            <button className="btn primary" onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button className="btn" onClick={() => { setEditing(false); setFormData({ email: user.email || "", sdt: user.sdt || "" }); }} disabled={saving}>
              Hủy
            </button>
          </>
        ) : (
          <button className="btn primary" onClick={() => setEditing(true)}>
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
