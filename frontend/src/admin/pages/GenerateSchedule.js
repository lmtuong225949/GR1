import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Schedule.css";
import { Modal, Button } from 'react-bootstrap';

const GenerateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!window.confirm("Bạn có chắc muốn tạo thời khóa biểu mới?")) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:5000/api/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Phản hồi từ server không phải JSON");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi tạo thời khóa biểu");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Lỗi tạo TKB:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo thời khóa biểu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/admin/schedule');
  };

  const handleClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="schedule-container">
      <Modal show={showSuccessModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Thành công</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Thời khóa biểu đã được tạo thành công!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSuccessConfirm}>
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="schedule-card">
        <h2 className="schedule-title">Tạo Thời Khóa Biểu Mới</h2>
        <p className="schedule-description">
          Nhấn nút bên dưới để sinh thời khóa biểu tự động dựa trên các ràng buộc.
        </p>
        {error && <div className="schedule-error">{error}</div>}
        <button
          className="schedule-button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <div className="schedule-loading">
              <span className="spinner"></span>
              Đang tạo...
            </div>
          ) : (
            "Tạo Thời Khóa Biểu"
          )}
        </button>
      </div>
    </div>
  );
};

export default GenerateSchedule;
