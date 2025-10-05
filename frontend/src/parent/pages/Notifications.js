import React, { useState, useEffect } from "react";
import "../styles/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="notifications-page">
      <h2>Thông báo</h2>

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
