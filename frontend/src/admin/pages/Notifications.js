import React, { useState, useEffect } from "react";
import "../styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [replies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    recipientRole: "all",
  });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // 👉 trạng thái xem chi tiết

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/roles");
        const data = await res.json();
        setRoles(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách vai trò:", error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications");
        if (!res.ok) throw new Error("Lỗi khi lấy thông báo");
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, []);

  const toggleForm = () => {
    setShowForm(!showForm);
    setSendError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setSendError("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch("http://localhost:5000/api/notifications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Lỗi khi gửi thông báo.");
      }

      const newNotification = await response.json();
      setNotifications((prev) => [newNotification, ...prev]);
      setFormData({ title: "", content: "", recipientRole: "all" });
      setShowForm(false);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="notifications-page">
      <h2>Thông báo</h2>

      <button className="btn btn-primary" onClick={toggleForm}>
        {showForm ? "Đóng" : "Gửi Thông Báo Mới"}
      </button>

      {showForm && (
        <form className="form-container" onSubmit={handleSend}>
          <h3>Gửi Thông Báo Mới</h3>

          <label htmlFor="title">Tiêu đề:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={sending}
            required
          />

          <label htmlFor="content">Nội dung:</label>
          <textarea
            id="content"
            name="content"
            rows="4"
            value={formData.content}
            onChange={handleChange}
            disabled={sending}
            required
          />

          <label htmlFor="recipientRole">Gửi đến:</label>
          <select
            id="recipientRole"
            name="recipientRole"
            value={formData.recipientRole}
            onChange={handleChange}
            disabled={sending}
          >
            <option value="all">Tất cả</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>

          {sendError && <p style={{ color: "red" }}>{sendError}</p>}

          <button type="submit" disabled={sending}>
            {sending ? "Đang gửi..." : "Gửi"}
          </button>
        </form>
      )}

      <h3>Danh sách thông báo</h3>
      {notifications ? (
        <ul className="notifications-list">
          {notifications.length === 0 ? (
            <li>Chưa có thông báo nào.</li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id} className="notification-item">
                <div
                  className="notification-title clickable"
                  onClick={() => toggleExpand(notification.id)}
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                {notification.title}
                </div>
                <p className="notification-date">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
                {expandedId === notification.id && (
                  <div className="notification-content">
                    <p>{notification.content}</p>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      ) : (
        <div>Đang tải thông báo...</div>
      )}
    </div>
  );
};

export default Notifications;